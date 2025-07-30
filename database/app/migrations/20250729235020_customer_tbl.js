/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('customers', (table) => {
        table.increments("CustomerId").primary()
        table.string("FirstName").notNullable()
        table.string("LastName").notNullable()
        table.string("Company").notNullable()
        table.string("Address").notNullable()
        table.string("City").notNullable()
        table.string("State").notNullable()
        table.string("Country").notNullable()
        table.string("PostalCode").notNullable()
        table.string("Phone").nullable()
        table.string("Fax").nullable()
        table.string("Email").nullable()
        table.integer("SupportRepId").notNullable()
        table.foreign("SupportRepId").references("EmployeeId").inTable("employees")


    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTable("customers")
};
