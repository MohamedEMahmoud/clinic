import { Publisher, Subjects, UserUpdatedEvent } from "@clinic-services/common";

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
    readonly subject = Subjects.UserUpdated;
}