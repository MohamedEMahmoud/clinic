import { Subjects } from "./subjects";
import { RoleType } from "../types/role-type";

export interface UserUpdatedEvent {
    subject: Subjects.UserUpdated;
    data: {
        id: string;
        email?: string;
        picture?: string;
        coachId?: string;
        role?: RoleType;
        version: number;
    };
}