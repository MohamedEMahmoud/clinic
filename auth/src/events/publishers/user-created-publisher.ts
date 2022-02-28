import { Publisher, Subjects, UserCreatedEvent } from "@clinic-services/common";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    readonly subject = Subjects.UserCreated;
}