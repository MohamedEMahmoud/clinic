import { Publisher, Subjects, UserDeletedEvent } from "@clinic-services/common";

export class UserDeletedPublisher extends Publisher<UserDeletedEvent> {
    readonly subject = Subjects.UserDeleted;
}