import { Router } from 'express';
import { getAllArticles, createArticle, updateArticle, deleteArticle, getArticleById, getAllArticlesAdmin, activateArticle } from '../controllers/articleController.js';
import { protect, checkRole, softProtect } from '../middleware/authMiddleware.js';
import { GlobalRole } from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Lister les articles publiés
 *     tags: [Articles]
 *     security: []
 *     responses:
 *       200:
 *         description: Liste des articles actifs
 */
router.get('/', softProtect, checkRole([GlobalRole.ADMIN, GlobalRole.USER, GlobalRole.GUEST]), getAllArticles);

/**
 * @swagger
 * /api/articles/admin:
 *   get:
 *     summary: Lister tous les articles (admin)
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Liste complète (actifs + inactifs)
 *       403:
 *         description: Accès refusé
 *   post:
 *     summary: Créer un article
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, category]
 *             properties:
 *               title:    { type: string }
 *               content:  { type: string }
 *               category: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Article créé
 */
router.get('/admin', protect, checkRole([GlobalRole.ADMIN]), getAllArticlesAdmin);
router.post('/admin', protect, checkRole([GlobalRole.ADMIN]), createArticle);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Récupérer un article par ID
 *     tags: [Articles]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article trouvé
 *       404:
 *         description: Article introuvable
 *   patch:
 *     summary: Modifier un article (admin)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article mis à jour
 *   delete:
 *     summary: Supprimer un article (admin)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Article supprimé
 */
router.get('/:id', softProtect, checkRole([GlobalRole.ADMIN, GlobalRole.USER, GlobalRole.GUEST]), getArticleById);
router.patch('/:id', protect, checkRole([GlobalRole.ADMIN]), updateArticle);
router.delete('/:id', protect, checkRole([GlobalRole.ADMIN]), deleteArticle);
router.patch('/:id/activate', protect, checkRole([GlobalRole.ADMIN]), activateArticle);

export default router;
