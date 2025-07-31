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
            this.db.all(`SELECT t1.EmployeeId as id, t1.LastName, t1.FirstName, t1.Title,
                t1.ReportsTo as ReportsToId,
                t2.LastName as ReportsTo,
                t1.BirthDate,
                t1.HireDate, t1.Address, t1.City, t1.State, t1.Country, t1.PostalCode, t1.Phone, t1.Fax, t1.Email
                FROM ${this.tableName} t1
                left join ${this.tableName} t2 on t1.EmployeeId =  t2.ReportsTo `, [], (err, rows) => {
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
                `SELECT EmployeeId as id, LastName, FirstName, Title, ReportsTo, BirthDate, HireDate, Address, City, State, Country, PostalCode, Phone, Fax, Email
                FROM ${this.tableName} WHERE EmployeeId = ?`,
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
