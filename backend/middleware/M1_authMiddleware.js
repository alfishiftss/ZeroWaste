const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ────────────────────────────────────────────────────────────
// M1_protect — verifies JWT and attaches full user to req.user
// Unlike the lightweight `auth.js` middleware that trusts the
// token payload alone, this one re-fetches the user document so
// downstream handlers always have the freshest role/ban state.
// ────────────────────────────────────────────────────────────
const M1_protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized — no token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify signature + expiry
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            const msg =
                err.name === 'TokenExpiredError'
                    ? 'Session expired — please log in again'
                    : 'Not authorized — token is invalid';
            return res.status(401).json({ message: msg });
        }

        // Re-hydrate from the database so role changes / bans take effect
        // immediately without needing a fresh token.
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized — user no longer exists' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized — authentication failed' });
    }
};

// ────────────────────────────────────────────────────────────
// M1_authorize — role gate (variadic: pass one or more roles)
// Usage: router.get('/admin', M1_protect, M1_authorize('Admin'), handler)
// ────────────────────────────────────────────────────────────
const M1_authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden — requires one of: ${roles.join(', ')}`,
            });
        }
        next();
    };
};

module.exports = { M1_protect, M1_authorize };
