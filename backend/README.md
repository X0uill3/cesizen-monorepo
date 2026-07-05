# 📚 Documentation API CESIZen

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration et démarrage](#configuration-et-démarrage)
3. [Architecture](#architecture)
4. [Authentification](#authentification)
5. [Endpoints API](#endpoints-api)
6. [Modèles de données](#modèles-de-données)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Sécurité](#sécurité)

---

## 🌟 Vue d'ensemble

**CESIZen** est une API REST complète pour une plateforme de bien-être et de gestion émotionnelle développée avec :
- **Framework** : Express.js
- **Type** : Node.js avec TypeScript
- **Base de données** : MongoDB
- **Authentification** : JWT (JSON Web Tokens)
- **Port** : 5000 (par défaut, configurable via `PORT`)

### Fonctionnalités principales
- ✅ Authentification et gestion des utilisateurs
- ✅ Gestion des articles de bien-être
- ✅ Journal intime avec suivi des émotions
- ✅ Classification hiérarchique des émotions (base + détails)
- ✅ Rapports d'émotions
- ✅ Système de rôles et permissions
- ✅ Audit et logging des actions administrateur

---

## 🚀 Configuration et démarrage

### Installation
```bash
npm install
```

### Variables d'environnement (.env)
```env
# Base de données
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cesizen

# JWT
JWT_SECRET=votre_secret_jwt_tres_secure
JWT_EXPIRES_IN=90d

# Serveur
PORT=5000
NODE_ENV=development
```

### Démarrage
```bash
# Mode développement (avec watch)
npm run dev

# Mode production
npm start
```

---

## 🏗️ Architecture

### Hiérarchie des fichiers
```
src/
├── index.ts                 # Point d'entrée du serveur
├── config/
│   └── db.ts               # Configuration MongoDB
├── constants/
│   ├── categories.ts       # Catégories d'articles
│   └── roles.ts            # Rôles d'utilisateurs
├── controllers/            # Logique métier
├── middleware/             # Middlewares (auth, rôles)
├── models/                 # Schémas MongoDB
├── routes/                 # Définition des endpoints
└── utils/
    ├── logger.ts           # Logging des actions
    └── seeder.ts           # Données d'initialisation
```

### Architecture en couches
```
Route (HTTP)
    ↓
Middleware (Authentification & Rôles)
    ↓
Controller (Logique métier)
    ↓
Model (Accès base de données)
    ↓
Response (JSON)
```

---

## 🔐 Authentification

### Stratégie d'authentification

L'API utilise **JWT (JSON Web Tokens)** pour l'authentification :

1. L'utilisateur se connecte ou s'inscrit
2. Un token JWT est généré et retourné
3. Le token est envoyé en header `Authorization: Bearer <token>`
4. Le serveur vérifie le token avant chaque action sécurisée

### Headers requis
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Rôles utilisateur
```
┌─────────────────────────────────────────┐
│           RÔLES DISPONIBLES             │
├─────────────────────────────────────────┤
│ 1. ADMIN  - Accès complet, gestion      │
│ 2. USER   - Accès utilisateur standard  │
│ 3. GUEST  - Accès lecture seule         │
└─────────────────────────────────────────┘
```

---

## 📡 Endpoints API

### 1. Authentification `/api/auth`

#### POST `/api/auth/signup`
**Créer un nouveau compte utilisateur**

```http
POST /api/auth/signup HTTP/1.1
Content-Type: application/json

{
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "SecurePassword123!",
  "birthdate": "1990-05-15"
}
```

**Réponse (201 Created)**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "USER",
      "systemStatus": "Enabled",
      "createdAt": "2024-03-30T10:00:00Z"
    }
  }
}
```

---

#### POST `/api/auth/login`
**Connexion utilisateur**

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "USER",
      "birthdate": "1990-05-15",
      "systemStatus": "Enabled",
      "createdAt": "2024-03-30T10:00:00Z"
    }
  }
}
```

**Erreurs possibles**
- `400` : Email ou mot de passe manquant
- `401` : Email ou mot de passe incorrect
- `403` : Compte désactivé par un administrateur

---

### 2. Utilisateurs `/api/users`

#### GET `/api/users/me`
**Récupérer mon profil (Authentification requise)**

```http
GET /api/users/me HTTP/1.1
Authorization: Bearer <token>
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "USER",
      "picture": "https://example.com/img.jpg",
      "birthdate": "1990-05-15",
      "systemStatus": "Enabled",
      "createdAt": "2024-03-30T10:00:00Z"
    }
  }
}
```

---

#### PATCH `/api/users/updateMe`
**Modifier mon profil (Authentification requise)**

```http
PATCH /api/users/updateMe HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstname": "Jean-Pierre",
  "lastname": "Dupont",
  "email": "jean.dupont@example.com",
  "birthdate": "1990-05-15"
}
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "Jean-Pierre",
      "lastname": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "USER",
      "systemStatus": "Enabled"
    }
  }
}
```

**Notes**
- ⚠️ Impossible de modifier le rôle (protection contre l'auto-promotion)
- ⚠️ Le mot de passe ne peut être changé via cet endpoint

---

#### PATCH `/api/users/updateMyPassword`
**Changer mon mot de passe (Authentification requise)**

```http
PATCH /api/users/updateMyPassword HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "passwordCurrent": "SecurePassword123!",
  "password": "NewSecurePassword456!",
  "passwordConfirm": "NewSecurePassword456!"
}
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "message": "Mot de passe mis à jour avec succès."
}
```

---

#### DELETE `/api/users/deleteMe`
**Supprimer mon compte (Authentification requise)**

```http
DELETE /api/users/deleteMe HTTP/1.1
Authorization: Bearer <token>
```

**Réponse (204 No Content) / (200 OK)**

---

#### GET `/api/users` 
**Récupérer tous les utilisateurs (Admin uniquement)**

```http
GET /api/users HTTP/1.1
Authorization: Bearer <admin_token>
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 42,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "firstname": "Jean",
        "lastname": "Dupont",
        "email": "jean.dupont@example.com",
        "role": "USER",
        "systemStatus": "Enabled",
        "createdAt": "2024-03-30T10:00:00Z"
      }
    ]
  }
}
```

---

#### PATCH `/api/users/:id`
**Mettre à jour un utilisateur (Admin uniquement)**

```http
PATCH /api/users/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstname": "Jean-Pierre",
  "lastname": "Dupont",
  "email": "jean.dupont@example.com",
  "birthdate": "1990-05-15"
}
```

---

#### DELETE `/api/users/:id`
**Supprimer un utilisateur (Admin uniquement)**

```http
DELETE /api/users/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <admin_token>
```

---

#### PATCH `/api/users/:id/reactivate`
**Réactiver un compte utilisateur (Admin uniquement)**

```http
PATCH /api/users/507f1f77bcf86cd799439011/reactivate HTTP/1.1
Authorization: Bearer <admin_token>
```

---

### 3. Articles `/api/articles`

#### GET `/api/articles`
**Récupérer tous les articles publics**

```http
GET /api/articles HTTP/1.1
Authorization: Bearer <token> (optionnel)
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 15,
  "data": {
    "articles": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Guide de la méditation",
        "content": "La méditation est une pratique...",
        "category": "EXERCICES",
        "imageUrl": "https://example.com/image.jpg",
        "author": {
          "_id": "507f1f77bcf86cd799439001",
          "firstname": "Admin",
          "lastname": "System"
        },
        "publishedAt": "2024-03-30T10:00:00Z",
        "isActive": true,
        "createdAt": "2024-03-30T10:00:00Z"
      }
    ]
  }
}
```

**Catégories disponibles**
- `PRÉVENTION` - Articles de prévention
- `CONSEILS` - Conseils pratiques
- `EXERCICES` - Exercices et pratiques
- `GÉNÉRAL` - Articles généraux

---

#### GET `/api/articles/:id`
**Récupérer un article spécifique**

```http
GET /api/articles/507f1f77bcf86cd799439012 HTTP/1.1
Authorization: Bearer <token> (optionnel)
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "data": {
    "article": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Guide de la méditation",
      "content": "La méditation est une pratique...",
      "category": "EXERCICES",
      "imageUrl": "https://example.com/image.jpg",
      "author": {
        "_id": "507f1f77bcf86cd799439001",
        "firstname": "Admin",
        "lastname": "System"
      },
      "publishedAt": "2024-03-30T10:00:00Z",
      "isActive": true,
      "createdAt": "2024-03-30T10:00:00Z"
    }
  }
}
```

---

#### POST `/api/articles/admin`
**Créer un nouvel article (Admin uniquement)**

```http
POST /api/articles/admin HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "10 techniques de relaxation",
  "content": "Voici 10 techniques efficaces pour se relaxer...",
  "category": "CONSEILS",
  "imageUrl": "https://example.com/relaxation.jpg"
}
```

**Réponse (201 Created)**
```json
{
  "status": "success",
  "data": {
    "article": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "10 techniques de relaxation",
      "content": "Voici 10 techniques efficaces...",
      "category": "CONSEILS",
      "imageUrl": "https://example.com/relaxation.jpg",
      "author": "507f1f77bcf86cd799439001",
      "publishedAt": "2024-03-30T10:00:00Z",
      "isActive": false,
      "createdAt": "2024-03-30T10:00:00Z"
    }
  }
}
```

**Notes**
- Les articles sont créés avec `isActive: false` par défaut
- Ils doivent être activés via l'endpoint d'activation

---

#### GET `/api/articles/admin`
**Récupérer tous les articles (Admin uniquement)**

```http
GET /api/articles/admin HTTP/1.1
Authorization: Bearer <admin_token>
```

---

#### PATCH `/api/articles/:id`
**Modifier un article (Admin uniquement)**

```http
PATCH /api/articles/507f1f77bcf86cd799439012 HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Guide avancé de la méditation",
  "content": "Contenu mis à jour...",
  "category": "EXERCICES",
  "imageUrl": "https://example.com/meditation-new.jpg"
}
```

---

#### DELETE `/api/articles/:id`
**Supprimer un article (Admin uniquement)**

```http
DELETE /api/articles/507f1f77bcf86cd799439012 HTTP/1.1
Authorization: Bearer <admin_token>
```

---

#### PATCH `/api/articles/:id/activate`
**Activer/Désactiver un article (Admin uniquement)**

```http
PATCH /api/articles/507f1f77bcf86cd799439012/activate HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": true
}
```

---

### 4. Journal Intime (Diary) `/api/diary`

#### POST `/api/diary`
**Créer une nouvelle entrée de journal (Authentification requise)**

```http
POST /api/diary HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "baseEmotion": "507f1f77bcf86cd799439020",
  "emotionDetail": "507f1f77bcf86cd799439021",
  "comment": "Aujourd'hui, je me sens joyeux grâce au beau temps et à mes accomplissements.",
  "date": "2024-03-30T14:30:00Z"
}
```

**Réponse (201 Created)**
```json
{
  "status": "success",
  "data": {
    "entry": {
      "_id": "507f1f77bcf86cd799439030",
      "user": "507f1f77bcf86cd799439011",
      "baseEmotion": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Joie",
        "color": "#FFD700",
        "iconUrl": "https://example.com/joy.svg"
      },
      "emotionDetail": {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Contentement",
        "color": "#FFC700"
      },
      "comment": "Aujourd'hui, je me sens joyeux grâce au beau temps...",
      "date": "2024-03-30T14:30:00Z",
      "createdAt": "2024-03-30T14:30:00Z"
    }
  }
}
```

---

#### GET `/api/diary`
**Récupérer mes entrées de journal (Authentification requise)**

```http
GET /api/diary HTTP/1.1
Authorization: Bearer <token>
```

**Paramètres de requête (optionnels)**
- `startDate` : Date de début (ISO 8601)
- `endDate` : Date de fin (ISO 8601)
- `emotion` : Filtrer par ID d'émotion

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "entries": [
      {
        "_id": "507f1f77bcf86cd799439030",
        "user": "507f1f77bcf86cd799439011",
        "baseEmotion": { /* ... */ },
        "emotionDetail": { /* ... */ },
        "comment": "Aujourd'hui, je me sens joyeux...",
        "date": "2024-03-30T14:30:00Z",
        "createdAt": "2024-03-30T14:30:00Z"
      }
    ]
  }
}
```

---

#### GET `/api/diary/report`
**Récupérer un rapport d'émotions (Authentification requise)**

```http
GET /api/diary/report HTTP/1.1
Authorization: Bearer <token>
```

**Paramètres de requête (optionnels)**
- `period` : `week`, `month`, `all` (défaut: `week`)

**Réponse (200 OK)**
```json
{
  "status": "success",
  "period": "week",
  "data": {
    "report": {
      "Joy": 15,
      "Sadness": 5,
      "Anger": 2,
      "Fear": 3,
      "Surprise": 8
    },
    "summary": {
      "totalEntries": 33,
      "mostFrequent": "Joy",
      "startDate": "2024-03-24",
      "endDate": "2024-03-30"
    }
  }
}
```

---

#### DELETE `/api/diary/:id`
**Supprimer une entrée de journal (Authentification requise)**

```http
DELETE /api/diary/507f1f77bcf86cd799439030 HTTP/1.1
Authorization: Bearer <token>
```

**Réponse (204 No Content) / (200 OK)**

---

### 5. Émotions `/api/emotions`

#### GET `/api/emotions`
**Récupérer toutes les émotions de base (Authentification requise)**

```http
GET /api/emotions HTTP/1.1
Authorization: Bearer <token>
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "emotions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Joie",
        "color": "#FFD700",
        "iconUrl": "https://example.com/joy.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Tristesse",
        "color": "#4169E1",
        "iconUrl": "https://example.com/sadness.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Colère",
        "color": "#DC143C",
        "iconUrl": "https://example.com/anger.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439023",
        "name": "Peur",
        "color": "#8B008B",
        "iconUrl": "https://example.com/fear.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439024",
        "name": "Surprise",
        "color": "#FF6347",
        "iconUrl": "https://example.com/surprise.svg",
        "isActive": true
      }
    ]
  }
}
```

---

#### GET `/api/emotions/:baseId/details`
**Récupérer les détails d'une émotion de base (Authentification requise)**

```http
GET /api/emotions/507f1f77bcf86cd799439020/details HTTP/1.1
Authorization: Bearer <token>
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "details": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "name": "Contentement",
        "color": "#FFC700",
        "iconUrl": "https://example.com/contentment.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Exaltation",
        "color": "#FFD700",
        "iconUrl": "https://example.com/exaltation.svg",
        "isActive": true
      },
      {
        "_id": "507f1f77bcf86cd799439023",
        "name": "Plaisir",
        "color": "#FFED4E",
        "iconUrl": "https://example.com/pleasure.svg",
        "isActive": true
      }
    ]
  }
}
```

---

#### GET `/api/emotions/admin`
**Récupérer toutes les émotions avec détails (Admin uniquement)**

```http
GET /api/emotions/admin HTTP/1.1
Authorization: Bearer <admin_token>
```

**Réponse (200 OK)**
```json
{
  "status": "success",
  "data": {
    "emotions": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Joie",
        "color": "#FFD700",
        "iconUrl": "https://example.com/joy.svg",
        "isActive": true,
        "details": [
          {
            "_id": "507f1f77bcf86cd799439021",
            "name": "Contentement",
            "color": "#FFC700",
            "iconUrl": "https://example.com/contentment.svg",
            "isActive": true
          }
        ]
      }
    ]
  }
}
```

---

#### POST `/api/emotions`
**Créer une nouvelle émotion de base (Admin uniquement)**

```http
POST /api/emotions HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Sérénité",
  "color": "#87CEEB",
  "iconUrl": "https://example.com/serenity.svg"
}
```

**Réponse (201 Created)**
```json
{
  "status": "success",
  "data": {
    "emotion": {
      "_id": "507f1f77bcf86cd799439025",
      "name": "Sérénité",
      "color": "#87CEEB",
      "iconUrl": "https://example.com/serenity.svg",
      "isActive": true
    }
  }
}
```

---

#### POST `/api/emotions/details`
**Créer un détail d'émotion (Admin uniquement)**

```http
POST /api/emotions/details HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Apaisement",
  "baseEmotion": "507f1f77bcf86cd799439025",
  "color": "#B0E0E6",
  "iconUrl": "https://example.com/calmness.svg"
}
```

**Réponse (201 Created)**
```json
{
  "status": "success",
  "data": {
    "detail": {
      "_id": "507f1f77bcf86cd799439026",
      "name": "Apaisement",
      "baseEmotion": "507f1f77bcf86cd799439025",
      "color": "#B0E0E6",
      "iconUrl": "https://example.com/calmness.svg",
      "isActive": true
    }
  }
}
```

---

#### PATCH `/api/emotions/:id`
**Mettre à jour une émotion de base (Admin uniquement)**

```http
PATCH /api/emotions/507f1f77bcf86cd799439025 HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Sérénité Profonde",
  "color": "#6DB3DE",
  "iconUrl": "https://example.com/deep-serenity.svg"
}
```

---

#### PATCH `/api/emotions/details/:id`
**Mettre à jour un détail d'émotion (Admin uniquement)**

```http
PATCH /api/emotions/details/507f1f77bcf86cd799439026 HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Apaisement Profond",
  "color": "#9DD9EB",
  "iconUrl": "https://example.com/deep-calmness.svg"
}
```

---

#### DELETE `/api/emotions/:id`
**Désactiver une émotion de base (Admin uniquement)**

```http
DELETE /api/emotions/507f1f77bcf86cd799439025 HTTP/1.1
Authorization: Bearer <admin_token>
```

---

#### DELETE `/api/emotions/details/:id`
**Désactiver un détail d'émotion (Admin uniquement)**

```http
DELETE /api/emotions/details/507f1f77bcf86cd799439026 HTTP/1.1
Authorization: Bearer <admin_token>
```

---

### 6. Logs (Audit) `/api/logs`

#### GET `/api/logs`
**Récupérer tous les logs du système (Admin uniquement)**

```http
GET /api/logs HTTP/1.1
Authorization: Bearer <admin_token>
```

**Paramètres de requête (optionnels)**
- `action` : Filtrer par type d'action
- `admin` : Filtrer par ID administrateur
- `user` : Filtrer par ID utilisateur
- `startDate` : Date de début
- `endDate` : Date de fin

**Réponse (200 OK)**
```json
{
  "status": "success",
  "results": 150,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439040",
        "action": "USER_DELETED",
        "admin": {
          "_id": "507f1f77bcf86cd799439001",
          "firstname": "Admin",
          "lastname": "System"
        },
        "user": {
          "_id": "507f1f77bcf86cd799439011",
          "firstname": "Jean",
          "lastname": "Dupont"
        },
        "details": "Utilisateur Jean Dupont supprimé",
        "article": null,
        "date": "2024-03-30T10:00:00Z",
        "createdAt": "2024-03-30T10:00:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439041",
        "action": "PASSWORD_CHANGED",
        "admin": null,
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "firstname": "Marie",
          "lastname": "Martin"
        },
        "details": "L'utilisateur marie.martin@example.com a changé son mot de passe.",
        "article": null,
        "date": "2024-03-30T11:30:00Z",
        "createdAt": "2024-03-30T11:30:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439042",
        "action": "ARTICLE_CREATED",
        "admin": {
          "_id": "507f1f77bcf86cd799439001",
          "firstname": "Admin",
          "lastname": "System"
        },
        "user": null,
        "article": {
          "_id": "507f1f77bcf86cd799439012",
          "title": "Guide de la méditation"
        },
        "details": "Article 'Guide de la méditation' créé",
        "date": "2024-03-30T12:00:00Z",
        "createdAt": "2024-03-30T12:00:00Z"
      }
    ]
  }
}
```

**Actions disponibles**
- `USER_CREATED` - Création d'utilisateur
- `USER_UPDATED` - Modification d'utilisateur
- `USER_DELETED` - Suppression d'utilisateur
- `USER_REACTIVATED` - Réactivation d'utilisateur
- `PASSWORD_CHANGED` - Changement de mot de passe
- `ARTICLE_CREATED` - Création d'article
- `ARTICLE_UPDATED` - Modification d'article
- `ARTICLE_DELETED` - Suppression d'article
- `ARTICLE_ACTIVATED` - Activation d'article
- `EMOTION_CREATED` - Création d'émotion
- `EMOTION_UPDATED` - Modification d'émotion
- `EMOTION_DELETED` - Suppression d'émotion

---

## 📊 Modèles de données

### User (Utilisateur)
```javascript
{
  _id: ObjectId,
  firstname: String,              // Nom complet
  lastname: String,               // Prénom
  email: String,                  // Email unique
  password: String,               // Hashé avec bcrypt
  birthdate: Date (optionnel),    // Date de naissance
  picture: String (optionnel),    // URL de la photo
  role: Enum ['USER', 'ADMIN', 'GUEST'],  // Rôle
  systemStatus: Enum ['Enabled', 'Disabled'],  // État du compte
  createdAt: Date,                // Date de création
  updatedAt: Date                 // Dernière modification
}
```

### Article
```javascript
{
  _id: ObjectId,
  title: String,                  // Titre de l'article
  content: String,                // Contenu
  category: Enum ['PRÉVENTION', 'CONSEILS', 'EXERCICES', 'GÉNÉRAL'],
  imageUrl: String (optionnel),   // URL de l'image
  author: ObjectId (réf: User),   // Auteur
  publishedAt: Date,              // Date de publication
  isActive: Boolean,              // Publié ou brouillon
  createdAt: Date,                // Date de création
  updatedAt: Date                 // Dernière modification
}
```

### Diary (Journal)
```javascript
{
  _id: ObjectId,
  user: ObjectId (réf: User),     // Auteur de l'entrée
  baseEmotion: ObjectId (réf: Emotion),  // Émotion principale
  emotionDetail: ObjectId (réf: EmotionDetail) (optionnel),  // Détail de l'émotion
  comment: String,                // Texte de l'entrée
  date: Date,                     // Date de l'entrée
  createdAt: Date,                // Date de création
  updatedAt: Date                 // Dernière modification
}
```

### Emotion (Émotion de base)
```javascript
{
  _id: ObjectId,
  name: String,                   // Nom unique
  iconUrl: String (optionnel),    // URL de l'icône
  color: String (optionnel),      // Code couleur hex
  isActive: Boolean,              // Activée ou désactivée
  createdAt: Date,                // Date de création
  updatedAt: Date                 // Dernière modification
}
```

### EmotionDetail (Détail d'émotion)
```javascript
{
  _id: ObjectId,
  name: String,                   // Nom du détail
  baseEmotion: ObjectId (réf: Emotion),  // Émotion parente
  iconUrl: String (optionnel),    // URL de l'icône
  color: String (optionnel),      // Code couleur hex
  isActive: Boolean,              // Activée ou désactivée
  createdAt: Date,                // Date de création
  updatedAt: Date                 // Dernière modification
}
```

### Log (Journal d'audit)
```javascript
{
  _id: ObjectId,
  action: String,                 // Type d'action
  admin: ObjectId (réf: User) (optionnel),  // Admin qui a fait l'action
  user: ObjectId (réf: User) (optionnel),   // Utilisateur affecté
  details: String (optionnel),    // Détails supplémentaires
  article: ObjectId (réf: Article) (optionnel),  // Article affecté
  date: Date,                     // Date de l'action
  createdAt: Date,                // Date du log
  updatedAt: Date                 // Dernière modification
}
```

---

## ⚠️ Gestion des erreurs

### Codes d'erreur HTTP

#### 400 Bad Request
Données invalides ou manquantes

```json
{
  "status": "error",
  "message": "Veuillez fournir un email et un mot de passe"
}
```

#### 401 Unauthorized
Authentification requise ou échouée

```json
{
  "status": "error",
  "message": "Non autorisé, token invalide"
}
```

#### 403 Forbidden
Accès refusé (permissions insuffisantes)

```json
{
  "status": "error",
  "message": "Accès refusé. Rôles autorisés: ADMIN"
}
```

#### 404 Not Found
Ressource non trouvée

```json
{
  "status": "error",
  "message": "Utilisateur non trouvé."
}
```

#### 500 Internal Server Error
Erreur serveur

```json
{
  "status": "error",
  "message": "Une erreur s'est produite"
}
```

---

## 🔒 Sécurité

### Mesures de sécurité implémentées

#### 1. Authentification JWT
- Tokens valides 90 jours par défaut
- Secret stocké en variable d'environnement
- Vérification du token à chaque requête protégée

#### 2. Hashage des mots de passe
- Algorithme bcryptjs (10 salts)
- Jamais stockés en clair
- Comparaison sécurisée lors de la connexion

#### 3. Contrôle d'accès basé sur les rôles (RBAC)
```
┌──────────────────────────────────────┐
│         MATRICE DE PERMISSIONS       │
├──────────────────────────────────────┤
│ Action          │ USER │ ADMIN │ GUEST │
│─────────────────┼──────┼───────┼───────│
│ Voir articles   │  ✅  │  ✅   │  ✅   │
│ Créer article   │      │  ✅   │       │
│ Modifier article│      │  ✅   │       │
│ Supprimer article│     │  ✅   │       │
│ Journal intime  │  ✅  │  ✅   │       │
│ Gestion émotions│      │  ✅   │       │
│ Voir utilisateurs│     │  ✅   │       │
│ Voir logs       │      │  ✅   │       │
└──────────────────────────────────────┘
```

#### 4. Protection des routes
- `protect` : Authentification obligatoire
- `softProtect` : Authentification optionnelle (guest si absent)
- `checkRole` : Vérification des permissions par rôle

#### 5. Audit et logging
- Log de toutes les actions sensibles
- Traçabilité admin/utilisateur
- Détails des modifications

#### 6. Validation des données
- Validation des emails (unique, format)
- Validation des mots de passe (comparaison)
- Filtrage des champs modifiables (pas d'auto-promotion ADMIN)

#### 7. Protection contre l'auto-promotion
```typescript
// Le rôle NE peut PAS être modifié par l'utilisateur
const { firstname, lastname, email, birthdate } = req.body;
// 'role' est exclu intentionnellement
```

#### 8. Vérification du statut du compte
- Les comptes désactivés ne peuvent pas se connecter
- Même avec un token valide, si le compte est désactivé → accès refusé
- Vérification à chaque requête protégée

#### 9. Gestion des tokens invalides
- Token expiré → 401
- Token mal formé → 401
- Pas de token → 401
- Token corrompu → traité comme guest

#### 10. CORS configuré
- Requêtes cross-origin contrôlées
- À configurer selon les domaines autorisés

---

## 📋 Checklist de sécurité

Avant de mettre en production :
- [ ] JWT_SECRET est fort et secret (généré aléatoirement)
- [ ] JWT_EXPIRES_IN est approprié
- [ ] Variables d'environnement ne sont PAS commitées
- [ ] HTTPS activé sur le serveur de production
- [ ] CORS restreint aux domaines autorisés
- [ ] Rate limiting implémenté (recommandé)
- [ ] Logs de sécurité moniteurs régulièrement
- [ ] Backups MongoDB programmés
- [ ] Certificats SSL/TLS à jour
- [ ] DDoS protection activée

---

## 🧪 Exemples d'utilisation

### JavaScript/Fetch API

```javascript
// Connexion
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token;

// Utiliser le token pour les requêtes protégées
const userResponse = await fetch('http://localhost:5000/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const user = await userResponse.json();
console.log(user.data.user);
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Connexion
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

localStorage.setItem('token', data.token);

// Récupérer le profil
const userResponse = await api.get('/users/me');
console.log(userResponse.data.data.user);
```

### cURL

```bash
# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Récupérer mon profil
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"

# Créer une entrée de journal
curl -X POST http://localhost:5000/api/diary \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "baseEmotion":"507f1f77bcf86cd799439020",
    "emotionDetail":"507f1f77bcf86cd799439021",
    "comment":"J'"'"'ai passé une bonne journée",
    "date":"2024-03-30T14:30:00Z"
  }'
```

---

## 📞 Support et contact

Pour toute question ou problème avec l'API :
1. Vérifier la documentation ci-dessus
2. Consulter les logs du serveur
3. Vérifier les variables d'environnement
4. Vérifier la connexion MongoDB

---

**Dernière mise à jour** : 30 Mars 2024  
**Version API** : 1.0.0  
**État** : Production Ready
