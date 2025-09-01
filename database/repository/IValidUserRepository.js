class IValidUserRepository {
    async validUserPassword(username, password) {
        throw new Error("Method 'validUserPassword' must be implemented.");
    }

    async testConnection() {
        throw new Error("Method 'testConnection' must be implemented.");
    }
}
module.exports = IValidUserRepository;
