import type { User } from "../types";

export const mockAdminUser: User = {
    id: "local-dev-user",
    username: "NickHansonSr",
    email: "nick@example.com",
    role: "Admin",
};

export const mockUser: User = {
    id: "local-dev-user-2",
    username: "RegularUser",
    email: "regular@example.com",
    role: "User",
};

export const noUser: null = null;
