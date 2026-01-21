import { Router } from 'express';
import * as AuthController from './controllers/AuthController';
import * as SitesController from './controllers/SitesController';
import * as CredentialsController from './controllers/CredentialsController';
import { authenticate } from './middlewares/auth';

const router = Router();

// Auth
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticate, AuthController.me);

// Sites
router.get('/sites', SitesController.index);

// Credentials
router.get('/credentials', authenticate, CredentialsController.index);
router.post('/credentials', authenticate, CredentialsController.create);
router.put('/credentials/:id', authenticate, CredentialsController.update);
router.delete('/credentials/:id', authenticate, CredentialsController.remove);

export default router;
