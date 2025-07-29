const BaseRepository = require("./BaseRepository");

class EmployeeRepository extends BaseRepository {
    constructor() {
        super("employees");
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM ${this.tableName} WHERE EmployeeId = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                },
            );
        });
    }

    async update(id, entity) {
        return new Promise((resolve, reject) => {
            const data = {
                LastName: entity.LastName,
                FirstName: entity.FirstName,
                Title: entity.Title,
                ReportsTo: entity.ReportsTo,
                BirthDate: entity.BirthDate,
                HireDate: entity.HireDate,
                Address: entity.Address,
                City: entity.City,
                State: entity.State,
                Country: entity.Country,
                PostalCode: entity.PostalCode,
                Phone: entity.Phone,
                Fax: entity.Fax,
                Email: entity.Email,
            };
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((key) => `${key} = ?`).join(", ");

            const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE EmployeeId = ?`;

            this.db.run(sql, [...values, id], function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ id, ...entity });
            });
        });
    }
}

module.exports = EmployeeRepository;
