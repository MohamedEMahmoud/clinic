import { Subjects } from "./subjects";
import { RoleType } from "../types/role-type";

export interface UserCreatedEvent {
    subject: Subjects.UserCreated;
    data: {
        id: string;
        email: string;
        picture: string;
        coachId: string;
        role: RoleType;
        version: number;
    };
}