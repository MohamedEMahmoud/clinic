import { Subjects } from "./subjects";
import { RoleType } from "../types/role-type";
export interface UserCreatedEvent {
    subject: Subjects.UserCreated;
    data: {
        id: string;
        email: string;
        role: RoleType;
        picture: string;
        specialization: string;
        phone: string;
        version: number;
    };
}
