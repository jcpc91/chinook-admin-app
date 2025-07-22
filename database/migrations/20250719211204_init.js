/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('artistas', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
    })
    .createTable('generos', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
    })
    .createTable('mediatypes', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
    })
    .createTable('albums', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('artistid').notNullable();
      table.foreign('artistid').references('id').inTable('artistas');
    })
    .createTable('tracks', (table) => {
      table.increments('id').primary();
      table.string('nombre');
      table.string('albumId');
      table.string('compositores');
      table.string('mediatype');
      table.string('genero');
      table.string('precio');
      table.foreign('albumId').references('id').inTable('albums');
      table.foreign('mediatype').references('id').inTable('mediatypes');
      table.foreign('genero').references('id').inTable('generos');
    })
    .createTable('traks', (table) => {
      table.increments('id').primary();
      table.string('nombre');
      table.string('albumId');
      table.string('compositores');
      table.string('mediatype');
      table.string('genero');
      table.string('precio');
      table.foreign('albumId').references('id').inTable('albums');
      table.foreign('mediatype').references('id').inTable('mediatypes');
      table.foreign('genero').references('id').inTable('generos');
    })
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
    .dropTableIfExists('traks')
    .dropTableIfExists('tracks')
    .dropTableIfExists('albums')
    .dropTableIfExists('mediatypes')
    .dropTableIfExists('generos')
    .dropTableIfExists('artistas');
};
