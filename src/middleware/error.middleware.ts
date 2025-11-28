import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large' });
    }
    return res
        .status(500)
        .json({ message: 'Internal Server Error', error: err.message });
};
