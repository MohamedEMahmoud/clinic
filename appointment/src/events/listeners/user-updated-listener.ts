import { Listener, Subjects, UserUpdatedEvent } from "@clinic-services/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user.model";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
    readonly subject = Subjects.UserUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data: UserUpdatedEvent["data"], msg: Message) {

        const user = await User.findByEvent(data);

        if (!user) {
            throw new Error("User Not Found");
        }

        let fields: { [key: string]: any; } = { ...data };

        if (fields.availableDate) {
            user.availableDates = [...user.availableDates, fields.availableDate];
        }

        delete fields["version"];
        delete fields["availableDate"];

        user.set({ ...fields });

        await user.save();

        msg.ack();
    }
}