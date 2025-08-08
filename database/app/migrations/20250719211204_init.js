/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema

    .createTable('employees', (table) => {
      table.increments('EmployeeId').primary();
      table.string('LastName').notNullable();
      table.string('FirstName').notNullable();
      table.string('Title').notNullable();
      table.string('ReportsTo').notNullable();
      table.string('BirthDate').notNullable();
      table.string('HireDate').notNullable();
      table.string('Address').notNullable();
      table.string('City').notNullable();
      table.string('State').notNullable();
      table.string('Country').notNullable();
      table.string('PostalCode').notNullable();
      table.string('Phone').notNullable();
      table.string('Fax').notNullable();
      table.string('Email').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('employees')
    ;
};
