import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string | number };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded as { id: string | number };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized' });
    }
};
