export declare abstract class CustomError extends Error {
    abstract statusCode: number;
    constructor(message: string);
    abstract serializerErrors(): {
        message: string;
        field?: string;
    }[];
}
