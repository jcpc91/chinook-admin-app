/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("artistas", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
    })
    .createTable("generos", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
    })
    .createTable("mediatypes", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
    })
    .createTable("albums", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.string("artistid").notNullable();
      table.foreign("artistid").references("id").inTable("artistas");
    })
    .createTable("tracks", (table) => {
      table.increments("id").primary();
      table.string("nombre");
      table.string("albumId");
      table.string("compositores");
      table.string("mediatype");
      table.string("genero");
      table.string("precio");
      table.foreign("albumId").references("id").inTable("albums");
      table.foreign("mediatype").references("id").inTable("mediatypes");
      table.foreign("genero").references("id").inTable("generos");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("tracks")
    .dropTableIfExists("albums")
    .dropTableIfExists("mediatypes")
    .dropTableIfExists("generos")
    .dropTableIfExists("artistas");
};
