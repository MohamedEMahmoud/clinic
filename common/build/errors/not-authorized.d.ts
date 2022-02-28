import { CustomError } from "./custom-error";
export declare class NotAuthorizedError extends CustomError {
    statusCode: number;
    constructor();
    serializerErrors(): {
        message: string;
    }[];
}
