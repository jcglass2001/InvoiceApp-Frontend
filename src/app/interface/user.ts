export interface User {
     id: number;
     firstName: string;
     lastName: string;
     email: string;
     phone: string;
     address?: string;
     title?: string;
     bio?: string;
     imageUrl?: string;
     isEnabled: boolean;
     isNotLocked: boolean;
     isUsingMfa: boolean;
     createdAt?: Date;
     roleName: string;
     permissions: string;
}
