import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { check } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
    '/signup',
    [
        check('id', 'ID (email or phone) is required').notEmpty(),
        check('password', 'Password must be at least 4 chars').isLength({
            min: 4,
        }),
    ],
    AuthController.signup
);

router.post('/signin', AuthController.signin);
router.post('/signin/new_token', AuthController.refreshToken);

router.get('/info', authMiddleware, AuthController.info);
router.get('/logout', authMiddleware, AuthController.logout);

// router.post("/file/upload", authMiddleware, ...);
// router.get("/file/list", authMiddleware, ...);

export default router;
