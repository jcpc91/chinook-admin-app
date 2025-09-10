const TipoActivoService = require('./TipoActivosService')
const TiposActivosRespository = require('../inMemory/tiposactivos.repository')

test("crea nuevo tipo servicio", async () => {
    const repository = new TiposActivosRespository()
    const tipoServicio = new TipoActivoService(repository)
    const value = { "categoria": "Renta Fija", "subcategoria": "Bonos corporativos", "horizonteinversion": "Mediano Plazo", "liquidez": "Media", "nivelriesgo": "Medio-Bajo", "codigo": "f43e" }

    const tipo = await tipoServicio.add(value)
    console.log(tipo)
    expect(tipo).toBeDefined()
})
