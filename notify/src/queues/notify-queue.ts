import Queue from "bull";


interface Payload {
    patientId: string;
    patientPhone: string;
}

const notifyQueue = new Queue<Payload>("notify", {
    redis: {
        host: process.env.REDIS_HOST
    }
});


notifyQueue.process(async job => {

});

export { notifyQueue };