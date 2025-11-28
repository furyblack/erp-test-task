import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { Token } from '../entity/Token';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(Token);

const generateTokens = (userId: number) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET as string,
        {
            expiresIn: (process.env.JWT_EXPIRATION ||
                '10m') as jwt.SignOptions['expiresIn'],
        }
    );
    const refreshToken = jwt.sign(
        { id: userId },
        (process.env.JWT_REFRESH_SECRET as string) || '30d',
        {
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION ||
                '30d') as jwt.SignOptions['expiresIn'],
        }
    );
    return { accessToken, refreshToken };
};

export class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Registration error',
                    errors: errors.array(),
                });
            }

            const { id, password } = req.body;

            const candidate = await userRepository.findOne({
                where: { login: id },
            });
            if (candidate) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashPassword = await bcrypt.hash(password, 5);

            const user = new User();
            user.login = id;
            user.password = hashPassword;
            await userRepository.save(user);

            const tokens = generateTokens(user.id);

            const tokenEntity = new Token();
            tokenEntity.refreshToken = tokens.refreshToken;
            tokenEntity.user = user;
            tokenEntity.userAgent = req.headers['user-agent'] || 'unknown';
            await tokenRepository.save(tokenEntity);

            return res.json({ ...tokens });
        } catch (e) {
            return next(e);
        }
    }

    static async signin(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, password } = req.body;

            const user = await userRepository.findOne({ where: { login: id } });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Invalid password' });
            }

            const tokens = generateTokens(user.id);

            const tokenEntity = new Token();
            tokenEntity.refreshToken = tokens.refreshToken;
            tokenEntity.user = user;
            tokenEntity.userAgent = req.headers['user-agent'] || 'unknown';
            await tokenRepository.save(tokenEntity);

            return res.json({ ...tokens });
        } catch (e) {
            return next(e);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userData = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string
            ) as { id: number };

            const tokenFromDb = await tokenRepository.findOne({
                where: { refreshToken },
            });

            if (!userData || !tokenFromDb) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const user = await userRepository.findOne({
                where: { id: userData.id },
            });
            if (!user)
                return res.status(400).json({ message: 'User not found' });

            const newTokens = generateTokens(user.id);

            tokenFromDb.refreshToken = newTokens.refreshToken;
            await tokenRepository.save(tokenFromDb);

            return res.json({ ...newTokens });
        } catch (e) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }

    static async info(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            return res.json({ id: userId });
        } catch (e) {
            return next(e);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.query.refreshToken as string;

            if (!refreshToken) {
                return res
                    .status(400)
                    .json({ message: 'Refresh token required for logout' });
            }

            const deleteResult = await tokenRepository.delete({ refreshToken });

            if (deleteResult.affected === 0) {
                return res
                    .status(400)
                    .json({ message: 'Token not found or already logged out' });
            }

            return res.json({ message: 'Logout success' });
        } catch (e) {
            return next(e);
        }
    }
}
