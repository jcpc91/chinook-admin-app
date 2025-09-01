const BaseRepository = require("./BaseRepository");

class EmployeeRepository extends BaseRepository {
    constructor() {
        super("employees");
    }

    async getAll() {
        try {
            return await this.db.select(
                'e.EmployeeId as id',
                'e.LastName',
                'e.FirstName',
                'e.Title',
                'e.ReportsTo',
                'm.LastName as ReportsToText',
                'e.BirthDate',
                'e.HireDate',
                'e.Address',
                'e.City',
                'e.State',
                'e.Country',
                'e.PostalCode',
                'e.Phone',
                'e.Fax',
                'e.Email'
            )
            .from(`${this.tableName} as e`)
            .leftJoin(`${this.tableName} as m`, 'e.ReportsTo', 'm.EmployeeId');
        } catch (error) {
            console.error("Error fetching all employees:", error);
            throw error;
        }
    }

    async getById(id) {
        try {
            return await this.db.select(
                'e.EmployeeId as id',
                'e.LastName',
                'e.FirstName',
                'e.Title',
                'e.ReportsTo',
                'm.LastName as ReportsToText',
                'e.BirthDate',
                'e.HireDate',
                'e.Address',
                'e.City',
                'e.State',
                'e.Country',
                'e.PostalCode',
                'e.Phone',
                'e.Fax',
                'e.Email'
            )
            .from(`${this.tableName} as e`)
            .leftJoin(`${this.tableName} as m`, 'e.ReportsTo', 'm.EmployeeId')
            .where('e.EmployeeId', id)
            .first();
        } catch (error) {
            console.error(`Error fetching employee by id ${id}:`, error);
            throw error;
        }
    }

    async create(entity) {
        try {
            const [result] = await this.db(this.tableName)
                .insert(entity)
                .returning('EmployeeId as id');

            // Return the created employee with full details
            return await this.getById(result.id);
        } catch (error) {
            console.error("Error creating employee:", error);
            throw error;
        }
    }

    async update(id, entity) {
        try {
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

            await this.db(this.tableName)
                .where('EmployeeId', id)
                .update(data);

            return { id, ...entity };
        } catch (error) {
            console.error(`Error updating employee ${id}:`, error);
            throw error;
        }
    }
}

module.exports = EmployeeRepository;
