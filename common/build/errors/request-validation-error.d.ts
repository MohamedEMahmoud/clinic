import { CustomError } from "./custom-error";
import { ValidationError } from "express-validator";
export declare class RequestValidationError extends CustomError {
    errors: ValidationError[];
    statusCode: number;
    constructor(errors: ValidationError[]);
    serializerErrors(): {
        message: any;
        field: string;
    }[];
}
