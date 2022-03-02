import { Publisher, Subjects, AppointmentCreatedEvent } from "@clinic-services/common";

export class AppointmentCreatedPublisher extends Publisher<AppointmentCreatedEvent>{
    readonly subject = Subjects.AppointmentCreated;
}