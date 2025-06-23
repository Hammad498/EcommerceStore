///a middleware on login to check if the user is an admin
import jwt from 'jsonwebtoken';

export const isAdmin = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied, admin role required.' });
        }

        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
}


/////////////////


