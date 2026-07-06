import { Router } from 'express';
import { getMe, updateMe, getAllUsers, updateUser, deleteUser, reactivateUser, deleteMe, updateMyPassword, eraseMyData } from '../controllers/userController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { GlobalRole } from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupérer son profil
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *       401:
 *         description: Non authentifié
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/users/updateMe:
 *   patch:
 *     summary: Modifier son profil
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.patch('/updateMe', protect, updateMe);

/**
 * @swagger
 * /api/users/deleteMe:
 *   delete:
 *     summary: Supprimer son compte
 *     tags: [Utilisateurs]
 *     responses:
 *       204:
 *         description: Compte supprimé
 */
router.delete('/deleteMe', protect, deleteMe);

/**
 * @swagger
 * /api/users/me/data:
 *   delete:
 *     summary: Effacer toutes ses données personnelles (RGPD art. 17)
 *     tags: [Utilisateurs]
 *     description: Supprime toutes les entrées du journal, anonymise les articles et supprime le compte conformément au droit à l'oubli.
 *     responses:
 *       200:
 *         description: Données effacées
 */
router.delete('/me/data', protect, eraseMyData);

/**
 * @swagger
 * /api/users/updateMyPassword:
 *   patch:
 *     summary: Changer son mot de passe
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 */
router.patch('/updateMyPassword', protect, updateMyPassword);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (admin)
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       403:
 *         description: Accès refusé
 */
router.get('/', protect, checkRole([GlobalRole.ADMIN]), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Modifier un utilisateur (admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *   delete:
 *     summary: Désactiver un utilisateur (admin)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Utilisateur désactivé
 */
router.patch('/:id', protect, checkRole([GlobalRole.ADMIN]), updateUser);
router.delete('/:id', protect, checkRole([GlobalRole.ADMIN]), deleteUser);
router.patch('/:id/reactivate', protect, checkRole([GlobalRole.ADMIN]), reactivateUser);

export default router;
