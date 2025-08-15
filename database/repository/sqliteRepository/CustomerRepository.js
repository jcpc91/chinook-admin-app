const BaseRepository = require("./BaseRepository");

class CustomerRepository extends BaseRepository {
    constructor() {
        super("customers");
    }

    async getAll() {
        return super.getAll().then((rows) => rows.map((m) => this.mapToCustomer(m)));
    }

    mapToCustomer(row) {
        return {
            id: row.CustomerId,
            FirstName: row.FirstName,
            LastName: row.LastName,
            Company: row.Company,
            Address: row.Address,
            City: row.City,
            State: row.State,
            Country: row.Country,
            PostalCode: row.PostalCode,
            Phone: row.Phone,
            Fax: row.Fax,
            Email: row.Email,
            SupportRepId: row.SupportRepId,
        };
    }
}

module.exports = CustomerRepository;
