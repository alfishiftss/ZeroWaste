const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');

const app = express();

// Use public DNS resolvers so Atlas SRV records can resolve even when the
// local network DNS server cannot handle MongoDB's `_mongodb._tcp` lookup.
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean));
} else {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connectDatabase = async () => {
    const candidateUris = [
        process.env.MONGO_URI,
        process.env.MONGO_FALLBACK_URI,
        'mongodb://127.0.0.1:27017/ZeroWaste',
    ].filter(Boolean);

    for (const uri of candidateUris) {
        try {
            await mongoose.connect(uri, {
                family: 4,
                serverSelectionTimeoutMS: 8000,
                connectTimeoutMS: 8000,
            });

            const label = uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'local MongoDB';
            console.log(`Successfully connected to ${label}!`);
            return;
        } catch (error) {
            const label = uri.startsWith('mongodb+srv://') ? 'Atlas URI' : uri;
            console.log(`Database connection failed for ${label}:`, error.message);

            if (mongoose.connection.readyState === 1) {
                await mongoose.disconnect();
            }
        }
    }

    console.log(
        'MongoDB is not connected. If you are running locally, start MongoDB on 127.0.0.1:27017 or set MONGO_FALLBACK_URI.'
    );
};

connectDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

// Basic Test Route
app.get('/', (req, res) => {
    res.send('ZeroWaste API is running!');
});

// Error handler — catches Multer/upload errors and returns JSON instead of HTML
app.use((err, req, res, next) => {
    if (!err) return next();
    res.status(400).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
