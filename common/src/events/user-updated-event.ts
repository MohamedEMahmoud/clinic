import { Subjects } from "./subjects";
import { RoleType } from "../types/role-type";

export interface UserUpdatedEvent {
    subject: Subjects.UserUpdated;
    data: {
        id: string;
        username?: string;
        email?: string;
        age?: number;
        role?: RoleType;
        picture?: string;
        specialization?: string;
        phone?: string;
        availableDate?: string;
        version: number;
    };
}