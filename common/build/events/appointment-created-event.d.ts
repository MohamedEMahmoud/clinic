import { Subjects } from "./subjects";
export interface AppointmentCreatedEvent {
    subject: Subjects.AppointmentCreated;
    data: {
        id: string;
        doctorId: string;
        patientId?: string;
    };
}
