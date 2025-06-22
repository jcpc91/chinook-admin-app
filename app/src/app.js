const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const mediaTypesRouter = require('./routes/mediatypes');

// Use routes
app.use('/mediatypes', mediaTypesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
