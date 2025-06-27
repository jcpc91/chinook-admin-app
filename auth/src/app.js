const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Enable Express to parse JSON request bodies
app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Login route
app.post('/login', (req, res) => {
  const { user, password } = req.body;

  // Validate credentials
  if (user === 'admin' && password === 'admin') {
    // Generate JWT token
    const token = jwt.sign({ user: 'admin' }, 'your-secret-key', { expiresIn: '2h' });
    res.json({ token });
  } else {
    // Invalid credentials
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
