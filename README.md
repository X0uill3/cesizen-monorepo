# CESIZen — Application de santé mentale

Plateforme grand public pour accompagner la gestion du stress et la santé mentale.

## Structure du monorepo

```
CESIZen/
├── backend/          # API Node.js / Express / TypeScript
├── frontend/         # Interface admin React / Vite / Tailwind
├── CESIZen-Mobile/   # Application mobile React Native (Expo)
└── .github/
    ├── workflows/    # Pipelines CI/CD GitHub Actions
    └── ISSUE_TEMPLATE/
```

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js 22, Express 5, TypeScript, Mongoose |
| Frontend | React 18, Vite, Tailwind CSS |
| Mobile | React Native, Expo |
| Base de données | MongoDB Atlas |
| Hébergement | Azure App Service (backend) + Vercel (frontend) |
| CI/CD | GitHub Actions (tests, audit, CodeQL, Snyk, Trivy, ZAP) |

## Lancer le projet en local

### Backend
```bash
cd backend
cp .env.example .env   # Renseigner MONGO_URI et JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd CESIZen-Mobile
npm install
npx expo start
```

## Tests

```bash
cd backend
npm run test:unit          # Tests unitaires uniquement
npm run test:integration   # Tests d'intégration
npm run test:coverage      # Rapport de couverture complet
```

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour la stratégie de branches (GitFlow) et les conventions de commit.
