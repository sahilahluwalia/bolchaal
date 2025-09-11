import {
  publicProcedure,
  router,
  privateProcedure,
  createTRPCContext,
  AppContext,
} from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { zod } from "@repo/common-utils";
const { z } = zod;
import { Prompts } from "@repo/common-utils/prompt";
import {
  LessonCreateInputObjectSchema,
  prismaClient,
  LessonCreateInputObjectZodSchema,
  LessonResultSchema,
} from "@repo/db/client";
import { TRPCError } from "@trpc/server";
import { generateToken } from "../utils/auth";
import { randomBytes } from "crypto";
import { dotenv } from "@repo/common-utils";
import cors from "cors";
import { ai } from "@repo/common-utils";
const { generateObject } = ai;
import { routeMessageQueue ,QUEUE_NAMES} from "@repo/bullmq/index";
dotenv.config();
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";
import { observable } from "@trpc/server/observable";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return { message: "Hello World" };
  }),
  bye: privateProcedure.query(() => {
    return { message: "Hello World" };
  }),
  signUp: publicProcedure
    .input(
      z.object({
        email: z.email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().optional(),
      })
    )
    .output(
      z.object({
        message: z.string(),
        accessToken: z.string(),
        role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { email, password, name },
        ctx,
      } = opts;

      // Check if user already exists
      const existingUser = await prismaClient.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const user = await prismaClient.user.create({
        data: {
          email,
          password, // TODO: Hash password before storing
          ...(name && { name }),
        },
      });

      const accessToken = await generateToken({
        id: user.id,
        role: user.role,
      });

      return {
        message: "Sign up successful",
        accessToken,
        role: user.role,
      };
    }),
    test: publicProcedure.subscription(async (opts) => {
      
      return observable((subscriber) => {
        setInterval(() => {
          subscriber.next(Math.random());
        }, 1000);
      }); 
    }),
    
  chat: privateProcedure
    .input(
      z.object({
        classroomId: z.string(),
        lessonId: z.string(),
        content: z.string(),
        type: z.enum(["TEXT", "AUDIO"]),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { classroomId, lessonId, content, type },
        ctx: { userId },
      } = opts;
      console.log(lessonId)
      const chatSession = await prismaClient.chatSession.findUnique({
        where: { studentId_classroomId_lessonId:{
          studentId: userId,
          classroomId: classroomId,
          lessonId: lessonId,
        }},
        select: {
          id: true,
        },
      });
      console.log("chatSession", chatSession);
      if (!chatSession) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chat session not found" });
      }
      await routeMessageQueue.add(QUEUE_NAMES.routeMessageQueue, {
        classroomId,
        lessonId,
        content,
        type,
        userId,
        chatSessionId: chatSession.id,
      });
      return { message: "Message sent successfully" };

      // const lesson = await prismaClient.lesson.findFirst({
      //   where: { id: lessonId },
      // });
      // if (!lesson) {
      //   throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      // }

      // const {
      //   purpose,
      //   keyVocabulary,
      //   keyGrammar,
      //   studentTask,
      //   otherInstructions,
      // } = lesson;
      // const prompt = Prompts.systemPrompt.AIStudentConversationPrompt({
      //   purpose,
      //   keyVocabulary,
      //   keyGrammar,
      //   studentTask,
      //   otherInstructions,
      // });
      // const result = await generateObject({
      //   model: "gpt-4.1-nano",
      //   schema: z.object({
      //     content: z.string(),
      //   }),
      //   system: prompt,
      //   messages: [{ role: "user", content }],
      // });

      // return { content: result.object.content };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .output(
      z.object({
        message: z.string(),
        accessToken: z.string(),
        role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { email, password },
        ctx,
      } = opts;
      const user = await prismaClient.user.findFirst({
        select: {
          id: true,
          role: true,
        },
        where: {
          email: email,
          password: password,
        },
      });
      console.log(user);
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });

      const accessToken = await generateToken(user);

      return {
        message: "Sign in successful",
        accessToken,
        role: user.role,
      };
    }),
  logout: publicProcedure.mutation(async () => {
    // Stateless logout when only using access tokens
    return { message: "Logged out successfully" };
  }),
  generateAILessonContent: publicProcedure
    .input(
      z.object({
        title: z.string(),
        purpose: z.string(),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { title, purpose },
      } = opts;
      const lessonContentSchema = z.object({
        keyVocabulary: z.string(),
        keyGrammar: z.string(),
        studentTask: z.string(),
        reminderMessage: z.string(),
        otherInstructions: z.string(),
      });
      const result = await generateObject({
        model: "gpt-4.1-nano",
        schema: lessonContentSchema,
        system: Prompts.systemPrompt.AILessonContentPrompt,
        messages: [
          {
            role: "user",
            content: `Teacher's title: ${title}\nTeacher's purpose: ${purpose}`,
          },
        ],
      });
      return { lessonContent: result.object };
    }),
  createLesson: privateProcedure
    .input(
      LessonCreateInputObjectZodSchema.omit({
        teacher: true,
        classroomLessons: true,
      })
    )
    .mutation(async (opts) => {
      const {
        input: {
          title,
          purpose,
          keyVocabulary,
          keyGrammar,
          studentTask,
          reminderMessage,
          otherInstructions,
          speakingModeOnly,
          autoCheckIfLessonCompleted,
        },
      } = opts;
      try {
        const lesson = await prismaClient.lesson.create({
          data: {
            title,
            purpose,
            keyVocabulary,
            keyGrammar,
            studentTask,
            reminderMessage,
            otherInstructions,
            speakingModeOnly,
            autoCheckIfLessonCompleted,
            teacherId: opts.ctx.userId,
          },
        });
        console.log(lesson);

        return { id: lesson.id };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lesson",
        });
      }
    }),
  getLessons: privateProcedure.query(async (opts) => {
    try {
      const lessons = await prismaClient.lesson.findMany({
        where: {
          teacherId: opts.ctx.userId,
        },
        // select: {
        // id: true,
        // title: true,
        // purpose: true,
        // speakingModeOnly: true,
        // keyVocabulary: true,
        // keyGrammar: true,
        // studentTask: true,
        // reminderMessage: true,
        // otherInstructions: true,
        // },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log(lessons);
      return lessons;
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get lessons",
      });
    }
  }),
  getLesson: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      try {
        const lesson = await prismaClient.lesson.findFirst({
          where: {
            id: opts.input.id,
            teacherId: opts.ctx.userId,
          },
          include: {
            classroomLessons: {
              include: {
                classroom: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        });

        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        return lesson;
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get lesson",
        });
      }
    }),
  updateLesson: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        purpose: z.string().min(1, "Purpose is required"),
        speakingModeOnly: z.boolean(),
        keyVocabulary: z.string(),
        keyGrammar: z.string(),
        studentTask: z.string(),
        reminderMessage: z.string(),
        autoCheckIfLessonCompleted: z.boolean(),
        otherInstructions: z.string(),
      })
    )
    .mutation(async (opts) => {
      try {
        const {
          id,
          title,
          purpose,
          speakingModeOnly,
          keyVocabulary,
          keyGrammar,
          studentTask,
          reminderMessage,
          autoCheckIfLessonCompleted,
          otherInstructions,
        } = opts.input;

        const lesson = await prismaClient.lesson.update({
          where: {
            id,
            teacherId: opts.ctx.userId,
          },
          data: {
            title,
            purpose,
            speakingModeOnly,
            keyVocabulary,
            keyGrammar,
            studentTask,
            reminderMessage,
            autoCheckIfLessonCompleted,
            otherInstructions,
          },
        });

        return lesson;
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update lesson",
        });
      }
    }),
  deleteLesson: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const lesson = await prismaClient.lesson.findFirst({
          where: {
            id: opts.input.id,
            teacherId: opts.ctx.userId,
          },
        });

        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        await prismaClient.lesson.delete({
          where: {
            id: opts.input.id,
          },
        });

        return { success: true };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete lesson",
        });
      }
    }),
  createClassroom: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Classroom name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      try {
        const { name, description } = opts.input;

        const classroom = await prismaClient.classroom.create({
          data: {
            name,
            description: description || null,
            teacherId: opts.ctx.userId,
          },
        });

        return classroom;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create classroom",
        });
      }
    }),
  getClassrooms: privateProcedure.query(async (opts) => {
    try {
      const classrooms = await prismaClient.classroom.findMany({
        where: {
          teacherId: opts.ctx.userId,
        },
        include: {
          _count: {
            select: {
              enrollments: true,
              ChatSession: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return classrooms.map((classroom) => ({
        ...classroom,
        studentCount: classroom._count.enrollments,
        chatSessionCount: classroom._count.ChatSession,
      }));
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get classrooms",
      });
    }
  }),
  getClassroom: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      try {
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: opts.input.id,
            teacherId: opts.ctx.userId,
          },
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            rubrics: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
            ClassroomLesson: {
              include: {
                lesson: {
                  select: {
                    id: true,
                    title: true,
                    purpose: true,
                    createdAt: true,
                  },
                },
              },
            },
            ChatSession: {
              select: {
                id: true,
                status: true,
                startedAt: true,
                endedAt: true,
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                startedAt: "desc",
              },
            },
            _count: {
              select: {
                enrollments: true,
                ChatSession: true,
                Message: true,
              },
            },
          },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        return {
          ...classroom,
          studentCount: classroom._count.enrollments,
          chatSessionCount: classroom._count.ChatSession,
          messageCount: classroom._count.Message,
        };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get classroom",
        });
      }
    }),
  updateClassroom: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Classroom name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      try {
        const { id, name, description } = opts.input;

        const classroom = await prismaClient.classroom.update({
          where: {
            id,
            teacherId: opts.ctx.userId,
          },
          data: {
            name,
            description: description || null,
          },
        });

        return classroom;
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update classroom",
        });
      }
    }),
  deleteClassroom: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: opts.input.id,
            teacherId: opts.ctx.userId,
          },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        await prismaClient.classroom.delete({
          where: {
            id: opts.input.id,
          },
        });

        return { success: true };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete classroom",
        });
      }
    }),
  attachLessonToClassroom: privateProcedure
    .input(
      z.object({
        classroomId: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async (opts) => {
      try {
        const { classroomId, lessonId } = opts.input;

        // Check if lesson exists and belongs to teacher
        const lesson = await prismaClient.lesson.findFirst({
          where: {
            id: lessonId,
            teacherId: opts.ctx.userId,
          },
        });

        if (!lesson) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson not found",
          });
        }

        // Check if classroom exists and belongs to teacher
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: classroomId,
            teacherId: opts.ctx.userId,
          },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        // Check if already attached
        const existing = await prismaClient.classroomLesson.findFirst({
          where: {
            classroomId,
            lessonId,
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Lesson is already attached to this classroom",
          });
        }

        // Determine active status: first attached becomes active, subsequent are inactive by default
        const alreadyActive = await prismaClient.classroomLesson.findFirst({
          where: { classroomId, isActive: true },
        });

        // Attach lesson to classroom
        const classroomLesson = await prismaClient.classroomLesson.create({
          data: {
            classroomId,
            lessonId,
            isActive: alreadyActive ? false : true,
          },
        });

        return classroomLesson;
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to attach lesson to classroom",
        });
      }
    }),
  detachLessonFromClassroom: privateProcedure
    .input(
      z.object({
        classroomId: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async (opts) => {
      try {
        const { classroomId, lessonId } = opts.input;

        console.log("Detaching lesson:", {
          classroomId,
          lessonId,
          teacherId: opts.ctx.userId,
        });

        // Check if user is authenticated
        if (!opts.ctx.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Check if classroom belongs to teacher
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: classroomId,
            teacherId: opts.ctx.userId,
          },
        });

        if (!classroom) {
          console.log("Classroom not found or doesn't belong to teacher:", {
            classroomId,
            teacherId: opts.ctx.userId,
            classroom,
          });
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        // First check if the lesson exists at all (regardless of ownership)
        const lessonExists = await prismaClient.lesson.findFirst({
          where: {
            id: lessonId,
          },
        });

        console.log("Lesson exists check:", {
          lessonId,
          lessonExists: !!lessonExists,
        });

        if (!lessonExists) {
          console.log("Lesson does not exist in database:", lessonId);
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Lesson with ID ${lessonId} not found`,
          });
        }

        // Check if lesson belongs to teacher
        const lesson = await prismaClient.lesson.findFirst({
          where: {
            id: lessonId,
            teacherId: opts.ctx.userId,
          },
        });

        console.log("Lesson ownership check:", {
          lessonId,
          teacherId: opts.ctx.userId,
          lessonBelongsToTeacher: !!lesson,
          lessonTeacherId: lessonExists.teacherId,
        });

        // If lesson doesn't belong to teacher, but we're trying to detach it from their classroom,
        // this might be a data inconsistency - allow the operation but log it
        if (!lesson) {
          console.warn("Lesson ownership mismatch during detach:", {
            lessonId,
            lessonTeacherId: lessonExists.teacherId,
            classroomTeacherId: opts.ctx.userId,
          });
          // Allow the operation to proceed since the classroom belongs to the teacher
        }

        // Check current classroom lesson state
        const existingRecord = await prismaClient.classroomLesson.findFirst({
          where: {
            classroomId,
            lessonId,
          },
        });

        console.log("Existing classroom lesson record:", existingRecord);

        if (!existingRecord) {
          console.log(
            "No record found to delete, lesson may already be detached"
          );
          // Don't throw error, just return success since the goal is achieved
          return { success: true };
        }

        // Detach lesson from classroom
        const result = await prismaClient.classroomLesson.deleteMany({
          where: {
            classroomId,
            lessonId,
          },
        });

        console.log("Delete result:", result);

        return { success: true };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to detach lesson from classroom",
        });
      }
    }),
  setActiveLessonForClassroom: privateProcedure
    .input(
      z.object({
        classroomId: z.string(),
        lessonId: z.string(),
      })
    )
    .mutation(async (opts) => {
      try {
        const { classroomId, lessonId } = opts.input;

        // Verify classroom belongs to teacher
        const classroom = await prismaClient.classroom.findFirst({
          where: { id: classroomId, teacherId: opts.ctx.userId },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        // Ensure the lesson is attached to this classroom
        const relation = await prismaClient.classroomLesson.findFirst({
          where: { classroomId, lessonId },
        });

        if (!relation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lesson is not attached to this classroom",
          });
        }

        await prismaClient.$transaction([
          // Deactivate any currently active lesson for this classroom
          prismaClient.classroomLesson.updateMany({
            where: { classroomId, isActive: true },
            data: { isActive: false },
          }),
          // Activate the selected lesson
          prismaClient.classroomLesson.updateMany({
            where: { classroomId, lessonId },
            data: { isActive: true },
          }),
        ]);

        return { success: true };
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set active lesson",
        });
      }
    }),
  getAvailableLessons: privateProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async (opts) => {
      try {
        const { classroomId } = opts.input;

        // Check if classroom exists and belongs to teacher
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: classroomId,
            teacherId: opts.ctx.userId,
          },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        // Get all lessons by teacher that are not attached to this classroom
        const availableLessons = await prismaClient.lesson.findMany({
          where: {
            teacherId: opts.ctx.userId,
            classroomLessons: {
              none: {
                classroomId,
              },
            },
          },
          select: {
            id: true,
            title: true,
            purpose: true,
            speakingModeOnly: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return availableLessons;
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get available lessons",
        });
      }
    }),
  getClassroomLessons: privateProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async (opts) => {
      try {
        const { classroomId } = opts.input;

        // Check if classroom exists and belongs to teacher
        const classroom = await prismaClient.classroom.findFirst({
          where: {
            id: classroomId,
            teacherId: opts.ctx.userId,
          },
        });

        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }

        // Get lessons attached to classroom
        const classroomLessons = await prismaClient.classroomLesson.findMany({
          where: {
            classroomId,
          },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                purpose: true,
                speakingModeOnly: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            lesson: {
              createdAt: "desc",
            },
          },
        });

        return classroomLessons.map((cl) => ({
          id: cl.id,
          isActive: cl.isActive,
          lesson: cl.lesson,
        }));
      } catch (error) {
        console.log(error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get classroom lessons",
        });
      }
    }),
  getProfile: privateProcedure.query(async (opts) => {
    const user = await prismaClient.user.findUnique({
      where: {
        id: opts.ctx.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return user;
  }),
  updateProfile: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
      })
    )
    .mutation(async (opts) => {
      const { name, email } = opts.input;

      // Check if email is already taken by another user
      const existingUser = await prismaClient.user.findFirst({
        where: {
          email,
          id: { not: opts.ctx.userId },
        },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email is already taken by another user",
        });
      }

      const updatedUser = await prismaClient.user.update({
        where: {
          id: opts.ctx.userId,
        },
        data: {
          name,
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return {
        message: "Profile updated successfully",
        user: updatedUser,
      };
    }),
  toDo: publicProcedure.query(async () => {
    return [1, 2, 3];
  }),

  /**
   * STUDENT ENDPOINTS
   */
  getMyClassrooms: privateProcedure.query(async (opts) => {
    if (opts.ctx.userRole !== "STUDENT") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const enrollments = await prismaClient.studentClassroom.findMany({
      where: { studentId: opts.ctx.userId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.classroom.id,
      name: enrollment.classroom.name,
      teacherName: enrollment.classroom.teacher?.name ?? "Teacher",
    }));
  }),

  getClassroomLessonsForStudent: privateProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async (opts) => {
      if (opts.ctx.userRole !== "STUDENT") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { classroomId } = opts.input;

      // Ensure the student is enrolled in this classroom
      const enrollment = await prismaClient.studentClassroom.findFirst({
        where: { studentId: opts.ctx.userId, classroomId },
        select: { id: true },
      });
      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not enrolled in classroom",
        });
      }

      const classroomLessons = await prismaClient.classroomLesson.findMany({
        where: { classroomId },
        include: {
          lesson: {
            select: { id: true, title: true },
          },
        },
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      });

      const chatSessions = await prismaClient.chatSession.findMany({
        where: { classroomId ,studentId: opts.ctx.userId},
        select: {
          id: true,
          lessonId: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return classroomLessons.map((cl) => ({
        id: cl.id,
        isActive: cl.isActive,
        lesson: cl.lesson,
        chatSessionId: chatSessions.find((cs) => cs.lessonId === cl.lesson.id)?.id,
      }));
    }),

  // Fetch messages for a specific lesson within a classroom for the current student
  getLessonMessages: privateProcedure
    .input(z.object({ classroomId: z.string(), lessonId: z.string(), chatSessionId: z.string() }))
    .query(async (opts) => {
      if (opts.ctx.userRole !== "STUDENT") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { classroomId, lessonId, chatSessionId } = opts.input;

      // Ensure the student is enrolled and get the chat session
      const enrollment = await prismaClient.studentClassroom.findFirst({
        where: { studentId: opts.ctx.userId, classroomId },
        select: { id: true },
      });
      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not enrolled in classroom",
        });
      }

      const messages = await prismaClient.message.findMany({
        where: { chatSessionId, lessonId },
        include: {
          attachment: true,
          sender: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return messages.map((m) => ({
        id: m.id,
        content: m.content,
        isBot: m.isBot,
        senderId: m.senderId,
        senderName: m.sender?.name ?? (m.isBot ? "AI" : "User"),
        createdAt: m.createdAt,
        messageType: m.messageType,
        attachmentUrl: m.attachment?.url ?? null,
      }));
    }),

  // Send a text message in the context of a lesson for the current student
  sendLessonMessage: privateProcedure
    .input(
      z.object({
        classroomId: z.string(),
        lessonId: z.string(),
        content: z.string().min(1),
        chatSessionId: z.string(),
      })
    )
    .mutation(async (opts) => {
      if (opts.ctx.userRole !== "STUDENT") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { classroomId, lessonId, content, chatSessionId } = opts.input;

      // Ensure the student is enrolled and get/create chat session
      const enrollment = await prismaClient.studentClassroom.findFirst({
        where: { studentId: opts.ctx.userId, classroomId },
        select: { id: true },
      });
      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not enrolled in classroom",
        });
      }


      const created = await prismaClient.message.create({
        data: {
          content,
          senderId: opts.ctx.userId,
          chatSessionId,
          classroomId,
          lessonId,
        },
        include: {
          attachment: true,
          sender: { select: { id: true, name: true } },
        },
      });

      return {
        id: created.id,
        content: created.content,
        isBot: created.isBot,
        senderId: created.senderId,
        senderName: created.sender?.name ?? "You",
        createdAt: created.createdAt,
        messageType: created.messageType,
        attachmentUrl: created.attachment?.url ?? null,
      };
    }),

  getMyOverviewCounts: privateProcedure.query(async (opts) => {
    if (opts.ctx.userRole !== "STUDENT") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const [classesCount, messagesCount] = await Promise.all([
      prismaClient.studentClassroom.count({
        where: { studentId: opts.ctx.userId },
      }),
      prismaClient.message.count({
        where: { chatSession: { studentId: opts.ctx.userId } },
      }),
    ]);

    return { classesCount, messagesCount };
  }),

  /**
   * Create a student invitation under the current teacher.
   * Optionally restrict to a classroom (nullable) and/or email (nullable).
   */
  createStudentInvite: privateProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        classroomId: z.string().optional(),
        expiresInHours: z
          .number()
          .int()
          .min(1)
          .max(24 * 30)
          .optional(), // default 7 days
      })
    )
    .output(
      z.object({
        token: z.string(),
        expiresAt: z.date(),
        invitationId: z.string(),
      })
    )
    .mutation(async (opts) => {
      if (opts.ctx.userRole !== "TEACHER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only teachers can create invites",
        });
      }

      const { email, classroomId, expiresInHours } = opts.input;

      if (classroomId) {
        const classroom = await prismaClient.classroom.findFirst({
          where: { id: classroomId, teacherId: opts.ctx.userId },
          select: { id: true },
        });
        if (!classroom) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Classroom not found",
          });
        }
      }

      const token = randomBytes(12).toString("hex");
      const hours = expiresInHours ?? 24 * 7;
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

      const invitation = await prismaClient.invitation.create({
        data: {
          token,
          ...(email ? { email } : {}),
          ...(classroomId ? { classroomId } : {}),
          invitedById: opts.ctx.userId,
          expiresAt,
        },
        select: { id: true, token: true, expiresAt: true },
      });

      return {
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        invitationId: invitation.id,
      };
    }),

  /**
   * Get invitation details for a token. Public.
   */
  getInvitationDetails: publicProcedure
    .input(z.object({ token: z.string().min(6) }))
    .output(
      z.object({
        valid: z.boolean(),
        expired: z.boolean().optional(),
        status: z.enum(["PENDING", "ACCEPTED", "EXPIRED"]).optional(),
        teacher: z
          .object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string(),
          })
          .optional(),
        classroom: z
          .object({ id: z.string(), name: z.string() })
          .nullable()
          .optional(),
      })
    )
    .query(async (opts) => {
      const inv = await prismaClient.invitation.findUnique({
        where: { token: opts.input.token },
        include: {
          invitedBy: { select: { id: true, name: true, email: true } },
          classroom: { select: { id: true, name: true } },
        },
      });

      if (!inv) return { valid: false };
      const now = new Date();
      const expired = inv.expiresAt < now;
      return {
        valid: !expired && inv.status === "PENDING",
        expired,
        status: inv.status as any,
        teacher: inv.invitedBy,
        classroom: inv.classroom ?? null,
      };
    }),

  /**
   * Student signs up with invitation token
   */
  studentSignUpWithInvitation: publicProcedure
    .input(
      z.object({
        token: z.string().min(6),
        email: z.email(),
        password: z.string().min(6),
        name: z.string().min(1),
      })
    )
    .output(
      z.object({
        message: z.string(),
        accessToken: z.string(),
        role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
      })
    )
    .mutation(async (opts) => {
      const { token, email, password, name } = opts.input;

      const invitation = await prismaClient.invitation.findUnique({
        where: { token },
        include: { invitedBy: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid invite token",
        });
      }
      if (invitation.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation already used or expired",
        });
      }
      if (invitation.expiresAt < new Date()) {
        await prismaClient.invitation.update({
          where: { id: invitation.id },
          data: { status: "EXPIRED" },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation expired",
        });
      }
      if (
        invitation.email &&
        invitation.email.toLowerCase() !== email.toLowerCase()
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email does not match invitation",
        });
      }

      const existing = await prismaClient.user.findUnique({ where: { email } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const user = await prismaClient.user.create({
        data: {
          email,
          password, // TODO: hash
          name: name && name.trim().length > 0 ? name : null,
          role: "STUDENT",
        },
      });

      await prismaClient.invitation.update({
        where: { id: invitation.id },
        data: {
          recipientId: user.id,
          acceptedAt: new Date(),
          status: "ACCEPTED",
        },
      });

      const accessToken = await generateToken({ id: user.id, role: user.role });

      return { message: "Sign up successful", accessToken, role: user.role };
    }),

  /**
   * Get students associated with the current teacher (accepted invites or enrolled in teacher's classrooms)
   */
  getTeacherStudents: privateProcedure.query(async (opts) => {
    if (opts.ctx.userRole !== "TEACHER") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const students = await prismaClient.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          {
            receivedInvitations: {
              some: { invitedById: opts.ctx.userId, status: "ACCEPTED" },
            },
          },
          {
            enrollments: {
              some: { classroom: { teacherId: opts.ctx.userId } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollments: {
          where: { classroom: { teacherId: opts.ctx.userId } },
          select: {
            classroom: { select: { id: true, name: true } },
            enrolledAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      classrooms: s.enrollments.map((e) => ({
        id: e.classroom.id,
        name: e.classroom.name,
      })),
      enrollmentDate:
        s.enrollments.sort(
          (a, b) => a.enrolledAt.getTime() - b.enrolledAt.getTime()
        )[0]?.enrolledAt ?? null,
    }));
  }),

  /**
   * Get students under teacher that are not enrolled in the specified classroom
   */
  getAvailableStudents: privateProcedure
    .input(z.object({ classroomId: z.string() }))
    .query(async (opts) => {
      if (opts.ctx.userRole !== "TEACHER")
        throw new TRPCError({ code: "FORBIDDEN" });
      const { classroomId } = opts.input;

      const classroom = await prismaClient.classroom.findFirst({
        where: { id: classroomId, teacherId: opts.ctx.userId },
        select: { id: true },
      });
      if (!classroom)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Classroom not found",
        });

      const enrolled = await prismaClient.studentClassroom.findMany({
        where: { classroomId },
        select: { studentId: true },
      });
      const enrolledIds = new Set(enrolled.map((e) => e.studentId));

      const students = await prismaClient.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            {
              receivedInvitations: {
                some: { invitedById: opts.ctx.userId, status: "ACCEPTED" },
              },
            },
            {
              enrollments: {
                some: { classroom: { teacherId: opts.ctx.userId } },
              },
            },
          ],
        },
        select: { id: true, name: true, email: true },
        orderBy: { createdAt: "desc" },
      });

      return students.filter((s) => !enrolledIds.has(s.id));
    }),

  /**
   * Attach a student to a classroom
   */
  attachStudentToClassroom: privateProcedure
    .input(z.object({ classroomId: z.string(), studentId: z.string() }))
    .mutation(async (opts) => {
      if (opts.ctx.userRole !== "TEACHER")
        throw new TRPCError({ code: "FORBIDDEN" });
      const { classroomId, studentId } = opts.input;

      const classroom = await prismaClient.classroom.findFirst({
        where: { id: classroomId, teacherId: opts.ctx.userId },
      });
      if (!classroom)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Classroom not found",
        });

      const student = await prismaClient.user.findFirst({
        where: { id: studentId, role: "STUDENT" },
      });
      if (!student)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });

      const exists = await prismaClient.studentClassroom.findFirst({
        where: { classroomId, studentId },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Student already enrolled in classroom",
        });
      }

      const enrollment = await prismaClient.studentClassroom.create({
        data: { classroomId, studentId },
      });

      // Ensure a ChatSession record exists for this student and classroom
      // (unique on [studentId, classroomId])
      await prismaClient.chatSession.upsert({
        where: {
          studentId_classroomId: {
            studentId,
            classroomId,
          },
        },
        update: {},
        create: { classroomId, studentId },
      });
      return enrollment;
    }),
  /**
   * Detach a student from a classroom
   */
  detachStudentFromClassroom: privateProcedure
    .input(z.object({ classroomId: z.string(), studentId: z.string() }))
    .mutation(async (opts) => {
      if (opts.ctx.userRole !== "TEACHER")
        throw new TRPCError({ code: "FORBIDDEN" });
      const { classroomId, studentId } = opts.input;

      // Verify classroom ownership
      const classroom = await prismaClient.classroom.findFirst({
        where: { id: classroomId, teacherId: opts.ctx.userId },
      });
      if (!classroom)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Classroom not found",
        });

      // Verify enrollment exists
      const enrollment = await prismaClient.studentClassroom.findFirst({
        where: { classroomId, studentId },
      });
      if (!enrollment) {
        // Nothing to do
        return { success: true };
      }

      // Remove enrollment, cascade chat sessions by unique [studentId, classroomId]
      await prismaClient.$transaction([
        prismaClient.chatSession.deleteMany({
          where: { classroomId, studentId },
        }),
        prismaClient.studentClassroom.delete({ where: { id: enrollment.id } }),
      ]);

      return { success: true };
    }),
  pastChatSessions: privateProcedure.query(async (opts) => {
    if (opts.ctx.userRole !== "STUDENT") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const chatSessions = await prismaClient.chatSession.findMany({
      where: { studentId: opts.ctx.userId },
    });
    return chatSessions.map((chatSession) => ({
      id: chatSession.id,
      classroomId: chatSession.classroomId,
      startedAt: chatSession.startedAt,
      endedAt: chatSession.endedAt,
    }));
  }),
});

const server = createHTTPServer({
  middleware: cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent
  }),
  router: appRouter,
  createContext: createTRPCContext,
  // createContext: (opts) => {
  //   return createTRPCContext(opts);
  // },
});

server.listen(3005, () => {
  console.log("http Server Running");
});

const wss = new ws.Server({
  port: 3006,
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext(opts): AppContext {
    return {
      req: opts.req,
    };
  },
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
});
wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on ws://localhost:3006");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
