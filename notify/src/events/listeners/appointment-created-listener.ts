import { Listener, Subjects, AppointmentCreatedEvent } from "@clinic-services/common";
import { Message } from "node-nats-streaming";
import { notifyQueue } from "../../queues/notify-queue";
import { queueGroupName } from "./queue-group-name";

export class AppointmentCreatedListener extends Listener<AppointmentCreatedEvent> {
    readonly subject = Subjects.AppointmentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: AppointmentCreatedEvent["data"], msg: Message) {

        if (data.patientId) {
            const delay = new Date(`${data.date} ${data.start_time}`).getTime() - new Date().getTime();
            // don't forget execution time
            notifyQueue.add(
                {
                    patientId: data.patientId,
                    patientPhone: String(data.patientPhone)
                },
                {
                    delay
                }
            );


        }

        msg.ack();
    }
}