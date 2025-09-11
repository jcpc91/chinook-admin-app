/**
 * CREATE TABLE `tiposactivos` (`codigo` varchar(255), `categoria` varchar(255) not null, `subcategoria` varchar(255) not null, `nivelriesgo` varchar(255) null, `horizonteinversion` varchar(255) null, `liquidez` varchar(255) null, primary key (`codigo`));
 */
module.exports = {
    "type": "object",
    "properties": {
        "codigo": { "type": "string" },
        "categoria": { "type": "string" },
        "subcategoria": { "type": "string" },
        "nivelriesgo": { "type": "string" },
        "horizonteinversion": { "type": "string" },
        "liquidez": { "type": "string" }
    },
    "required": ["categoria", "subcategoria"]
}
