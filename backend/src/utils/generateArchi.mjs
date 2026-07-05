import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wb = XLSX.utils.book_new();

function addSheet(name, headers, rows) {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = headers.map((h, i) => {
        const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
        return { wch: Math.min(Math.max(maxLen + 2, 14), 70) };
    });
    XLSX.utils.book_append_sheet(wb, ws, name);
}

// ─── FEUILLE 1 : TABLEAU COMPARATIF ─────────────────────────────────────────
const compHeaders = [
    'Critère',
    'Monolithique',
    'N-tiers / MVC (choix CESIZen)',
    'Microservices'
];

const compRows = [
    // ── DÉFINITION
    ['DÉFINITION', '', '', ''],
    [
        'Description',
        'Application unique où toutes les fonctionnalités (UI, logique métier, accès données) sont regroupées dans un seul et même déployable.',
        'Application découpée en couches logiques distinctes : Présentation (React/React Native), Logique métier (Express API), Données (MongoDB). Les couches communiquent via une interface définie.',
        'Ensemble de petits services indépendants, chacun responsable d\'une fonctionnalité métier précise, communiquant via des API REST ou des messages asynchrones (RabbitMQ, Kafka).'
    ],
    [
        'Exemple concret',
        'Application PHP/Laravel où les vues, contrôleurs et modèles sont dans le même projet déployé sur un seul serveur.',
        'CESIZen : frontend React (port 5173) + backend Express REST (port 3000) + MongoDB (port 27017). Chaque couche est séparée.',
        'Netflix, Uber : un service "utilisateurs", un service "notifications", un service "paiement", chacun déployé indépendamment.'
    ],

    // ── PERFORMANCES
    ['PERFORMANCES', '', '', ''],
    [
        'Latence réseau',
        '✅ Minimale : tous les appels sont internes, pas de réseau entre les composants.',
        '✅ Faible : un seul saut réseau entre le client et l\'API REST.',
        '⚠️ Plus élevée : chaque appel peut traverser plusieurs services et réseaux internes.'
    ],
    [
        'Scalabilité',
        '❌ Scalabilité verticale uniquement (plus de RAM/CPU). Tout le monolithe doit être dupliqué.',
        '✅ Scalabilité horizontale de l\'API backend indépendamment du frontend.',
        '✅✅ Scalabilité fine par service : seul le service surchargé est dupliqué.'
    ],
    [
        'Montée en charge',
        '❌ Limitée : une seule instance gère tout, risque de SPOF (Single Point of Failure).',
        '✅ Backend stateless (JWT), load balancing possible devant l\'API.',
        '✅ Chaque service scale indépendamment selon la charge réelle.'
    ],

    // ── DÉVELOPPEMENT
    ['DÉVELOPPEMENT', '', '', ''],
    [
        'Complexité initiale',
        '✅ Faible : un seul projet, une seule stack, simple à démarrer.',
        '✅ Modérée : 3 projets distincts (backend, frontend, mobile) mais organisation claire.',
        '❌ Élevée : orchestration, service discovery, API gateway, configuration distribuée.'
    ],
    [
        'Temps de développement',
        '✅ Rapide au départ, se dégrade avec la taille du projet.',
        '✅ Bon équilibre : séparation claire sans overhead opérationnel excessif.',
        '❌ Long : chaque service nécessite son propre pipeline CI/CD, ses tests, son déploiement.'
    ],
    [
        'Maintenabilité',
        '❌ Difficile à mesure que le code grossit ("big ball of mud"). Un changement peut tout casser.',
        '✅ Bonne : chaque couche a une responsabilité claire. Modifications localisées.',
        '✅ Excellente par service, mais complexité globale élevée (traçabilité distribuée).'
    ],
    [
        'Travail en équipe',
        '❌ Conflits fréquents sur le même codebase. Merge complexes.',
        '✅ Équipes frontend/backend/mobile travaillent en parallèle via contrat d\'API.',
        '✅ Chaque équipe est autonome sur son service. Idéal pour les grandes organisations.'
    ],
    [
        'Débogage',
        '✅ Simple : logs centralisés, stack trace unique.',
        '✅ Logs centralisables, requêtes tracées par endpoint REST.',
        '❌ Complexe : distributed tracing (Jaeger, Zipkin), logs agrégés (ELK Stack) nécessaires.'
    ],

    // ── DÉPLOIEMENT
    ['DÉPLOIEMENT', '', '', ''],
    [
        'Déploiement',
        '✅ Simple : un seul artefact à déployer (JAR, container).',
        '✅ Modéré : 3 containers Docker (backend, frontend, mobile build). Docker Compose suffit.',
        '❌ Complexe : orchestration nécessaire (Kubernetes), gestion de dizaines de services.'
    ],
    [
        'Disponibilité',
        '❌ Une mise à jour implique un downtime de tout le système.',
        '✅ Le frontend peut rester en ligne pendant la mise à jour du backend.',
        '✅ Déploiement en rolling update par service. Zero downtime possible.'
    ],
    [
        'Infrastructure requise',
        '✅ Minimal : un seul serveur peut suffire.',
        '✅ Raisonnable : 3 services, 1 base de données. Déployable sur un VPS standard.',
        '❌ Lourd : load balancer, API gateway, service registry, bases de données par service.'
    ],

    // ── SÉCURITÉ
    ['SÉCURITÉ', '', '', ''],
    [
        'Surface d\'attaque',
        '⚠️ Tout le code dans un même processus : une faille compromise tout.',
        '✅ API REST expose uniquement les endpoints documentés. CORS configuré.',
        '✅ Isolation par service : une faille ne compromet qu\'un service.'
    ],
    [
        'Authentification',
        'Session côté serveur (cookies) ou token global partagé dans le monolithe.',
        '✅ JWT sans état : token vérifié à chaque requête, aucune session serveur. Implémenté via middleware.',
        'OAuth2 / JWT partagé entre services ou Identity Provider centralisé (Keycloak).'
    ],

    // ── COÛT
    ['COÛT', '', '', ''],
    [
        'Coût infrastructure',
        '✅ Faible : un seul serveur.',
        '✅ Faible à modéré : 3 services sur un VPS ou PaaS (Railway, Render).',
        '❌ Élevé : Kubernetes + monitoring distribué + bases de données multiples.'
    ],
    [
        'Coût de formation',
        '✅ Faible : une seule technologie à maîtriser.',
        '✅ Modéré : Node.js/Express + React + MongoDB (stack JS unifiée).',
        '❌ Élevé : Docker, Kubernetes, observabilité distribuée, event-driven architecture.'
    ],

    // ── ADÉQUATION AU PROJET
    ['ADÉQUATION AU PROJET CESIZEN', '', '', ''],
    [
        'Taille du projet',
        '⚠️ Adapté pour un prototype mais limitant dès que le projet grandit.',
        '✅ Parfaitement adapté : projet de taille moyenne, 3 clients (web, mobile), équipe réduite.',
        '❌ Surdimensionné pour CESIZen à ce stade. Complexité non justifiée.'
    ],
    [
        'Évolutivité future',
        '❌ Difficile d\'ajouter des fonctionnalités sans risque de régression.',
        '✅ Facilement extensible : nouveaux endpoints API, nouvelle application cliente.',
        '✅ Très évolutif si le projet grandit à grande échelle (millions d\'utilisateurs).'
    ],
    [
        'Justification du choix',
        'Non retenu : manque de séparation des responsabilités, difficile à maintenir et tester.',
        '✅ CHOIX RETENU : séparation claire des couches, une API REST consommée par 2 clients (web + mobile), stack JavaScript unifiée (TypeScript), testabilité et maintenabilité optimales pour l\'équipe.',
        'Non retenu : complexité opérationnelle disproportionnée pour un projet académique. À envisager si CESIZen devait passer à l\'échelle nationale.'
    ],
    [
        'Note globale',
        '⭐⭐ / 5 — Adapté uniquement aux très petits projets ou MVPs rapides.',
        '⭐⭐⭐⭐⭐ / 5 — Optimal pour CESIZen : bon équilibre structure / simplicité / évolutivité.',
        '⭐⭐⭐ / 5 — Excellent à grande échelle, mais sur-dimensionné ici.'
    ],
];

addSheet('Comparaison 3 Architectures', compHeaders, compRows);

// ─── FEUILLE 2 : FICHE ARCHITECTURE CESIZEN ──────────────────────────────────
const ficheHeaders = ['Composant', 'Technologie', 'Rôle', 'Port', 'Communication'];
const ficheRows = [
    ['Frontend Web',    'React 19 + Vite + TypeScript + TailwindCSS', 'Interface utilisateur web (SPA)',                     '5173', 'HTTP REST → API backend'],
    ['Application Mobile', 'React Native 0.81 + Expo Router + TypeScript', 'Interface utilisateur mobile iOS/Android',        'N/A',  'HTTP REST → API backend'],
    ['API Backend',     'Node.js + Express 5 + TypeScript',           'Logique métier, authentification JWT, contrôleurs',   '3000', 'Expose endpoints REST JSON'],
    ['Base de données', 'MongoDB 7 + Mongoose',                       'Persistance des données (users, emotions, diary...)', '27017','Mongoose ODM ← Backend'],
    ['Auth',            'JWT (jsonwebtoken) + bcryptjs',              'Authentification stateless, hashage mots de passe',   'N/A',  'Token dans header Authorization: Bearer'],
    ['Tests',           'Jest + Supertest + mongodb-memory-server',   'Tests unitaires et d\'intégration automatisés',        'N/A',  'Isolation en mémoire'],
];
addSheet('Architecture CESIZen', ficheHeaders, ficheRows);

// ─── FEUILLE 3 : JUSTIFICATION MONGODB VS SQL ─────────────────────────────────
const mongoHeaders = ['Critère', 'MongoDB (choix retenu)', 'MySQL (initialement prévu)'];
const mongoRows = [
    [
        'Modèle de données',
        'Documents JSON imbriqués. Les règles de scoring du diagnostic et les réponses aux questions sont naturellement imbriquées dans le document du test. Pas de jointures complexes.',
        'Tables relationnelles avec clés étrangères. Le questionnaire Holmes & Rahe nécessiterait 4 tables (Test, Question, Answer, Rule) avec des jointures systématiques.'
    ],
    [
        'Flexibilité du schéma',
        'Schéma flexible : ajout d\'un champ sur une collection sans migration de base. Idéal pour un projet en évolution rapide.',
        'Schéma rigide : toute modification de structure requiert une migration SQL (ALTER TABLE), risque de downtime.'
    ],
    [
        'Cohérence avec la stack',
        'Stack 100% JavaScript/TypeScript end-to-end. Les documents MongoDB sont nativement des objets JS. Mongoose fournit la validation de schéma et l\'ODM.',
        'Nécessite un driver séparé (mysql2 ou Sequelize ORM), passage JS ↔ SQL non natif.'
    ],
    [
        'Performance lectures',
        'Lecture d\'une entrée de journal avec ses émotions en un seul document. Pas de JOIN.',
        'SELECT avec JOIN entre diary, emotion, emotion_detail à chaque lecture.'
    ],
    [
        'Scalabilité horizontale',
        'MongoDB supporte nativement le sharding et la réplication (Replica Sets). Adapté à une montée en charge.',
        'MySQL scale verticalement par défaut. Clustering possible mais plus complexe.'
    ],
    [
        'Adéquation au projet',
        '✅ Retenu : structure imbriquée des données (test + questions + réponses + règles) correspond parfaitement au modèle document.',
        '⚠️ Prévu dans le CDC Bloc 1 (contrainte académique). Non retenu pour le prototype en raison de la nature des données.'
    ],
    [
        'Note de transition',
        'Le MLD relationnel du CDC Bloc 1 a servi de base de réflexion pour identifier les entités (User, Emotion, DiaryEntry, Article, DiagnosticTest). Ces entités ont ensuite été modélisées en collections MongoDB.',
        'Le modèle relationnel reste valide comme référence conceptuelle. La migration vers MongoDB est justifiée par les besoins techniques du prototype.'
    ],
];
addSheet('MongoDB vs SQL', mongoHeaders, mongoRows);

// ─── Export ───────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, '..', '..', '..', 'CESIZen_Comparaison_Architectures.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`✅ Fichier généré : ${outputPath}`);
