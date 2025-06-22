const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const mediaTypesRouter = require('./routes/mediatypes');
const generosRouter = require('./routes/generos');
const artistasRouter = require('./routes/artistas');

// Use routes
app.use('/mediatypes', mediaTypesRouter);
app.use('/generos', generosRouter);
app.use('/artistas', artistasRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
