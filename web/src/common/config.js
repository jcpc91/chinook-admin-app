const config = {
  employeeHeaders: [
    { text: 'Apellido', value: 'LastName' },
    { text: 'Nombre', value: 'FirstName' },
    { text: 'Título', value: 'Title' },
    { text: 'Reporta a', value: 'ReportsTo' },
    { text: 'Nacimiento', value: 'BirthDate' },
    { text: 'Contratación', value: 'HireDate' },
    { text: 'Ciudad', value: 'City' },
    { text: 'Estado', value: 'State' },
    { text: 'País', value: 'Country' },
    { text: 'Código Postal', value: 'PostalCode' },
    { text: 'Teléfono', value: 'Phone' },
    { text: 'Email', value: 'Email' },
  ],
  //{ CustomerId: 1, FirstName: "Maria", LastName: "Anders", Company: "Alfreds Futterkiste", Address: "Obere Str. 57", City: "Berlin", State: null, Country: "Germany", PostalCode: "12209", Phone: "030-0074321", Fax: "030-0076545", Email: "maria.anders@example.com", SupportRepId: 2 },
  clientesHeaders: [
    { text: 'Apellido', value: 'LastName' },
    { text: 'Nombre', value: 'FirstName' },
    { text: 'Compañía', value: 'Company' },
    { text: 'Dirección', value: 'Address' },
    { text: 'Ciudad', value: 'City' },
    { text: 'Estado', value: 'State' },
    { text: 'País', value: 'Country' },
    { text: 'Código Postal', value: 'PostalCode' },
    { text: 'Teléfono', value: 'Phone' },
    { text: 'Fax', value: 'Fax' },
    { text: 'Email', value: 'Email' },
    { text: 'Soporte', value: 'SupportRepId' },
  ],
  traksHeaders: [
    { text: "Id", value: "id" },
    { text: "Album", value: "albumId" },
    { text: "Nombre", value: "nombre" },
    { text: "Compositores", value: "compositores" },
    { text: "Tipo", value: "mediatype" },
    { text: "Genero", value: "genero" },
    { text: "Precio", value: "precio" },
  ]
}

export default config
