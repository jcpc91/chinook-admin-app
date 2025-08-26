module.exports = {
    type: "object",
    properties: {
        ticker: { type: "string" },
        nombre: { type: "string" },
        tipo: { type: "string" },
        valormercado: { type: "number" }
    },
    required: ["ticker", "nombre", "tipo", "valormercado"]
}
