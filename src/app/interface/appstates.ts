import { DataState } from "../enum/datastate.enum";
import { Customer } from "./customer";
import { UserEvent } from "./event";
import { Role } from "./role";
import { User } from "./user";

export interface LoginState {
    dataState: DataState;
    loginSuccess?: boolean;
    error?: string;
    message?: string;
    isUsingMfa?: boolean
    phone?: string
}
export interface State<T> {
    dataState: DataState;
    appData?: T;
    error?: string;
}
export interface CustomHttpResponse<T> {
    timestamp: Date;
    statusCode: number;
    status: string;
    message: string;
    reason?: string;
    developerMessage?: string;
    data?: T;
}
export interface Profile {
    user: User;
    events?: UserEvent[];
    roles?: Role[];
    access_token?: string;
    refresh_token?: string;
}
export interface Page {
    content: Customer[]
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
    size: number;
    number: number;
}