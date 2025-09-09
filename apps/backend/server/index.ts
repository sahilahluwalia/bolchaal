import {
  publicProcedure,
  router,
  privateProcedure,
  createTRPCContext,
} from "./trpc";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { Prompts, systemPrompt } from "../utils/prompt";
import {
  LessonCreateInputObjectSchema,
  prismaClient,
  LessonCreateInputObjectZodSchema,
  LessonResultSchema,
} from "@repo/db/client";
import { TRPCError } from "@trpc/server";
import { generateToken, generateTokenPair, verifyRefreshToken } from "../utils/auth";
import "dotenv/config";
import cors from "cors";
import { generateText, generateObject } from "ai";

const createRefreshTokenCookie = (refreshToken: string): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const crossSite = process.env.CROSS_SITE_COOKIES === 'true';
  const maxAge = 7 * 24 * 60 * 60; // 7 days

  const cookieParts = [
    `refreshToken=${refreshToken}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAge}`,
  ];

  if (crossSite) {
    cookieParts.push('SameSite=None');
    if (isProduction) cookieParts.push('Secure');
  } else {
    if (isProduction) {
      cookieParts.push('Secure');
      cookieParts.push('SameSite=Strict');
    } else {
      cookieParts.push('SameSite=Lax');
    }
  }

  return cookieParts.join('; ');
};

const clearRefreshTokenCookie = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const crossSite = process.env.CROSS_SITE_COOKIES === 'true';

  const cookieParts = [
    'refreshToken=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
  ];

  if (crossSite) {
    cookieParts.push('SameSite=None');
    if (isProduction) cookieParts.push('Secure');
  } else {
    if (isProduction) {
      cookieParts.push('Secure');
      cookieParts.push('SameSite=Strict');
    } else {
      cookieParts.push('SameSite=Lax');
    }
  }

  return cookieParts.join('; ');
};




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
        email: z.string().email("Invalid email format"),
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
        ctx
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

      const { accessToken, refreshToken } = await generateTokenPair({ id: user.id, role: user.role });

      // Store refresh token in database
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          refreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Set refresh token as HTTP-only cookie
      ctx.res.setHeader('Set-Cookie', createRefreshTokenCookie(refreshToken));

      return {
        message: "Sign up successful",
        accessToken,
        role: user.role
      };
    }),
  chat: publicProcedure
    .input(
      z.object({
        purpose: z.string(),
        keyVocabulary: z.string(),
        keyGrammar: z.string(),
        studentTask: z.string(),
        otherInstructions: z.string(),
      })
    )
    .mutation((opts) => {
      const { input: message } = opts;
      const {
        purpose,
        keyVocabulary,
        keyGrammar,
        studentTask,
        otherInstructions,
      } = message;
      const prompt = systemPrompt({
        purpose,
        keyVocabulary,
        keyGrammar,
        studentTask,
        otherInstructions,
      });
      return { prompt };
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
        ctx
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

      const { accessToken, refreshToken } = await generateTokenPair(user);

      // Store refresh token in database
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          refreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Set refresh token as HTTP-only cookie
      ctx.res.setHeader('Set-Cookie', createRefreshTokenCookie(refreshToken));

      return {
        message: "Sign in successful",
        accessToken,
        role: user.role
      };
    }),
  refreshToken: publicProcedure
    .output(
      z.object({
        accessToken: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { ctx } = opts;

      // Get refresh token from HTTP-only cookie
      const cookies = ctx.req.headers.cookie;
      if (!cookies) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No refresh token found",
        });
      }

      const refreshTokenCookie = cookies
        .split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('refreshToken='));

      if (!refreshTokenCookie) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No refresh token found",
        });
      }

      const token = refreshTokenCookie.split('=')[1];

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token format",
        });
      }

      // Verify the refresh token
      const payload = await verifyRefreshToken(token);

      // Check if user exists and refresh token matches
      const user = await prismaClient.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          role: true,
          refreshToken: true,
          refreshTokenExpiresAt: true,
        },
      });

      if (!user || user.refreshToken !== token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }

      // Check if refresh token is expired
      if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Refresh token expired",
        });
      }

      // Generate new token pair
      const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair({
        id: user.id,
        role: user.role
      });

      // Update refresh token in database
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          refreshToken: newRefreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Set new refresh token as HTTP-only cookie
      ctx.res.setHeader('Set-Cookie', createRefreshTokenCookie(newRefreshToken));

      return {
        accessToken,
      };
    }),
  logout: publicProcedure
    .mutation(async (opts) => {
      const { ctx } = opts;

      // Get refresh token from HTTP-only cookie
      const cookies = ctx.req.headers.cookie;
      if (cookies) {
        const refreshTokenCookie = cookies
          .split(';')
          .map(cookie => cookie.trim())
          .find(cookie => cookie.startsWith('refreshToken='));

        if (refreshTokenCookie) {
          const token = refreshTokenCookie.split('=')[1];

          if (!token) {
            console.log('Invalid refresh token format in logout');
            return { message: "Logged out successfully" };
          }

          // Verify the refresh token to get user ID
          try {
            const payload = await verifyRefreshToken(token);

            // Clear refresh token from database
            await prismaClient.user.update({
              where: { id: payload.userId },
              data: {
                refreshToken: null,
                refreshTokenExpiresAt: null,
              },
            });
          } catch (error) {
            // If token verification fails, still continue with logout
            console.log("Invalid refresh token during logout:", error);
          }
        }
      }

      // Clear refresh token cookie
      ctx.res.setHeader('Set-Cookie', clearRefreshTokenCookie());

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
    .input(LessonCreateInputObjectZodSchema.omit({
      teacher: true,
      classroomLessons: true,
    }))
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
      try{

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

      }catch(error){
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lesson",
        });
      }
   
    }),
  getLessons: privateProcedure.query(async (opts) => {
    try{
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
      return lessons
      }
      catch(error){
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

        // Attach lesson to classroom
        const classroomLesson = await prismaClient.classroomLesson.create({
          data: {
            classroomId,
            lessonId,
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

        console.log("Detaching lesson:", { classroomId, lessonId, teacherId: opts.ctx.userId });

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
            classroom
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

        console.log("Lesson exists check:", { lessonId, lessonExists: !!lessonExists });

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
          lessonTeacherId: lessonExists.teacherId
        });

        // If lesson doesn't belong to teacher, but we're trying to detach it from their classroom,
        // this might be a data inconsistency - allow the operation but log it
        if (!lesson) {
          console.warn("Lesson ownership mismatch during detach:", {
            lessonId,
            lessonTeacherId: lessonExists.teacherId,
            classroomTeacherId: opts.ctx.userId
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
          console.log("No record found to delete, lesson may already be detached");
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
  toDo: publicProcedure.query(async () => {
    return [1, 2, 3];
  }),
});

const server = createHTTPServer({
  middleware: cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
// import { applyWSSHandler } from "@trpc/server/adapters/ws";
// import ws from "ws";
// const wss = new ws.Server({
//   port: 3006,
// });
// const handler = applyWSSHandler({
//   wss,
//   router: appRouter,
//   createContext() {
//     console.log("web socket");
//     return {};
//   },
//   // Enable heartbeat messages to keep connection open (disabled by default)
//   keepAlive: {
//     enabled: true,
//     // server ping message interval in milliseconds
//     pingMs: 30000,
//     // connection is terminated if pong message is not received in this many milliseconds
//     pongWaitMs: 5000,
//   },
// });
// wss.on("connection", (ws) => {
//   console.log(`➕➕ Connection (${wss.clients.size})`);
//   ws.once("close", () => {
//     console.log(`➖➖ Connection (${wss.clients.size})`);
//   });
// });
// console.log("✅ WebSocket Server listening on ws://localhost:3006");
// process.on("SIGTERM", () => {
//   console.log("SIGTERM");
//   handler.broadcastReconnectNotification();
//   wss.close();
// });

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
