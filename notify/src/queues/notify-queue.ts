import Queue from "bull";
import { client } from "../twilio";

interface PayLoad {
    patientId: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
}

const notifyQueue = new Queue<PayLoad>("notify", {
    redis: {
        host: process.env.REDIS_HOST
    }
});


notifyQueue.process(async job => {
    const options = {
        to: job.data.patientPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `We remind you that you have an upcoming appointment at the clinic on ${job.data.appointmentDate} at ${job.data.appointmentTime}`,
    };
    client.messages.create(options, function (err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log(`Message sent to ${job.data.patientId}`);
            console.log(`Date-Created: ${response.dateCreated} || Date-Sent: ${response.dateSent}`);
        }
    });
});

export { notifyQueue };