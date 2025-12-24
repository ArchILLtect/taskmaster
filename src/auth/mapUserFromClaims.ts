import type { CognitoClaims, User, UserRole } from "../types";

function deriveRoleFromGroups(groups?: string[]): UserRole {
    // Adjust these group names to match your Cognito groups later.
    const adminGroupNames = new Set(["Admin", "Admins", "admin", "admins"]);
    if (!groups) return "User";
    return groups.some((g) => adminGroupNames.has(g)) ? "Admin" : "User";
}

function pickUsername(claims: CognitoClaims): string {
    return (
        claims.preferred_username ||
        claims["cognito:username"] ||
        claims.email ||
        "UnknownUser"
    );
}

export function mapUserFromClaims(claims: CognitoClaims): User {
    return {
        id: claims.sub,
        username: pickUsername(claims),
        email: claims.email || "",
        role: deriveRoleFromGroups(claims["cognito:groups"]),
    };
}
