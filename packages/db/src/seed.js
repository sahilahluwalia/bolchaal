import { prismaClient } from "./index";

const seedData = {
    teacher: {
        name: "John Wick | Teacher",
        email: "teacher@teacher.com",
        password: "teacher@teacher.com",
        role: "TEACHER",
    },
    student: {
        name: "Baba Yaga | Student",
        email: "student@student.com",
        password: "student@student.com",
        role: "STUDENT",
    },
}


const seed = async () => {
    try {
        console.log("Starting seed process...");
        
        const teacher = await prismaClient.user.upsert({
            where: { email: seedData.teacher.email },
            update: {},
            create: {
                email: seedData.teacher.email,
                password: seedData.teacher.password,
                role: "TEACHER",
                name: seedData.teacher.name,
            },
        });
        console.log("Teacher:", teacher);

        const classroom = await prismaClient.classroom.findFirst({
            where: {
                teacherId: teacher.id,
                name: "Grade 9A",
                description: "Grade 9A is a classroom for Grade 9 students",
            }
        }) || await prismaClient.classroom.create({
            data: {
                name: "Grade 9A", 
                teacherId: teacher.id,
                description: "Grade 9A is a classroom for Grade 9 students",
            },
        });
        console.log("Classroom:", classroom);

        const lesson = await prismaClient.lesson.findFirst({
            where: {
                teacherId: teacher.id,
                title: "Grade 9"
            }
        }) || await prismaClient.lesson.create({
            data: {
                title: "Grade 9",
                teacherId: teacher.id,
                purpose: "English for Day to Day life",
                keyVocabulary: "greetings, daily activities, shopping, transportation, weather, time, family, hobbies",
                keyGrammar: "Present Simple Tense, Question forms, Using 'do' and 'does'",
                studentTask: "Describe your daily routine and discuss your favorite hobbies using present simple tense.",
                reminderMessage: "Ready to talk about your daily life? Focus on using present simple tense to describe routines and hobbies.",
                otherInstructions: "Encourage the student to expand on their answers, ask follow-up questions about their routines and hobbies, correct basic grammatical errors related to present simple tense, and make the conversation natural and engaging.",
                speakingModeOnly: false,
                autoCheckIfLessonCompleted: false,
            },
        });
        console.log("Lesson:", lesson);

        const invite = await prismaClient.invitation.findFirst({
            where: {
                email: seedData.student.email,
                classroomId: classroom.id
            }
        }) || await prismaClient.invitation.create({
            data: {
                email: seedData.student.email,
                classroomId: classroom.id,
                invitedById: teacher.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                token: "1234567890",
            },
        });
        console.log("Invite:", invite);

        const student = await prismaClient.user.upsert({
            where: { email: seedData.student.email },
            update: {},
            create: {
                email: seedData.student.email,
                password: seedData.student.password,
                role: "STUDENT",
                name: "John Doe",
                receivedInvitations: {
                    connect: {
                        id: invite.id,
                    },
                },
            },
        });
        console.log("Student:", student);

        const lessonClassroom = await prismaClient.classroomLesson.findFirst({
            where: {
                classroomId: classroom.id,
                lessonId: lesson.id
            }
        }) || await prismaClient.classroomLesson.create({
            data: {
                classroomId: classroom.id,
                lessonId: lesson.id,
            },
        });
        console.log("Lesson-Classroom:", lessonClassroom);

        const studentClassroom = await prismaClient.studentClassroom.findFirst({
            where: {
                studentId: student.id,
                classroomId: classroom.id
            }
        }) || await prismaClient.studentClassroom.create({
            data: {
                studentId: student.id,
                classroomId: classroom.id,
            },
        });
        console.log("Student-Classroom:", studentClassroom);

        console.log("Seed completed successfully!");
        
    } catch (error) {
        console.error("Seed failed:", error);
        throw error;
    } finally {
        await prismaClient.$disconnect();
    }
}

seed();