import { Queue, Worker, Job } from "bullmq";
import IORedis, { Redis } from "ioredis";
const connection = new IORedis({
  maxRetriesPerRequest: null,
});

const pubRedis = new Redis();

const pubSub = new Redis();



// setInterval(() => {
//     const message = { foo: Math.random() };
//     // Publish to my-channel-1 or my-channel-2 randomly.
//     const channel = `my-channel-${1 + Math.round(Math.random())}`;

//     // Message can be either a string or a buffer
//     pubRedis.publish(channel, JSON.stringify(message));
//     console.log("Published %s to %s", message, channel);
//   }, 1000);

//   pubSub.subscribe("my-channel-1", "my-channel-2", (err, count) => {
//     if (err) {
//       // Just like other commands, subscribe() can fail for some reasons,
//       // ex network issues.
//       console.error("Failed to subscribe: %s", err.message);
//     } else {
//       // `count` represents the number of channels this client are currently subscribed to.
//       console.log(
//         `Subscribed successfully! This client is currently subscribed to ${count} channels.`
//       );
//     }
//   });

//   pubSub.on("message", (channel, message) => {
//     console.log(`Received ${message} from ${channel}`);
//   });

// There's also an event called 'messageBuffer', which is the same as 'message' except
// it returns buffers instead of strings.
// It's useful when the messages are binary data.
//   pubSub.on("messageBuffer", (channel, message) => {
//     // Both `channel` and `message` are buffers.
//     console.log(channel, message);
//   });

export const QUEUE_NAMES = {
  routeMessageQueue: "route-message-queue",
  speechToTextQueue: "speech-to-text-queue",
  textToSpeechQueue: "text-to-speech-queue",
  generateAIFeedbackQueue: "generate-ai-feedback-queue",
  saveIncomingUserMessageToDBQueue: "save-incoming-user-message-to-db",
  saveAIResponseQueue: "save-ai-response-qeueue",
};

const REDIS_CHANNELS = {
  audioMessageChannel: "audio-message-channel",
  textMessageChannel: "text-message-channel",
};
pubSub.subscribe(REDIS_CHANNELS.audioMessageChannel, REDIS_CHANNELS.textMessageChannel, (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    } else {
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
  });

  pubSub.on("message", (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
  });
//   pubSub.on("messageBuffer", (channel, message) => {
//     console.log(channel, message);
//   });
export const routeMessageQueue = new Queue(QUEUE_NAMES.routeMessageQueue, {
  connection,
});

const speechToTextQueue = new Queue(QUEUE_NAMES.speechToTextQueue, {
  connection,
});
const textToSpeechQueue = new Queue(QUEUE_NAMES.textToSpeechQueue, {
  connection,
});

const generateAIFeedbackQueue = new Queue(QUEUE_NAMES.generateAIFeedbackQueue, {
  connection,
});

const saveIncomingUserMessageToDBQueue = new Queue(
  QUEUE_NAMES.saveIncomingUserMessageToDBQueue,
  { connection }
);

const saveAIResponseQueue = new Queue(QUEUE_NAMES.saveAIResponseQueue, {
  connection,
});

const payload = {
  classroomId: "d850a628-9617-4a46-9e7e-b536070c774a",
  lessonId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
  userId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
  content: "Yes!",
  type: "TEXT",
};

const textPayload = {
  classroomId: "d850a628-9617-4a46-9e7e-b536070c774a",
  lessonId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
  userId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
  content: "Yes! This is a text message",
  type: "AUDIO",
};

//   const audioPayload = {
//     classroomId: "d850a628-9617-4a46-9e7e-b536070c774a",
//     lessonId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
//     userId: "f2db2114-378f-44aa-8d31-f61d7bd7ccb5",
//     audioUrl: "https://www.google.com",
//     type: "AUDIO",
//   };

async function initializeQueues() {
  try {
    // await routeMessageQueue.add(QUEUE_NAMES.routeMessageQueue, payload);
    await routeMessageQueue.add(QUEUE_NAMES.routeMessageQueue, textPayload);
  } catch (error) {
    console.log(error);
  }
}

// Initialize queues
initializeQueues();

type textPayload = {
  content: string;
  type: "TEXT";
};

type basePayload = {
  classroomId: string;
  lessonId: string;
  userId: string;
};

type audioPayload = {
  audioUrl: string;
  type: "AUDIO";
};

type userMessagePayload = {
  classroomId: string;
  lessonId: string;
  content: string;
  type: "TEXT" | "AUDIO";
  userId: string;
};

type speechToTextPayload = {
  classroomId: string;
  lessonId: string;
  audioUrl: string;
  type: "AUDIO";
};

interface generateAIFeedbackPayloadForText extends textPayload, basePayload {
  aiFeedback: string;
}

interface generateAIFeedbackPayloadForAudio extends audioPayload, basePayload {
  aiFeedback: string;
}
interface textToSpeechWorkerResponse extends generateAIFeedbackPayloadForAudio {
  url: string;
}

const routerWorker = new Worker(
  QUEUE_NAMES.routeMessageQueue,
  async (job: Job<userMessagePayload>) => {
    if (job.data.type === "TEXT") {
      console.log("received text message from user", job.data);
      await generateAIFeedbackQueue.add(
        QUEUE_NAMES.generateAIFeedbackQueue,
        job.data
      );
      await saveIncomingUserMessageToDBQueue.add(
        QUEUE_NAMES.saveIncomingUserMessageToDBQueue,
        job.data
      );
    } else if (job.data.type === "AUDIO") {
      console.log("received audio message from user", job.data);
      //upload audio to s3
      // const audioUrl = await uploadAudioToS3(job.data.audio);
      await speechToTextQueue.add(QUEUE_NAMES.speechToTextQueue, job.data);
    }
  },
  { connection }
);
// routerWorker.on('completed', (job: Job<userMessagePayload>) => {
//   console.log("router worker completed");
// });

const speechToTextWorker = new Worker(
  QUEUE_NAMES.speechToTextQueue,
  async (job: Job<speechToTextPayload>) => {
    // console.log("job data is ", job.data);

    //   const text= openai
    // console.log("speech to text worker 1");
    // console.log("speech to text worker 2");
    // console.log("speech to text worker 3");
    // const speechToTextResult = await openai.audio.transcriptions.create({
    //   file: job.data.audioUrl,
    //   model: "whisper-1",
    // });
    // const speechToTextResult = {
    const payload = {
      ...job.data,
      text: "test speech to text",
    };
    console.log("speech to text worker finished:", payload.text);
    await generateAIFeedbackQueue.add(
      QUEUE_NAMES.generateAIFeedbackQueue,
      payload
    );
    await saveIncomingUserMessageToDBQueue.add(
      QUEUE_NAMES.saveIncomingUserMessageToDBQueue,
      payload
    );
    return "speech to text worker Finished";
  },
  { connection }
);

const textToSpeechWorker = new Worker(
  QUEUE_NAMES.textToSpeechQueue,
  async (job: Job<generateAIFeedbackPayloadForAudio>) => {
    // const whisper=openai

    // audio data from whisper

    // upload to r2
    const aiFeedback = {
      ...job.data,
      url: "https://www.google.com",
    };
    // const uploadResult = await uploadToR2(job.data.aiFeedback);
    console.log(
      "publishing to audio-message-channel audio payload",
      aiFeedback.url
    );
    pubRedis.publish(
      REDIS_CHANNELS.audioMessageChannel,
      JSON.stringify(aiFeedback)
    );

    await saveAIResponseQueue.add(QUEUE_NAMES.saveAIResponseQueue, aiFeedback);
    return "text to speech worker Finished";
  },
  { connection }
);

const generateAIFeedbackWorker = new Worker(
  QUEUE_NAMES.generateAIFeedbackQueue,
  async (
    job: Job<
      generateAIFeedbackPayloadForText | generateAIFeedbackPayloadForAudio
    >
  ) => {
    // console.log("generate ai feedback worker started");
    const aiFeedback = {
      ...job.data,
      aiFeedback: "ai generated feedback",
    };
    console.log("generate ai feedback worker finished:", aiFeedback.aiFeedback);

    if (job.data.type === "TEXT") {
      await saveAIResponseQueue.add(
        QUEUE_NAMES.saveAIResponseQueue,
        aiFeedback
      );
      console.log(
        "publishing to client-message-channel text payload:",
        aiFeedback.aiFeedback
      );
      pubRedis.publish(
        REDIS_CHANNELS.textMessageChannel,
        JSON.stringify(aiFeedback)
      );
    } else if (job.data.type === "AUDIO") {
      await textToSpeechQueue.add(QUEUE_NAMES.textToSpeechQueue, aiFeedback);
    } else {
      console.log("classroomId and lessonId job data is ", job.data);
    }
    return "generate ai feedback worker Finished";
  },
  { connection }
);

const saveIncomingUserMessageToDBWorker = new Worker(
  QUEUE_NAMES.saveIncomingUserMessageToDBQueue,
  async (job: Job<userMessagePayload>) => {
    console.log("saving incoming user message to db:", job.data.content);
    return "save incoming user text to db worker Finished";
  },
  { connection }
);

const saveAIResponseWorker = new Worker(
  QUEUE_NAMES.saveAIResponseQueue,
  async (
    job: Job<generateAIFeedbackPayloadForText | textToSpeechWorkerResponse>
  ) => {
    // const result=prisma
    //   await saveIncomingUserTextToDBWorker.add("save-incoming-user-text-to-db", job.data);
    // console.log("save ai response to db", job.data);
    // cosnt db=prisma

    if (job.data.type === "AUDIO") {
      // save to db
      console.log(
        "save ai response ",
        job.data.aiFeedback,
        " of type ",
        job.data.type,
        " to db",
        job.data.url
      );
    }
    if (job.data.type === "TEXT") {
      console.log(
        "saving ai response:",
        job.data.aiFeedback,
        " of type: ",
        job.data.type,
        " to db"
      );
    }
    return "save ai response worker Finished";
  },
  { connection }
);
