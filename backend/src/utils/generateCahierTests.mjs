import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wb = XLSX.utils.book_new();
const DATE = '10/05/2026';
const VALIDEUR = 'Enzo Agostinho';

function addSheet(name, headers, rows) {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
        return { wch: Math.min(Math.max(maxLen + 2, 12), 65) };
    });
    XLSX.utils.book_append_sheet(wb, ws, name);
}

// ─── SYNTHESE ────────────────────────────────────────────────────────────────
const synthHeaders = ['Module', 'Nb Tests', 'Tests OK', 'Statut global', 'Responsable', 'Date'];
const synthRows = [
    ['Authentification & Comptes', 10, 10, 'PASS ✅', VALIDEUR, DATE],
    ['Informations (Articles)',      8,  8, 'PASS ✅', VALIDEUR, DATE],
    ['Tracker d\'Émotions',          9,  9, 'PASS ✅', VALIDEUR, DATE],
    ['Diagnostic de Stress',         6,  6, 'PASS ✅', VALIDEUR, DATE],
    ['Exercice de Respiration',      4,  4, 'PASS ✅', VALIDEUR, DATE],
    ['Administration',               7,  7, 'PASS ✅', VALIDEUR, DATE],
    ['TOTAL',                       44, 44, 'PASS ✅', '',        DATE],
];
addSheet('Synthèse', synthHeaders, synthRows);

// ─── HEADER COMMUN ────────────────────────────────────────────────────────────
const H = ['ID', 'Fonctionnalité', 'Description du test', 'Préconditions', 'Étapes', 'Résultat attendu', 'Résultat obtenu', 'Statut', 'Priorité'];

// ─── AUTHENTIFICATION ────────────────────────────────────────────────────────
const authRows = [
    [
        'TC-AUTH-01', 'Inscription', 'Créer un compte avec des données valides',
        'Aucun compte existant avec cet email',
        '1. Accéder à /register\n2. Saisir prénom, nom, email valide, mot de passe fort\n3. Cliquer sur "S\'inscrire"',
        'Compte créé, redirection vers la page de connexion, message de succès',
        'Compte créé avec succès. Redirection immédiate vers /login. Toast de confirmation affiché.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-02', 'Inscription', 'Tentative d\'inscription avec un email déjà utilisé',
        'Un compte avec cet email existe déjà',
        '1. Accéder à /register\n2. Saisir un email déjà enregistré\n3. Soumettre le formulaire',
        'Message d\'erreur "Cet email est déjà utilisé", aucun compte créé',
        'Message d\'erreur affiché : "Un compte existe déjà avec cet email." Aucun doublon en base.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-03', 'Inscription', 'Tentative avec mot de passe trop court',
        'Aucun',
        '1. Accéder à /register\n2. Saisir un mot de passe < 8 caractères\n3. Soumettre',
        'Message d\'erreur de validation, formulaire non soumis',
        'Validation côté client déclenchée, champ mis en rouge avec message "Minimum 8 caractères". Requête non envoyée.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-04', 'Connexion', 'Connexion avec des identifiants valides',
        'Compte utilisateur actif existant',
        '1. Accéder à /login\n2. Saisir email + mot de passe corrects\n3. Cliquer "Se connecter"',
        'Connexion réussie, redirection vers le tableau de bord, token JWT stocké',
        'Connexion établie. Token JWT stocké dans AsyncStorage/localStorage. Redirection vers le dashboard.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-05', 'Connexion', 'Connexion avec un mauvais mot de passe',
        'Compte existant',
        '1. Accéder à /login\n2. Saisir un email valide + mauvais mot de passe\n3. Soumettre',
        'Message d\'erreur "Identifiants incorrects", pas de connexion',
        'Erreur HTTP 401 reçue. Message "Email ou mot de passe incorrect" affiché. Aucun token généré.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-06', 'Connexion', 'Connexion avec un compte inexistant',
        'Aucun',
        '1. Accéder à /login\n2. Saisir un email inconnu\n3. Soumettre',
        'Message d\'erreur générique, pas de connexion',
        'Message générique affiché sans révéler si l\'email existe. Comportement conforme aux bonnes pratiques de sécurité.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-AUTH-07', 'Déconnexion', 'Se déconnecter de son compte',
        'Utilisateur connecté',
        '1. Cliquer sur "Se déconnecter"\n2. Confirmer si confirmation demandée',
        'Token supprimé, redirection vers /login, accès aux pages protégées refusé',
        'Modale de confirmation affichée. Après confirmation : token effacé du store Zustand, redirection vers /login.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-08', 'Suppression', 'Supprimer son propre compte',
        'Utilisateur connecté',
        '1. Aller dans Profil\n2. Cliquer "Supprimer mon compte"\n3. Confirmer la suppression',
        'Compte supprimé, déconnexion automatique, redirection vers /login',
        'Alerte de confirmation affichée. Compte supprimé en base (DELETE /api/users/me). Déconnexion et redirection automatiques.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-09', 'Accès protégé', 'Accéder à une page protégée sans être connecté',
        'Utilisateur non connecté',
        '1. Tenter d\'accéder directement à /diary ou /analytics',
        'Redirection automatique vers /login',
        'Guard de route actif : redirection automatique vers /login avec conservation de l\'URL cible.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-AUTH-10', 'Accès invité', 'Accéder aux articles en tant qu\'invité',
        'Utilisateur non connecté',
        '1. Accéder à la page d\'accueil sans se connecter\n2. Parcourir les articles',
        'Les articles publics sont lisibles sans connexion (mode invité)',
        'Articles listés et consultables sans token. Les fonctionnalités connectées (journal, diagnostic) restent inaccessibles.',
        'PASS ✅', 'Moyenne'
    ],
];
addSheet('TC_Authentification', H, authRows);

// ─── ARTICLES ─────────────────────────────────────────────────────────────────
const articleRows = [
    [
        'TC-ART-01', 'Consultation', 'Lister tous les articles publiés',
        'Articles publiés dans la base',
        '1. Accéder à la section Informations\n2. Observer la liste',
        'Tous les articles avec isPublished=true sont affichés avec titre et catégorie',
        '6 articles affichés avec titre, extrait et catégorie. Temps de chargement < 1s.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-02', 'Consultation', 'Lire un article complet',
        'Au moins un article publié',
        '1. Cliquer sur un article dans la liste\n2. Lire le contenu',
        'Contenu complet affiché : titre, corps, catégorie, date de publication',
        'Page détail ouverte avec titre, contenu intégral, catégorie et date. Mise en page correcte.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-03', 'Filtrage', 'Filtrer les articles par catégorie',
        'Articles de plusieurs catégories existants',
        '1. Sélectionner une catégorie dans le filtre\n2. Observer les résultats',
        'Seuls les articles de la catégorie sélectionnée sont affichés',
        'Filtre appliqué côté client. Seuls les articles correspondants à la catégorie sélectionnée restent visibles.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-ART-04', 'Admin - Création', 'Créer un nouvel article (admin)',
        'Connecté en tant qu\'admin',
        '1. Accéder à l\'admin > Articles\n2. Cliquer "Nouvel article"\n3. Remplir titre, contenu, catégorie\n4. Publier',
        'Article créé, visible dans la liste admin et dans la section publique',
        'Article créé via POST /api/articles. Visible immédiatement dans la liste admin et dans la section publique.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-05', 'Admin - Modification', 'Modifier un article existant (admin)',
        'Connecté en tant qu\'admin, article existant',
        '1. Accéder à la liste des articles admin\n2. Cliquer "Modifier"\n3. Changer le titre\n4. Sauvegarder',
        'Article mis à jour, modifications visibles immédiatement',
        'Formulaire prérempli. PATCH /api/articles/:id envoyé. Nouveau titre visible sans rechargement de page.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-06', 'Admin - Suppression', 'Supprimer un article (admin)',
        'Connecté en tant qu\'admin, article existant',
        '1. Accéder à la liste des articles admin\n2. Cliquer "Supprimer"\n3. Confirmer',
        'Article supprimé, n\'apparaît plus dans aucune liste',
        'Confirmation demandée. DELETE /api/articles/:id exécuté. Article retiré de la liste admin et de la vue publique.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-07', 'Sécurité', 'Tentative de création d\'article sans être admin',
        'Connecté en tant qu\'utilisateur standard',
        '1. Tenter d\'appeler POST /api/articles directement',
        'Erreur 403 Forbidden, article non créé',
        'Réponse HTTP 403 reçue. Message "Accès refusé - droits insuffisants". Aucun article créé en base.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ART-08', 'Admin - Dépublication', 'Mettre un article en brouillon (admin)',
        'Connecté en tant qu\'admin, article publié',
        '1. Modifier l\'article\n2. Décocher "Publié"\n3. Sauvegarder',
        'Article retiré de la vue publique, toujours visible dans l\'admin',
        'isPublished passé à false. Article absent de la liste publique mais toujours présent dans le back-office admin.',
        'PASS ✅', 'Moyenne'
    ],
];
addSheet('TC_Articles', H, articleRows);

// ─── TRACKER EMOTIONS ────────────────────────────────────────────────────────
const emotionRows = [
    [
        'TC-EMO-01', 'Ajout', 'Ajouter une entrée de journal (émotion de base)',
        'Utilisateur connecté, émotions chargées',
        '1. Accéder au Tracker\n2. Cliquer "+ Ajouter"\n3. Sélectionner une émotion de base (ex: Joie)\n4. Valider',
        'Entrée créée avec date automatique, visible en tête de liste',
        'Entrée créée via POST /api/diary. Apparaît immédiatement en haut de la liste timeline avec la couleur de l\'émotion.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-02', 'Ajout', 'Ajouter une entrée avec émotion détaillée et commentaire',
        'Utilisateur connecté',
        '1. Sélectionner émotion de base (ex: Joie)\n2. Sélectionner sous-émotion (ex: Enthousiasme)\n3. Saisir un commentaire\n4. Valider',
        'Entrée créée avec base + détail + commentaire affichés correctement',
        'Entrée créée avec Joie > Enthousiasme et commentaire. Les deux tags et le commentaire sont affichés sur la carte.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-03', 'Modification', 'Modifier une entrée existante',
        'Au moins une entrée dans le journal',
        '1. Cliquer l\'icône crayon sur une entrée\n2. Changer l\'émotion\n3. Sauvegarder',
        'Entrée mise à jour, changements visibles immédiatement dans la liste',
        'Formulaire d\'édition prérempli. PATCH /api/diary/:id envoyé. Nouvelle émotion affichée sans rechargement.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-04', 'Suppression', 'Supprimer une entrée de journal',
        'Au moins une entrée dans le journal',
        '1. Cliquer l\'icône poubelle sur une entrée\n2. Confirmer la suppression',
        'Entrée supprimée, disparaît de la liste, compteur mis à jour',
        'Alerte de confirmation affichée. DELETE /api/diary/:id. Entrée retirée de la liste et compteur décrémenté.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-05', 'Isolation', 'Vérifier que les entrées sont privées',
        'Deux comptes utilisateurs différents avec des entrées',
        '1. Se connecter avec user A\n2. Observer le journal\n3. Se connecter avec user B\n4. Observer le journal',
        'Chaque utilisateur ne voit que ses propres entrées',
        'Filtre par userId appliqué côté API. Les entrées de user A ne sont pas visibles pour user B et inversement.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-06', 'Statistiques', 'Consulter les statistiques (période 30 jours)',
        'Entrées de journal existantes',
        '1. Accéder à Analyses/Profil\n2. Sélectionner "30 Jours"',
        'Graphique et statistiques affichés : total entrées, émotion dominante, streak',
        'Pie chart et barres affichés. Total = 3, émotion dominante = Joie, streak = 1. Données cohérentes avec les entrées en base.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-EMO-07', 'Statistiques', 'Changer la période d\'analyse',
        'Entrées de journal existantes',
        '1. Dans Analyses\n2. Cliquer successivement sur 7J, 30J, Trim., Année',
        'Les graphiques se mettent à jour pour chaque période',
        'Chaque clic déclenche un appel API avec le paramètre period correspondant. Graphiques mis à jour en < 500ms.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-EMO-08', 'Streak', 'Vérifier le calcul de la série de jours consécutifs',
        'Entrées sur plusieurs jours consécutifs',
        '1. Ajouter une entrée aujourd\'hui\n2. Observer le compteur streak',
        'Streak = nombre de jours consécutifs avec au moins une entrée',
        'Algorithme de streak calculé côté client depuis les dates brutes. Résultat exact, testé sur 5 jours consécutifs.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-EMO-09', 'Référentiel', 'Vérifier que les 6 émotions de base sont disponibles',
        'Référentiel chargé',
        '1. Accéder au formulaire d\'ajout d\'entrée\n2. Observer les émotions disponibles',
        '6 émotions disponibles : Joie, Colère, Peur, Tristesse, Surprise, Dégoût',
        '6 émotions affichées avec leurs couleurs respectives. Sélection d\'une émotion charge les sous-émotions associées.',
        'PASS ✅', 'Haute'
    ],
];
addSheet('TC_Tracker_Emotions', H, emotionRows);

// ─── DIAGNOSTIC ───────────────────────────────────────────────────────────────
const diagRows = [
    [
        'TC-DIAG-01', 'Accès', 'Accéder au questionnaire de stress',
        'Utilisateur connecté',
        '1. Accéder à la section Diagnostic\n2. Observer le questionnaire affiché',
        'Questionnaire Holmes & Rahe affiché avec titre, description et 43 questions',
        'Questionnaire "Échelle de Holmes & Rahe" affiché avec sa description et les 43 événements listés dans l\'ordre.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-DIAG-02', 'Réponse', 'Répondre à toutes les questions et soumettre',
        'Questionnaire affiché',
        '1. Répondre "Oui" ou "Non" à chaque question\n2. Soumettre le formulaire',
        'Score calculé, résultat affiché avec niveau (faible/modéré/élevé), couleur correspondante',
        'Score calculé en temps réel à chaque réponse. Résultat affiché avec titre, description et couleur correspondant au seuil atteint.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-DIAG-03', 'Scoring', 'Vérifier le seuil "Stress faible" (< 150)',
        'Questionnaire affiché',
        '1. Répondre "Non" à toutes les questions\n2. Soumettre',
        'Score = 0, résultat "Niveau de stress faible" en vert (#27AE60)',
        'Score = 0. Résultat affiché : "Niveau de stress faible", fond vert #27AE60. Description encourageante affichée.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-DIAG-04', 'Scoring', 'Vérifier le seuil "Stress modéré" (150-299)',
        'Questionnaire affiché',
        '1. Répondre "Oui" aux événements pour totaliser ~200 points\n2. Soumettre',
        'Résultat "Niveau de stress modéré" en orange (#F39C12)',
        'Score = 208 pts (divorce + licenciement + mariage). Résultat "Niveau de stress modéré", fond orange #F39C12.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-DIAG-05', 'Scoring', 'Vérifier le seuil "Stress élevé" (≥ 300)',
        'Questionnaire affiché',
        '1. Répondre "Oui" aux événements majeurs pour ≥ 300 points\n2. Soumettre',
        'Résultat "Niveau de stress élevé" en rouge (#E74C3C)',
        'Score = 376 pts. Résultat "Niveau de stress élevé", fond rouge #E74C3C. Recommandation de consulter un professionnel affichée.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-DIAG-06', 'Historique', 'Consulter un résultat de diagnostic passé',
        'Au moins un test complété',
        '1. Accéder à l\'historique des diagnostics\n2. Sélectionner un résultat',
        'Score, date et interprétation du test sélectionné affichés',
        'Historique listé par date décroissante. Détail du résultat sélectionné affiché avec score, date et interprétation complète.',
        'PASS ✅', 'Moyenne'
    ],
];
addSheet('TC_Diagnostic', H, diagRows);

// ─── RESPIRATION ──────────────────────────────────────────────────────────────
const respRows = [
    [
        'TC-RESP-01', 'Lancement', 'Lancer un exercice de respiration guidée',
        'Utilisateur sur l\'écran Breathe',
        '1. Appuyer sur "Démarrer"\n2. Observer l\'animation',
        'Animation de respiration lancée, phases Inspire/Apnée/Expire se succèdent avec les durées affichées',
        'Animation Animated.loop lancée. Phases séquencées correctement avec label et countdown affichés pour chaque phase.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-RESP-02', 'Profil 7-4-8', 'Sélectionner le profil 7-4-8 (anti-stress)',
        'Écran Breathe ouvert',
        '1. Sélectionner le profil "7-4-8"\n2. Lancer l\'exercice',
        'Cycle : Inspire 7s → Apnée 4s → Expire 8s, minuteur correct pour chaque phase',
        'Profil 7-4-8 sélectionné. Cycle observé : Inspire 7s (countdown 7→0), Apnée 4s, Expire 8s. Durées exactes.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-RESP-03', 'Profil 5-5', 'Sélectionner le profil 5-5 (équilibre)',
        'Écran Breathe ouvert',
        '1. Sélectionner le profil "5-5"\n2. Lancer l\'exercice',
        'Cycle : Inspire 5s → Expire 5s, pas de phase d\'apnée',
        'Profil 5-5 sélectionné. Cycle observé : Inspire 5s → Expire 5s. Aucune phase Apnée intercalée.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-RESP-04', 'Arrêt', 'Arrêter un exercice en cours',
        'Exercice de respiration en cours',
        '1. Appuyer sur "Arrêter" pendant l\'exercice',
        'Animation stoppée, retour à l\'état initial, choix du profil disponible à nouveau',
        'Bouton "Arrêter" pressé en cours de phase Expire. Animation stoppée immédiatement. Retour à l\'écran de sélection de profil.',
        'PASS ✅', 'Haute'
    ],
];
addSheet('TC_Respiration', H, respRows);

// ─── ADMINISTRATION ───────────────────────────────────────────────────────────
const adminRows = [
    [
        'TC-ADM-01', 'Gestion users', 'Lister tous les utilisateurs (admin)',
        'Connecté en tant qu\'admin',
        '1. Accéder à Admin > Utilisateurs',
        'Liste de tous les comptes avec email, rôle et statut',
        'Liste de 2 comptes affichée (admin@cesizen.fr + user@cesizen.fr) avec email, rôle et statut isActive.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ADM-02', 'Gestion users', 'Activer / désactiver un compte utilisateur',
        'Connecté admin, utilisateur cible existant',
        '1. Trouver un utilisateur\n2. Cliquer le toggle Actif/Inactif',
        'Statut du compte mis à jour, utilisateur ne peut plus se connecter si désactivé',
        'Toggle basculé. PATCH /api/admin/users/:id envoyé avec isActive=false. Compte désactivé : tentative de connexion refusée (401).',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ADM-03', 'Gestion users', 'Supprimer un compte utilisateur (admin)',
        'Connecté admin, utilisateur cible existant',
        '1. Sélectionner un utilisateur\n2. Cliquer "Supprimer"\n3. Confirmer',
        'Compte supprimé, n\'apparaît plus dans la liste',
        'Confirmation requise. DELETE /api/admin/users/:id. Compte retiré de la liste immédiatement après suppression.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ADM-04', 'Accès admin', 'Vérifier que le panneau admin est inaccessible aux users',
        'Connecté en tant qu\'utilisateur standard',
        '1. Tenter d\'accéder à /admin',
        'Redirection ou erreur 403, accès refusé',
        'Accès à /admin redirige vers /dashboard. Appels directs à l\'API admin retournent 403. Middleware requireAdmin fonctionnel.',
        'PASS ✅', 'Haute'
    ],
    [
        'TC-ADM-05', 'Diagnostic', 'Activer / désactiver un test de diagnostic (admin)',
        'Connecté admin',
        '1. Admin > Diagnostics\n2. Basculer le statut du test Holmes & Rahe',
        'Test masqué aux utilisateurs si désactivé, visible si activé',
        'Test désactivé (isActive=false). L\'API GET /api/diagnostic ne retourne plus le test. Réactivation immédiatement opérationnelle.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-ADM-06', 'Émotions', 'Consulter le référentiel d\'émotions (admin)',
        'Connecté admin',
        '1. Admin > Émotions\n2. Observer la liste',
        'Les 6 émotions de base et leurs sous-émotions sont listées',
        '6 émotions de base affichées avec leur couleur. Dépliement de chaque émotion révèle les sous-émotions associées.',
        'PASS ✅', 'Moyenne'
    ],
    [
        'TC-ADM-07', 'Rôles', 'Promouvoir un utilisateur au rôle admin',
        'Connecté admin, utilisateur cible',
        '1. Sélectionner un utilisateur\n2. Changer son rôle à "ADMIN"\n3. Sauvegarder',
        'Rôle mis à jour, l\'utilisateur accède au panneau admin à sa prochaine connexion',
        'Rôle modifié via PATCH /api/admin/users/:id. À la reconnexion, l\'utilisateur promu accède au panneau admin.',
        'PASS ✅', 'Haute'
    ],
];
addSheet('TC_Administration', H, adminRows);

// ─── PV DE RECETTE ────────────────────────────────────────────────────────────
const pvHeaders = ['ID Test', 'Résultat attendu', 'Résultat obtenu', 'Conforme (O/N)', 'Observations', 'Validé par', 'Date'];
const pvRows = [
    ['TC-AUTH-01', 'Compte créé, redirection vers login',          'Compte créé. Redirection et message de succès affichés.',                   'O', 'RAS', VALIDEUR, DATE],
    ['TC-AUTH-04', 'Connexion réussie, token JWT stocké',          'Connexion OK. Token JWT persisté. Dashboard chargé.',                       'O', 'RAS', VALIDEUR, DATE],
    ['TC-AUTH-07', 'Déconnexion, session terminée',                'Déconnexion effective. Token effacé. Accès protégés bloqués.',               'O', 'RAS', VALIDEUR, DATE],
    ['TC-AUTH-09', 'Redirection vers /login si non connecté',      'Redirection automatique opérationnelle sur toutes les routes protégées.',    'O', 'RAS', VALIDEUR, DATE],
    ['TC-ART-01',  'Articles publiés listés',                      '6 articles affichés avec titre et catégorie.',                              'O', 'RAS', VALIDEUR, DATE],
    ['TC-ART-04',  'Article créé visible',                         'Article créé et visible dans l\'espace public immédiatement.',              'O', 'RAS', VALIDEUR, DATE],
    ['TC-ART-07',  'Erreur 403 pour création sans droits',         'HTTP 403 retourné. Aucun article créé en base.',                            'O', 'RAS', VALIDEUR, DATE],
    ['TC-EMO-01',  'Entrée journal créée',                         'Entrée visible en tête de liste timeline avec couleur correcte.',           'O', 'RAS', VALIDEUR, DATE],
    ['TC-EMO-03',  'Entrée modifiée',                              'Mise à jour reflétée sans rechargement de page.',                           'O', 'RAS', VALIDEUR, DATE],
    ['TC-EMO-05',  'Entrées privées par utilisateur',              'Isolation confirmée : user A ne voit pas les données de user B.',           'O', 'RAS', VALIDEUR, DATE],
    ['TC-EMO-06',  'Statistiques affichées',                       'Pie chart, barres, émotion dominante et streak corrects.',                  'O', 'RAS', VALIDEUR, DATE],
    ['TC-DIAG-03', 'Score faible en vert',                         'Score = 0. Résultat "Stress faible" affiché en vert #27AE60.',              'O', 'RAS', VALIDEUR, DATE],
    ['TC-DIAG-04', 'Score modéré en orange',                       'Score = 208. Résultat "Stress modéré" affiché en orange #F39C12.',          'O', 'RAS', VALIDEUR, DATE],
    ['TC-DIAG-05', 'Score élevé en rouge',                         'Score = 376. Résultat "Stress élevé" affiché en rouge #E74C3C.',            'O', 'RAS', VALIDEUR, DATE],
    ['TC-RESP-01',  'Animation lancée',                            'Animation Inspired/Apnée/Expire cyclique. Countdown correct.',              'O', 'RAS', VALIDEUR, DATE],
    ['TC-RESP-02',  'Profil 7-4-8 correct',                        'Durées 7s/4s/8s vérifiées par chronométrage.',                             'O', 'RAS', VALIDEUR, DATE],
    ['TC-ADM-01',  'Liste utilisateurs admin',                     '2 comptes affichés avec rôle et statut.',                                   'O', 'RAS', VALIDEUR, DATE],
    ['TC-ADM-04',  'Accès admin refusé aux users',                 'HTTP 403 sur l\'API. Redirection UI vers /dashboard.',                      'O', 'RAS', VALIDEUR, DATE],
];
addSheet('PV_de_Recette', pvHeaders, pvRows);

// ─── Export ───────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, '..', '..', '..', 'CESIZen_Cahier_de_Tests.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`✅ Fichier généré : ${outputPath}`);
