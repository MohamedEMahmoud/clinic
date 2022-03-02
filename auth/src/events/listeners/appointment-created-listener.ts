import { Listener, Subjects, AppointmentCreatedEvent } from "@clinic-services/common";
import { Message } from "node-nats-streaming";
import { User } from "../../models/user.model";
import { UserUpdatedPublisher } from "../publishers/user-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class AppointmentCreatedListener extends Listener<AppointmentCreatedEvent> {
    readonly subject = Subjects.AppointmentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: AppointmentCreatedEvent["data"], msg: Message) {

        const doctor = await User.findById(data.doctor);

        if (!doctor) {
            throw new Error("Doctor Not Found");
        }

        doctor.availableDates = [...doctor.availableDates, data.id];

        const doctorData = await doctor.save();

        if (doctorData) {
            await new UserUpdatedPublisher(this.client).publish({
                id: doctor.id,
                version: doctor.version
            });
        }

        msg.ack();

    }

}