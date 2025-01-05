class User {
    constructor(data) {
        console.log("User class constructor data:", data);
        this.id = data.userID || null;
        this.username = data.userName || '';
        this.email = data.email || '';
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