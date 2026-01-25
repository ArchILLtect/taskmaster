export type UserRole = "Admin" | "User";

export type User = {
    id: string;
    username: string;
    email: string;
    role: UserRole;
};

export type UserUI = {
    username: string;
    email?: string;
    role?: string;
};
