import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstname, lastname, email, password, birthdate]
 *             properties:
 *               firstname: { type: string, example: Jean }
 *               lastname:  { type: string, example: Dupont }
 *               email:     { type: string, format: email, example: jean@example.com }
 *               password:  { type: string, format: password, example: "P@ssw0rd!" }
 *               birthdate: { type: string, format: date, example: "1995-06-15" }
 *     responses:
 *       201:
 *         description: Compte créé, token JWT retourné
 *       400:
 *         description: Données invalides
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: jean@example.com }
 *               password: { type: string, format: password, example: "P@ssw0rd!" }
 *     responses:
 *       200:
 *         description: Authentification réussie, token JWT retourné
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', login);

export default router;
