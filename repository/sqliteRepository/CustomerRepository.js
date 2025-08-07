const BaseRepository = require('./BaseRepository');

class CustomerRepository extends BaseRepository {
    constructor() {
        super('customers');
    }
}

module.exports = CustomerRepository;
