import { EventType } from "../enum/event-type.enum";

export interface UserEvent {
    id: number;
    type: EventType;
    description: string;
    device: string;
    ipAddress: string;
    createdAt: Date;

}