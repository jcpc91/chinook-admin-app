class IValidUserRepository {
    async validUserPassword(username, password) {
        throw new Error("Method 'validUserPassword' must be implemented.");
    }
}
module.exports = IValidUserRepository;
