const ActivosService = require('./ActivosService')
const ActivoRepository = require('../sqlite3/activos.respository')


test('crear nuevo activo', async() => {
    const service = new ActivosService(new ActivoRepository())
    const entity = { ticker: "AAPL", nombre: "Apple Inc.", tipo: "Acciones", valormercado: 150.75 }
    const result = await service.add(entity)
    console.log(result)
    expect(result).toBeDefined()
})
