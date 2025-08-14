/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("portafolio", table => {
        table.increments("id").primary();
        table.string("casabolsa").notNullable();// nombre de la empresa en la bolsa donde se compra
        table.string("ticker").notNullable();// ticker de la empresa
        //table.string("moneda").notNullable();
        table.decimal("precio", 10, 2).notNullable();// precio de compra
        table.decimal("cantidad", 10, 2).notNullable();// cantidad de acciones o unidades
        //table.decimal("costoinicial", 10, 2).notNullable();
        //TODO: este campo será calculado
        //table.decimal("ganancia", 10, 2).notNullable();// ganancia o perdida
        table.date("fecha").notNullable();// fecha de compra
        table.foreign("ticker").references("ticker").inTable("activos"); // relacion con activos
    })
    .createTable("tiposactivos", table => {
        table.string("codigo").primary(); // codigo del tipo de activo
        table.string("categoria").notNullable(); // categoria del tipo de activo
        table.string("subcategoria").notNullable(); // subcategoria del tipo de activo
        table.string("nivelriesgo").nullable(); // Nivel de riesgo (Bajo / Medio / Alto)
        table.string("horizonteinversion").nullable(); // Horizonte típico de inversión (Corto, Mediano, Largo plazo)
        table.string("liquidez").nullable(); // Liquidez (Alta, Media, Baja)
    })
    .createTable("activos", table => {
        table.string("ticker").primary(); // ticker de la empresa
        table.string("nombre").notNullable();//nombre de la empresa o activo
        table.string("tipo").notNullable();//tipo de activo
        table.decimal("valormercado", 10, 2).notNullable();// valor de mercado actual

        table.foreign("tipo").references("codigo").inTable("tiposactivos"); // relacion con tiposactivos
    })
    ;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists("portafolio")
    .dropTableIfExists("tiposactivos")
    ;
};
