const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    family: 4, // Forces Node to use IPv4
})
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((error) => console.log('Database connection failed:', error));

// Basic Test Route
app.get('/', (req, res) => {
    res.send('ZeroWaste API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));