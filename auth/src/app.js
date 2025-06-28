const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require("dotenv").config();
console.log("env: ", process.env);
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Enable Express to parse JSON request bodies
app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
app.get('/', (req, res) => {
  res.send('hola mundo auth')
})
// Login route
app.post('/', (req, res) => {
  const { user, password } = req.body;

  // Validate credentials
  if (user === 'admin' && password === 'admin') {
    // Generate JWT token
    const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECREAT_KEY, { expiresIn: '2h' });
    res.json({ token });
  } else {
    // Invalid credentials
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
