import { Listener, Subjects, UserCreatedEvent } from "@clinic-services/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user.model";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    readonly subject = Subjects.UserCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: UserCreatedEvent["data"], msg: Message) {

        const user = User.build({
            id: data.id,
            email: data.email,
            username: data.username,
            age: data.age,
            role: data.role,
            picture: data.picture,
            specialization: data.specialization,
            phone: data.phone,
            version: data.version
        });

        await user.save();

        msg.ack();
    }
}