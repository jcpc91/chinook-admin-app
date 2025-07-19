const BaseRepository = require('./BaseRepository');

class EmployeeRepository extends BaseRepository {
    constructor() {
        super('employees');
    }
}

module.exports = EmployeeRepository;
