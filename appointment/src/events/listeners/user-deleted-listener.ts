import { Listener, RoleType, Subjects, UserDeletedEvent } from "@clinic-services/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user.model";
import { Appointment } from "../../models/appointment.model";

export class UserDeletedListener extends Listener<UserDeletedEvent> {
    readonly subject = Subjects.UserDeleted;
    queueGroupName = queueGroupName;
    async onMessage(data: UserDeletedEvent["data"], msg: Message) {

        const user = await User.findByIdAndDelete(data.id);

        if (!user) {
            throw new Error("User Not Found");
        }

        if (user.role === RoleType.Doctor) {
            await Appointment.deleteMany({ doctor: user.id });
        } else {
            await Appointment.deleteMany({ patient: user.id });
        }

        msg.ack();
    }
}