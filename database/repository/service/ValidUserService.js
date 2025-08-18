class ValidUserService {
    /**
     *
     * @param {import('../IValidUserRepository')} ivaliduserRepository
     */
    constructor(ivaliduserRepository) {
        this.repository = ivaliduserRepository;

    }

    async validUserPassword(username, password) {
        return await this.repository.validUserPassword(username, password);
    }
}
module.exports = ValidUserService;
