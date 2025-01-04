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

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
        };
    }
}

export default User;