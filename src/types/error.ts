export interface AppErrorType {
    message: string;
    statusCode: number;
    isOperational: boolean;
    stack?: string;
}
