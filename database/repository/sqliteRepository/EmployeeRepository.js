const BaseRepository = require("./BaseRepository");

class EmployeeRepository extends BaseRepository {
    /**
     * CREATE TABLE `employees` (
    `EmployeeId` integer not null primary key autoincrement,
    `LastName` varchar(255) not null,
    `FirstName` varchar(255) not null,
    `Title` varchar(255) not null,
    `ReportsTo` varchar(255) not null,
    `BirthDate` varchar(255) not null,
    `HireDate` varchar(255) not null,
    `Address` varchar(255) not null,
    `City` varchar(255) not null,
    `State` varchar(255) not null,
    `Country` varchar(255) not null,
    `PostalCode` varchar(255) not null,
    `Phone` varchar(255) not null,
    `Fax` varchar(255) not null,
    `Email` varchar(255) not null
    )
     */
    constructor() {
        super("employees");
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT e.EmployeeId as id, e.LastName, e.FirstName, e.Title,
                e.ReportsTo,
                m.LastName as ReportsToText,
                e.BirthDate,
                e.HireDate, e.Address, e.City, e.State, e.Country, e.PostalCode, e.Phone, e.Fax, e.Email, e.role
                FROM ${this.tableName} e
                left join ${this.tableName} m on e.ReportsTo =  m.EmployeeId `, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {

            this.db.get(
                `SELECT e.EmployeeId as id, e.LastName, e.FirstName, e.Title,
                e.ReportsTo,
                m.LastName as ReportsToText,
                e.BirthDate,
                e.HireDate, e.Address, e.City, e.State, e.Country, e.PostalCode, e.Phone, e.Fax, e.Email, e.role
                FROM ${this.tableName} e
                left join ${this.tableName} m on e.ReportsTo =  m.EmployeeId
                WHERE e.EmployeeId = ?`,
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

    async create(entity) {
        const e = await super.create(entity)
        return await this.getById(e.id)
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
                role: entity.role
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
