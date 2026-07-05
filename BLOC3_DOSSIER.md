# Dossier Technique — Bloc 3
## Déployer et Sécuriser les Applications Informatiques
### Projet CESIZen — Enzo Agostinho

---

# PARTIE 1 — PLAN DE DÉPLOIEMENT

## 1.1 Architecture cible

L'application CESIZen est déployée sur Microsoft Azure, région **France Central**, garantissant la souveraineté des données au sein de l'Union Européenne (conformité RGPD art. 44).

```
┌──────────────────────────────────────────────────────────┐
│                     INTERNET / USERS                     │
└──────────────────┬───────────────────┬───────────────────┘
                   │                   │
        ┌──────────▼──────┐   ┌────────▼──────────┐
        │  Azure Static   │   │  CESIZen Mobile   │
        │   Web Apps      │   │  (React Native)   │
        │  (React/Vite)   │   │  App Store / APK  │
        │  HTTPS / CDN    │   └───────────────────┘
        └──────────┬──────┘            │
                   │ REST API          │ REST API
        ┌──────────▼──────────────────▼──────┐
        │       Azure App Service            │
        │     Node.js 20 / Express / TS      │
        │     Plan : B1 (Linux)              │
        │     HTTPS forcé, TLS 1.2 minimum   │
        └──────────┬─────────────────────────┘
                   │
        ┌──────────▼──────────┐   ┌─────────────────┐
        │   MongoDB Atlas     │   │  Azure Key Vault │
        │   M0 Free Tier      │   │  JWT_SECRET      │
        │   (cluster EU)      │   │  MONGO_URI       │
        └─────────────────────┘   └─────────────────┘
```

**Services Azure utilisés :**

| Service | Usage | SKU |
|---|---|---|
| Azure App Service | Backend Node.js | B1 Linux |
| Azure Static Web Apps | Frontend React | Free |
| MongoDB Atlas | Base de données | M0 (Free) |
| Azure Key Vault | Secrets applicatifs | Standard |
| GitHub Actions | CI/CD | Free (2000 min/mois) |

## 1.2 Environnements de déploiement

### Environnement de développement (LOCAL)
- **Objectif :** Développement et tests unitaires rapides
- **Backend :** `npm run dev` (tsx watch, hot reload)
- **Frontend :** `npm run dev` (Vite HMR)
- **Base de données :** MongoDB local ou MongoDB Atlas (cluster dev)
- **Configuration :** Fichier `.env` local (jamais commité)
- **Tests :** `npm run test:unit` en continu

### Environnement de test (CI — GitHub Actions)
- **Objectif :** Validation automatique de chaque commit
- **Déclencheur :** Push sur `feature/*`, `fix/*`, `develop`, `main`
- **Backend :** Runner Ubuntu 22.04, Node 20
- **Base de données :** `mongodb-memory-server` (in-memory, isolé)
- **Tests :** Unitaires + Intégration + TypeScript check
- **Validation :** La PR ne peut pas être mergée si les tests échouent

### Environnement de production (AZURE — déployé)
- **Objectif :** Application disponible pour les utilisateurs finaux
- **Déclencheur :** Push sur la branche `main` uniquement
- **Backend :** Azure App Service (B1, Linux, Node 20)
- **Frontend :** Azure Static Web Apps (CDN mondial, HTTPS automatique)
- **Base de données :** MongoDB Atlas M0 (Europe)
- **Secrets :** Variables d'environnement configurées dans Azure Key Vault
- **Monitoring :** Azure Application Insights

## 1.3 Plan de déploiement — étapes détaillées

### Phase 1 : Préparation (Développeur)
1. Créer une branche `feature/<nom>` depuis `develop`
2. Développer la fonctionnalité avec les tests associés
3. Vérifier localement : `npm run test:unit && npm run test:integration`
4. Ouvrir une Pull Request vers `develop`
5. Le pipeline CI s'exécute automatiquement (tests + TypeScript)
6. Code review par le responsable technique
7. Merge après approbation

### Phase 2 : Intégration (CI automatique sur develop)
1. GitHub Actions déclenche le job `ci.yml`
2. Installation des dépendances (`npm ci`)
3. Vérification TypeScript (`npx tsc --noEmit`)
4. Tests unitaires (`npm run test:unit`)
5. Tests d'intégration (`npm run test:integration`)
6. Rapport de couverture généré
7. ✅ Status check visible sur GitHub

### Phase 3 : Mise en production (CD automatique sur main)
1. PR de `develop` vers `main` validée et mergée
2. GitHub Actions déclenche `deploy.yml`
3. **Job test** : re-vérification complète (filet de sécurité)
4. **Job deploy-backend** :
   - `npm ci --omit=dev` (dépendances prod uniquement)
   - `npx tsc` (compilation TypeScript → JavaScript)
   - `azure/webapps-deploy@v3` → Azure App Service
5. **Job deploy-frontend** :
   - `npm run build` (Vite bundle optimisé)
   - `Azure/static-web-apps-deploy@v1` → Azure Static Web Apps
6. ✅ Application disponible sur `https://app.cesizen.fr`

## 1.4 Outil de versioning — GitFlow

**Stratégie de branches :**

```
main       → production (protégée, merge via PR uniquement)
develop    → intégration (protégée, merge via PR uniquement)
feature/*  → nouvelles fonctionnalités
fix/*      → corrections de bugs
hotfix/*   → correctifs urgents sur production
```

**Règles de protection (configurées sur GitHub) :**
- Branche `main` : 1 review requise + CI vert obligatoire avant merge
- Branche `develop` : CI vert obligatoire avant merge
- Commits signés requis sur `main`
- Pas de force-push sur `main` et `develop`

**Convention de commit (Conventional Commits) :**
```
feat: ajout du rapport d'émotions trimestriel
fix: correction du token JWT non révoqué à la déconnexion
security: ajout du rate limiter sur /api/auth
chore: mise à jour des dépendances de sécurité
```

---

# PARTIE 2 — PLAN DE MAINTENANCE

## 2.1 Outil de ticketing — GitHub Issues + GitHub Projects

**Configuration du tableau de bord (GitHub Projects) :**

| Colonne | Description |
|---|---|
| 📋 Backlog | Tickets recensés, non planifiés |
| 📌 To Do | Planifiés pour le sprint en cours |
| 🔄 In Progress | En cours de développement (1 ticket/dev max) |
| 👀 Code Review | PR ouverte, en attente de review |
| 🧪 QA / Testing | Déployé en staging, en attente de validation client |
| ✅ Done | Livré et validé |

**Labels GitHub configurés :**

| Label | Couleur | Usage |
|---|---|---|
| `bug` | Rouge | Dysfonctionnement |
| `enhancement` | Bleu | Évolution fonctionnelle |
| `security` | Violet | Vulnérabilité / patch sécurité |
| `rgpd` | Orange | Conformité données personnelles |
| `P0 - Bloquant` | Rouge foncé | Incident critique |
| `P1 - Majeur` | Orange foncé | Dégradation significative |
| `P2 - Mineur` | Jaune | Gêne légère |
| `triage` | Gris | À qualifier |

**Templates de tickets :** Bug Report et Feature Request configurés (voir `.github/ISSUE_TEMPLATE/`)

## 2.2 Méthodologie de gestion des incidents et évolutions

### Processus de traitement d'un bug

```
1. DÉTECTION
   └─ Utilisateur/monitoring crée un ticket GitHub Issue
   └─ Label "bug" + sévérité P0/P1/P2 attribués

2. QUALIFICATION (Responsable technique)
   └─ Vérification et priorisation
   └─ Assignment au développeur
   └─ Déplacement vers "To Do"

3. CORRECTION
   └─ Branche fix/<nom-du-bug> créée depuis develop
   └─ Développement + tests
   └─ PR ouverte → référence le ticket (#123)

4. VALIDATION
   └─ CI automatique (tests)
   └─ Code review
   └─ Tests de non-régression

5. LIVRAISON
   └─ Merge sur develop → staging
   └─ Validation client
   └─ Merge sur main → production
   └─ Ticket fermé
```

### Engagements de niveau de service (SLA)

| Sévérité | Exemple | Prise en charge | Correction |
|---|---|---|---|
| 🔴 P0 — Bloquant | API inaccessible, perte de données | ≤ 2h ouvrées | ≤ 6h ouvrées |
| 🟠 P1 — Majeur | Connexion impossible pour tous | ≤ 7h ouvrées | ≤ 16h ouvrées |
| 🟡 P2 — Mineur | Affichage cosmétique erroné | ≤ 1 jour ouvré | ≤ 40h ouvrées |

**Hotfix en production (P0 uniquement) :**
```
main → hotfix/<nom> → correction → PR directe sur main → tag de version → cherry-pick sur develop
```

## 2.3 Veille technologique

### Objectif
Garantir la pérennité de CESIZen face aux évolutions de l'écosystème Node.js/React/Azure et aux nouvelles vulnérabilités.

### Sources de veille configurées

| Source | Fréquence | Outil |
|---|---|---|
| CVE NIST (vulnérabilités) | Hebdomadaire | flux RSS → Feedly |
| Node.js Security Releases | À chaque release | GitHub Watch |
| npm Security Advisories | Hebdomadaire | `npm audit` en CI |
| OWASP Top 10 | Annuelle | Newsletter OWASP |
| Azure Security Center | Mensuelle | Azure Portal alerts |
| React / Expo Changelog | À chaque release | GitHub Watch |
| ANSSI bulletins | Mensuelle | ANSSI RSS |

### Processus de mise à jour
1. Chaque semaine : `npm audit` sur backend et frontend
2. Mise à jour des dépendances mineures dans un ticket `chore`
3. Mise à jour majeure : branche dédiée + tests de régression complets
4. Mises à jour de sécurité critiques : traitement immédiat (hotfix si en production)

---

# PARTIE 3 — PLAN DE SÉCURISATION

## 3.1 Matrice des risques et vulnérabilités

Pour chaque risque : **Criticité = Probabilité (1-5) × Impact (1-5)**

| # | Vulnérabilité | Catégorie OWASP | Prob. | Impact | Criticité | Statut |
|---|---|---|---|---|---|---|
| R1 | Injection NoSQL via les paramètres de requête | A03 - Injection | 4 | 5 | **20** | ✅ Corrigé |
| R2 | Attaque par force brute sur /api/auth | A04 - Insecure Design | 5 | 4 | **20** | ✅ Corrigé |
| R3 | En-têtes HTTP non sécurisés (XSS, Clickjacking) | A05 - Misconfiguration | 4 | 4 | **16** | ✅ Corrigé |
| R4 | JWT_SECRET faible ou exposé | A02 - Cryptographic Failures | 3 | 5 | **15** | ✅ Corrigé |
| R5 | CORS trop permissif (toutes origines autorisées) | A05 - Misconfiguration | 3 | 4 | **12** | ✅ Corrigé |
| R6 | Dépendances npm vulnérables | A06 - Vulnerable Components | 4 | 3 | **12** | ✅ Surveillé |
| R7 | Exposition d'informations sensibles dans les logs | A09 - Logging Failures | 3 | 3 | **9** | 🔄 En cours |
| R8 | Absence de validation des entrées côté serveur | A03 - Injection | 3 | 3 | **9** | 🔄 En cours |
| R9 | Attaque DDoS volumétrique | Hors OWASP | 2 | 5 | **10** | ✅ Mitigé (Azure) |
| R10 | Accès non autorisé aux routes admin | A01 - Broken Access Control | 2 | 5 | **10** | ✅ Corrigé |

**Seuils de criticité :**
- 🔴 ≥ 15 : Critique — action immédiate
- 🟠 10-14 : Majeur — à traiter dans le sprint
- 🟡 5-9 : Modéré — à planifier
- 🟢 < 5 : Faible — surveillance

## 3.2 Actions correctives et préventives implémentées

### R1 — Injection NoSQL (Criticité 20 — Critique)
**Risque :** Un attaquant envoie `{ "$gt": "" }` dans le champ email pour contourner l'authentification.

**Correction implémentée** ([backend/src/index.ts](backend/src/index.ts)) :
```typescript
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize()); // Supprime les opérateurs $ et . de toutes les requêtes
```
**Prévention :** Utilisation de Mongoose avec des schémas typés (pas de requêtes raw).

---

### R2 — Force brute sur l'authentification (Criticité 20 — Critique)
**Risque :** Un attaquant peut tenter des milliers de combinaisons email/mot de passe.

**Correction implémentée** ([backend/src/index.ts](backend/src/index.ts)) :
```typescript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 tentatives maximum
    message: { message: 'Trop de tentatives, réessayez dans 15 minutes.' }
});
app.use('/api/auth', authLimiter, authRoutes);
```
**Prévention :** Mots de passe hachés avec bcrypt (salt=10), délai constant de comparaison.

---

### R3 — En-têtes HTTP non sécurisés (Criticité 16 — Critique)
**Risque :** Absence de Content-Security-Policy → XSS. Absence de X-Frame-Options → Clickjacking.

**Correction implémentée** ([backend/src/index.ts](backend/src/index.ts)) :
```typescript
import helmet from 'helmet';
app.use(helmet()); // Ajoute automatiquement 11 en-têtes de sécurité
```
**En-têtes ajoutés :** `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS), `Referrer-Policy`, etc.

---

### R4 — JWT_SECRET faible ou exposé (Criticité 15 — Critique)
**Mesures :**
- Secret stocké dans **Azure Key Vault**, jamais dans le code
- Variables d'environnement injectées au runtime par Azure App Service
- `.env` listé dans `.gitignore`
- GitHub Secrets pour le CI/CD
- Rotation du secret planifiée tous les 6 mois

---

### R5 — CORS trop permissif (Criticité 12 — Majeur)
**Correction implémentée** ([backend/src/index.ts](backend/src/index.ts)) :
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS non autorisé pour cette origine'));
        }
    },
    credentials: true,
}));
```

---

### R9 — Attaque DDoS (Criticité 10 — Majeur)
**Mesures complémentaires Azure :**
- Rate limiter global : 200 requêtes / 15 minutes / IP ([backend/src/index.ts](backend/src/index.ts))
- Limite de taille du body : `express.json({ limit: '10kb' })`
- Azure App Service intègre une protection DDoS de base

---

### R10 — Contrôle d'accès (Criticité 10 — Majeur)
**Correction implémentée** ([backend/src/middleware/authMiddleware.ts](backend/src/middleware/authMiddleware.ts)) :
- Middleware `protect` : vérifie le JWT sur toutes les routes authentifiées
- Middleware `checkRole` : vérifie le rôle ADMIN sur les routes d'administration
- Vérification du `systemStatus` : les comptes désactivés sont rejetés (403)

---

### R6 — Dépendances vulnérables (Criticité 12 — Majeur)
**Processus :**
- `npm audit` exécuté automatiquement dans le pipeline CI
- Si des vulnérabilités HIGH ou CRITICAL sont détectées → le pipeline bloque
- Revue hebdomadaire manuelle des advisories npm

## 3.3 Bonnes pratiques de développement

| Pratique | Implémentation |
|---|---|
| Typage strict TypeScript | `"strict": true` dans `tsconfig.json` |
| Hachage des mots de passe | bcryptjs avec salt factor 10 |
| Exclusion du mot de passe des requêtes | `select: false` sur le champ `password` |
| Journalisation des actions sensibles | Module `logger.ts` avec horodatage |
| Tests automatisés | Jest + Supertest, couverture > 80% |
| Variables sensibles externalisées | `.env` + Azure Key Vault |
| Vérification TypeScript en CI | `npx tsc --noEmit` bloquant |
| Pas de données sensibles dans les logs | Vérification manuelle en review |
| Principe du moindre privilège | 3 rôles : GUEST, USER, ADMIN |
| Compte fantôme RGPD | Anonymisation des auteurs supprimés |

## 3.4 Gestion des crises — Protocole d'incident de sécurité

### Détection et classification

| Signal | Niveau | Action immédiate |
|---|---|---|
| Alerte Azure Security Center | Critique | Escalade immédiate |
| Pic de requêtes anormal | Majeur | Vérification logs |
| Erreur 500 en masse | Majeur | Rollback possible |
| Rapport utilisateur | Variable | Investigation |

### Procédure pas-à-pas

```
T+0   DÉTECTION
      └─ Alerte monitoring / signalement utilisateur
      └─ Le responsable technique est notifié (Slack + email)

T+1h  ISOLATION
      └─ Si compromission avérée : mise en maintenance du service
      └─ Isolation de la ressource Azure compromise
      └─ Révocation des tokens JWT actifs (changement JWT_SECRET)
      └─ Snapshot de la base de données pour investigation

T+2h  INVESTIGATION
      └─ Analyse des logs Azure Application Insights
      └─ Identification du vecteur d'attaque
      └─ Évaluation des données impactées (types, volume, utilisateurs)

T+4h  NOTIFICATION INTERNE
      └─ Rapport d'incident au Délégué à la Protection des Données (DPO)
      └─ Notification au Ministère (client / Maître d'ouvrage)
      └─ Décision : notifier la CNIL ?

T+72h NOTIFICATION CNIL (si données personnelles concernées)
      └─ Obligation légale (art. 33 RGPD) si risque pour les droits des personnes
      └─ Formulaire de notification CNIL : notifications.cnil.fr
      └─ Contenu : nature de la violation, catégories de données, mesures prises

T+7j  CORRECTION ET RETOUR D'EXPÉRIENCE
      └─ Correctif déployé et validé
      └─ Rapport post-mortem documenté
      └─ Mise à jour du plan de sécurisation
      └─ Communication aux utilisateurs si nécessaire
```

### Contacts d'escalade

| Rôle | Responsabilité |
|---|---|
| Développeur (Enzo Agostinho) | Détection, isolation technique, correction |
| DPO (Ministère) | Notification CNIL, communication utilisateurs |
| Azure Support | Incidents infrastructure cloud |

---

# PARTIE 4 — RGPD ET DONNÉES PERSONNELLES

## 4.1 Données collectées et base légale

| Donnée | Finalité | Base légale (RGPD) | Durée de conservation |
|---|---|---|---|
| Email, nom, prénom | Authentification | Contrat (art. 6.1.b) | Durée du compte |
| Date de naissance | Personnalisation | Consentement (art. 6.1.a) | Durée du compte |
| Journal d'émotions | Tracker personnel | Consentement (art. 6.1.a) | Durée du compte |
| Logs d'activité | Sécurité / audit | Intérêt légitime (art. 6.1.f) | 12 mois |
| Photo de profil | Personnalisation | Consentement (art. 6.1.a) | Durée du compte |

## 4.2 Droits des utilisateurs implémentés

| Droit RGPD | Article | Implémentation |
|---|---|---|
| Droit d'accès | Art. 15 | `GET /api/users/me` |
| Droit de rectification | Art. 16 | `PATCH /api/users/updateMe` |
| Droit à l'effacement (oubli) | Art. 17 | `DELETE /api/users/me/data` ← **Nouveau** |
| Droit à la portabilité | Art. 20 | À implémenter (export JSON) |
| Droit de suppression du compte | Art. 17 | `DELETE /api/users/deleteMe` |

## 4.3 Route RGPD — Droit à l'oubli

La route `DELETE /api/users/me/data` (art. 17 RGPD) permet à un utilisateur de supprimer toutes ses données personnelles sans supprimer son compte :

- Suppression de toutes les entrées du journal d'émotions (Diary)
- Suppression de la photo de profil et date de naissance
- Conservation du compte (email) pour la traçabilité de sécurité
- Action journalisée avec horodatage

## 4.4 Mesures techniques de protection des données

| Mesure | Détail |
|---|---|
| Hachage des mots de passe | bcryptjs, salt factor 10, irréversible |
| HTTPS obligatoire | TLS 1.2 minimum, HSTS via Helmet |
| Chiffrement au repos | MongoDB Atlas chiffre les données (AES-256) |
| Stockage EU | MongoDB Atlas cluster Europe, Azure France Central |
| Principe de minimisation | Seuls les champs nécessaires sont collectés |
| Accès limité | Les admins ne voient jamais les mots de passe (`select: false`) |
| Anonymisation à la suppression | Compte fantôme pour les articles d'auteurs supprimés |

---

# ANNEXES

## A — Secrets GitHub à configurer

Avant le premier déploiement, configurer dans GitHub → Settings → Secrets :

| Secret | Description |
|---|---|
| `AZURE_WEBAPP_NAME` | Nom de l'App Service Azure |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Profil de publication Azure (XML) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token Azure Static Web Apps |
| `VITE_API_URL` | URL de l'API en production |
| `JWT_SECRET_TEST` | Secret JWT pour les tests CI |

## B — Checklist de déploiement initial

- [ ] Créer un compte MongoDB Atlas, configurer le cluster M0 (Europe)
- [ ] Créer les ressources Azure : App Service (B1 Linux) + Static Web Apps
- [ ] Configurer Azure Key Vault avec MONGO_URI et JWT_SECRET
- [ ] Configurer les variables d'environnement dans Azure App Service
- [ ] Ajouter les GitHub Secrets listés ci-dessus
- [ ] Configurer les branch protection rules sur `main` et `develop`
- [ ] Premier déploiement manuel pour vérification
- [ ] Vérifier le pipeline CI/CD sur un commit test

## C — URLs de production (à compléter)

- Frontend : https://app.cesizen.fr (Azure Static Web Apps)
- API Backend : https://api.cesizen.fr (Azure App Service)
- GitHub Repository : https://github.com/<username>/CESIZen
- GitHub Projects (ticketing) : https://github.com/<username>/CESIZen/projects
