class User {
    constructor(data) {
        this.id = data.userID || null;
        this.username = data.userName || "";
        this.nickname = data.nickname || ""; // Nickname
        this.email = data.email || "";
        this.picture = data.picture || ""; // Profile picture
        this.createdAt = data.createdAt || ""; // Account creation date
        this.lastLogin = data.lastLogin || ""; // Last login
        this.role = data.role || "user"; // User role
        this.website = data.website || ""; // Custom field
        this.company = data.company || ""; // Custom field
        this.theme = data.theme || "light"; // Settings
        this.status = data.status || "offline"; // Settings
        this.language = data.language || "en"; // Settings
        this.notifications = data.notifications !== undefined ? data.notifications : true; // Settings
    }

    isUsernameSet() {
        return !!this.username.trim();
    }

    updateUsername(newUsername) {
        if (!newUsername.trim()) throw new Error('Invalid username');
        this.username = newUsername;
    }

    // Save the user to localStorage
    saveToLocalStorage() {
        const serializedUser = JSON.stringify(this);
        localStorage.setItem('user', serializedUser);
    }

    // Load the user from localStorage
    static loadFromLocalStorage() {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser) {
            const userData = JSON.parse(serializedUser);
            return new User(userData);
        }
        return null; // Return null if no user data is found
    }

    // Remove the user from localStorage
    static clearLocalStorage() {
        localStorage.removeItem('user');
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
        };
    }
}

export default User;