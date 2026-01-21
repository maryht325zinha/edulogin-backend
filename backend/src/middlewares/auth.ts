import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token missing' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // @ts-ignore - we know this is safe because of the decode
        req.user = decoded as { id: string; email: string };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};
