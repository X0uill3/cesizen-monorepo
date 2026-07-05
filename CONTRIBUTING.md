# Guide de contribution — CESIZen

## Stratégie de branches (GitFlow)

```
main          ← production uniquement, protégée
develop       ← intégration continue, base de toutes les features
feature/*     ← nouvelles fonctionnalités (ex: feature/tracker-rapport)
fix/*         ← corrections de bugs (ex: fix/login-token-expire)
hotfix/*      ← correctifs urgents en production
```

### Cycle de vie d'un ticket

```
Backlog → To Do → In Progress → Code Review → QA/Testing → Done
```

## Règles de commit (Conventional Commits)

```
feat: ajout du rapport d'émotions hebdomadaire
fix: correction du token JWT expiré non détecté
chore: mise à jour des dépendances npm
docs: mise à jour du guide de déploiement
security: ajout du rate limiter sur les routes auth
```

## Créer une Pull Request

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-feature develop`
2. Développer et commiter avec le format Conventional Commits
3. Pousser la branche et ouvrir une PR vers `develop`
4. Remplir le template de PR
5. Le CI doit passer (tests + TypeScript) avant le merge
6. Un reviewer doit approuver la PR

## Environnements

| Branche  | Environnement | URL                          |
|----------|---------------|------------------------------|
| `main`   | Production    | https://app.cesizen.fr       |
| `develop`| Staging       | https://staging.cesizen.fr   |
| `feature/*` | Local      | http://localhost:5173        |

## Variables d'environnement requises

Créer un fichier `.env` dans `/backend` (jamais commité) :

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cesizen
JWT_SECRET=<minimum_32_caracteres>
ALLOWED_ORIGINS=http://localhost:5173
```
