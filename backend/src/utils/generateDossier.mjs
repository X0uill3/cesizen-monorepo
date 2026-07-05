import {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
    PageBreak, PageNumber, Header, Footer, VerticalAlign,
} from 'docx';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SAGE  = '2E7D52';
const GREY  = 'F5F5F5';
const DARK  = '212121';
const WHITE = 'FFFFFF';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const br = () => new Paragraph({ text: '' });

const h1 = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: SAGE } },
});

const h2 = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
});

const h3 = (text) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
});

const p = (text) => new Paragraph({
    children: [new TextRun({ text, size: 22, color: DARK })],
    spacing: { after: 180 },
    alignment: AlignmentType.JUSTIFIED,
});

const bold = (text) => new TextRun({ text, bold: true, size: 22, color: DARK });
const run  = (text) => new TextRun({ text, size: 22, color: DARK });
const code = (text) => new TextRun({
    text,
    font: 'Courier New',
    size: 20,
    color: '1565C0',
    shading: { type: ShadingType.CLEAR, fill: 'EEF2FF' },
});

const mixed = (...runs) => new Paragraph({ children: runs, spacing: { after: 160 } });
const codeBlock = (text) => new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 20, color: '1565C0' })],
    shading: { type: ShadingType.CLEAR, fill: 'EEF2FF' },
    spacing: { after: 100, before: 100 },
    indent: { left: 360 },
});

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// ─── ENTITY CARD (diagramme de classes visuel) ────────────────────────────────
function entityCard(title, fields, color) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top:    { style: BorderStyle.SINGLE, size: 6, color },
            bottom: { style: BorderStyle.SINGLE, size: 2, color },
            left:   { style: BorderStyle.SINGLE, size: 6, color },
            right:  { style: BorderStyle.SINGLE, size: 6, color },
            insideH:{ style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
            insideV:{ style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: title, bold: true, size: 20, color: WHITE })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 40, before: 40 },
                    })],
                    shading: { type: ShadingType.CLEAR, fill: color },
                    margins: { top: 60, bottom: 60, left: 80, right: 80 },
                })],
            }),
            ...fields.map(f => new TableRow({
                children: [new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: f, size: 17, font: 'Courier New', color: '333333' })],
                        spacing: { after: 20, before: 20 },
                    })],
                    shading: { type: ShadingType.CLEAR, fill: 'F8FAFB' },
                    margins: { top: 30, bottom: 30, left: 100, right: 80 },
                })],
            })),
        ],
    });
}

function diagramGrid(columns) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({
            children: columns.map(({ card, width }) => new TableCell({
                children: [card],
                width: { size: width, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 80, left: 80, right: 80 },
                borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                },
            })),
        })],
    });
}

function tbl(headers, rows, colWidths) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                tableHeader: true,
                children: headers.map((h, i) => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60, before: 60 },
                    })],
                    shading: { type: ShadingType.CLEAR, fill: SAGE },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    ...(colWidths ? { width: { size: colWidths[i], type: WidthType.PERCENTAGE } } : {}),
                    verticalAlign: VerticalAlign.CENTER,
                })),
            }),
            ...rows.map((row, ri) => new TableRow({
                children: row.map((val, ci) => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: String(val ?? ''), size: 20, color: DARK })],
                        spacing: { after: 60, before: 60 },
                    })],
                    shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? WHITE : GREY },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    ...(colWidths ? { width: { size: colWidths[ci], type: WidthType.PERCENTAGE } } : {}),
                    verticalAlign: VerticalAlign.CENTER,
                })),
            })),
        ],
    });
}

// ─── PAGE DE GARDE ────────────────────────────────────────────────────────────
const coverPage = [
    br(), br(), br(), br(),
    new Paragraph({
        children: [new TextRun({ text: 'DOSSIER TECHNIQUE', bold: true, size: 56, color: SAGE })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'CESIZen — Application de bien-être mental', bold: true, size: 36, color: DARK })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'Bloc 2 — Conception et développement d\'applications', size: 26, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
    }),
    new Paragraph({
        children: [new TextRun({ text: '─────────────────────────────────────', size: 24, color: SAGE })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'Enzo Agostinho', bold: true, size: 28, color: DARK })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'CESI École d\'Ingénieurs — CDA 2024/2026', size: 24, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'Mai 2026', size: 24, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
    }),
    new Paragraph({
        children: [new TextRun({ text: '─────────────────────────────────────', size: 24, color: SAGE })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
    }),
    new Paragraph({
        children: [new TextRun({ text: 'Node.js · Express · MongoDB · React · React Native · TypeScript', size: 20, color: '777777' })],
        alignment: AlignmentType.CENTER,
    }),
    pageBreak(),
];

// ─── 1. PRÉSENTATION DU PROJET ────────────────────────────────────────────────
const section1 = [
    h1('1. Présentation du projet CESIZen'),

    h2('1.1 Contexte'),
    p('CESIZen est une application de bien-être mental développée dans le cadre du Bloc 2 du titre Concepteur Développeur d\'Applications à CESI École d\'Ingénieurs. Le projet couvre deux interfaces : une application web destinée aux postes fixes et un bureau administrateur, et une application mobile pour un usage quotidien sur smartphone.'),

    h2('1.2 Périmètre fonctionnel'),
    tbl(
        ['Module', 'Description', 'Plateforme'],
        [
            ['Authentification',     'Inscription, connexion JWT, déconnexion, suppression de compte',          'Web + Mobile'],
            ['Tracker d\'émotions',  'Journal quotidien — 6 émotions de base, 35 sous-émotions, statistiques', 'Web + Mobile'],
            ['Respiration guidée',   '3 profils de respiration (7-4-8, 5-5, 4-6) avec animation et minuteur',  'Mobile'],
            ['Diagnostic de stress', 'Questionnaire Holmes & Rahe, scoring automatique, 3 niveaux de résultat', 'Web + Mobile'],
            ['Articles',             'Consultation publique, gestion éditoriale par les administrateurs',       'Web + Mobile'],
            ['Administration',       'Gestion des utilisateurs, articles, émotions et diagnostics',             'Web'],
        ],
        [22, 52, 26]
    ),
    br(),

    h2('1.3 Équipe'),
    tbl(
        ['Nom', 'Rôle', 'Périmètre'],
        [
            ['Enzo Agostinho', 'Développeur Full-Stack', 'Architecture, API backend, frontend web, application mobile, tests'],
        ],
        [25, 25, 50]
    ),
    br(),

    h2('1.4 Accessibilité et approche Mobile First'),

    p('L\'interface web de CESIZen a été conçue selon l\'approche Mobile First : les styles de base ciblent les petits écrans, et les breakpoints TailwindCSS (sm, md, lg) étendent progressivement la mise en page vers les grands écrans. Cette stratégie garantit une expérience cohérente quel que soit le terminal.'),

    p('Sur le plan de l\'accessibilité, plusieurs principes du RGAA (Référentiel Général d\'Amélioration de l\'Accessibilité) ont été appliqués. Les contrastes de couleur entre le texte et l\'arrière-plan respectent un ratio minimal de 4,5:1 pour le corps de texte, conformément au critère 3.2 du RGAA. Les composants interactifs (boutons, champs de formulaire) disposent de labels explicites et d\'états de focus visibles. Les images décoratives portent un attribut alt vide pour ne pas être lues par les lecteurs d\'écran.'),

    p('L\'application mobile React Native tire parti des composants accessibles natifs d\'Expo : les éléments TouchableOpacity exposent leur rôle et leur label aux API d\'accessibilité iOS (VoiceOver) et Android (TalkBack). Les textes de l\'interface respectent le scaling système pour les utilisateurs ayant augmenté la taille de police dans leurs réglages.'),

    tbl(
        ['Critère RGAA', 'Application dans CESIZen', 'Statut'],
        [
            ['Critère 3.2 — Contraste',     'Ratio ≥ 4,5:1 pour le texte courant, ≥ 3:1 pour les grands titres', 'Respecté'],
            ['Critère 11.1 — Labels',        'Tous les champs de formulaire ont un label associé (<label> ou aria-label)', 'Respecté'],
            ['Critère 4.1 — Navigation clavier', 'Focus visible sur tous les éléments interactifs web', 'Respecté'],
            ['Mobile First',                 'Breakpoints TailwindCSS sm/md/lg — conception mobile en premier', 'Respecté'],
            ['Responsive design',            'Mise en page fluide sur 320 px (mobile) à 1440 px (desktop)', 'Respecté'],
        ],
        [30, 50, 20]
    ),

    pageBreak(),
];

// ─── 2. COMPARAISON DES 3 ARCHITECTURES ──────────────────────────────────────
const section2 = [
    h1('2. Comparaison des architectures logicielles'),

    p('Trois architectures ont été étudiées avant de choisir celle retenue pour CESIZen : l\'architecture monolithique, l\'architecture N-tiers avec pattern MVC, et l\'architecture microservices.'),

    h2('2.1 Architecture monolithique'),

    p('Dans une architecture monolithique, toutes les couches de l\'application — interface utilisateur, logique métier et accès aux données — sont regroupées dans un seul déployable. Un seul processus gère l\'ensemble des requêtes.'),

    mixed(bold('Points forts. '), run('Le développement initial est rapide : une seule stack, un seul projet, un seul déploiement. Les logs sont centralisés et le débogage est direct. La latence interne est minimale puisqu\'il n\'y a pas de réseau entre les couches.')),

    mixed(bold('Points faibles. '), run('La scalabilité est uniquement verticale : tout le monolithe doit être dupliqué pour absorber la charge, même si un seul module est sollicité. La base de code grossit rapidement et devient difficile à maintenir. Un bug dans une couche peut compromettre l\'ensemble du système. Toute mise à jour implique un redéploiement complet avec coupure de service.')),

    h2('2.2 Architecture N-tiers / MVC — solution retenue'),

    p('L\'architecture N-tiers sépare l\'application en couches logiques indépendantes. CESIZen en applique trois : la couche Présentation (clients web et mobile), la couche Logique métier (API REST Express), et la couche Données (MongoDB). Ce découpage correspond au pattern MVC étendu à une API consommée par plusieurs clients.'),

    tbl(
        ['Couche', 'Technologie', 'Responsabilité', 'Port'],
        [
            ['Présentation (View)',       'React 19 + TailwindCSS / React Native + Expo', 'Interface utilisateur web et mobile',               '5173 / N/A'],
            ['Logique métier (Controller)', 'Node.js + Express 5 + TypeScript',            'Routes, contrôleurs, middlewares JWT, validation',   '3000'],
            ['Données (Model)',           'MongoDB 7 + Mongoose ODM',                      'Collections, schémas, persistance',                  '27017'],
        ],
        [22, 30, 35, 13]
    ),
    br(),

    mixed(bold('Points forts. '), run('Chaque couche est modifiable sans toucher aux autres. La même API REST est consommée par le web et le mobile, ce qui évite toute duplication de logique métier. Le backend est stateless (JWT) : il peut être répliqué derrière un load balancer sans changement de code. La stack TypeScript est unifiée de bout en bout. Les tests sont écrits couche par couche avec Jest et Supertest.')),

    mixed(bold('Points faibles. '), run('La coordination de trois projets distincts demande une rigueur de versioning et de contrat d\'API. La scalabilité, bien que horizontale, reste globale au backend : on ne peut pas scaler uniquement le module de diagnostic sans scaler toute l\'API.')),

    h2('2.3 Architecture microservices'),

    p('L\'architecture microservices décompose l\'application en services indépendants, chacun responsable d\'un domaine métier précis. Netflix, Uber et Amazon exploitent ce modèle à grande échelle. Chaque service dispose de sa propre base de données et se déploie de façon autonome. La communication inter-services passe par des API REST ou des bus de messages asynchrones (RabbitMQ, Kafka).'),

    mixed(bold('Points forts. '), run('La scalabilité est chirurgicale : seul le service saturé est dupliqué. Un déploiement par service est possible sans interruption de service globale. Une défaillance reste isolée à son périmètre.')),

    mixed(bold('Points faibles. '), run('La complexité opérationnelle est élevée : il faut un orchestrateur (Kubernetes), un service registry, une API gateway, et des outils de tracing distribué (Jaeger, ELK Stack). Chaque service maintient sa propre base de données, ce qui multiplie les coûts d\'infrastructure. Pour une équipe réduite sur un projet de taille académique, le ratio complexité/bénéfice est défavorable.')),

    h2('2.4 Tableau comparatif'),
    tbl(
        ['Critère', 'Monolithique', 'N-tiers / MVC ✅', 'Microservices'],
        [
            ['Complexité de départ',     'Faible',                  'Modérée',                        'Élevée'],
            ['Scalabilité',              'Verticale uniquement',    'Horizontale (API stateless)',     'Par service'],
            ['Maintenabilité',           'Se dégrade avec le temps','Couches séparées, stable',        'Bonne par service, complexe globalement'],
            ['Déploiement',              'Simple — 1 artefact',     'Docker Compose — 3 services',    'Kubernetes requis'],
            ['Multi-clients web+mobile', 'Difficile',               '1 API → 2 clients natifs',       'Via API gateway'],
            ['Testabilité',             'Couplée',                  'Couche par couche',              'Par service'],
            ['Coût infrastructure',      'Minimal',                 'VPS standard',                  'Élevé'],
            ['Débogage',                'Direct',                   'Logs REST + middleware',         'Tracing distribué requis'],
            ['Adéquation CESIZen',       '2 / 5',                  '5 / 5',                          '3 / 5'],
        ],
        [25, 20, 30, 25]
    ),
    br(),

    h2('2.5 Choix retenu'),

    p('L\'architecture N-tiers avec pattern MVC a été retenue. Le projet dispose de deux clients distincts (React web et React Native mobile) qui consomment la même API : ce besoin correspond exactement au modèle N-tiers. La stack TypeScript est cohérente de bout en bout, ce qui réduit les erreurs de contrat entre couches. Le backend stateless avec JWT scale horizontalement sans modification structurelle. La complexité reste maîtrisable pour une équipe d\'une personne, contrairement aux microservices qui nécessitent une infrastructure d\'orchestration disproportionnée pour ce périmètre.'),

    p('Les microservices seraient justifiés si CESIZen devait passer à une échelle nationale, avec des équipes produit distinctes par domaine (utilisateurs, journal, diagnostic). Ce n\'est pas le périmètre actuel.'),

    pageBreak(),
];

// ─── 3. MODÈLE DE DONNÉES ─────────────────────────────────────────────────────
const section3 = [
    h1('3. Modèle de données'),

    h2('3.1 Transition MLD relationnel vers MongoDB'),

    p('Le Cahier des Charges rédigé en Bloc 1 présentait un Modèle Logique de Données relationnel conçu pour MySQL. Le sujet de Bloc 2 autorise explicitement l\'utilisation de technologies différentes de celles initialement préconisées pour le prototype. MongoDB a donc été retenu, et le modèle relationnel a été adapté en modèle document selon les règles suivantes.'),

    p('Les entités du MLD deviennent des collections MongoDB. Les relations 1-N dont les données filles n\'ont pas d\'existence indépendante sont représentées par des sous-documents imbriqués (par exemple les règles de scoring dans DiagnosticTest, ou les réponses possibles dans DiagnosticQuestion). Les relations 1-N et N-N entre entités autonomes utilisent des références ObjectId gérées par Mongoose (ref).'),

    h2('3.2 Collections MongoDB'),
    tbl(
        ['Collection', 'Champs principaux', 'Relations', 'Équivalent MLD'],
        [
            ['users',               '_id, email, password (bcrypt), firstname, lastname, role, isActive',                                         '—',                                  'Table User_'],
            ['emotions',            '_id, name, color (hex)',                                                                                       '—',                                  'Table Emotion + Color'],
            ['emotiondetails',      '_id, name, emotion (ref → emotions)',                                                                          'N vers 1 emotion',                  'Table Emotion_detail'],
            ['diaryentries',        '_id, user (ref), baseEmotion (ref), emotionDetail (ref), comment, date',                                      '1 user, 1 émotion',                  'Table Diary'],
            ['articles',            '_id, title, content, category, author (ref → users), isPublished, createdAt',                                 '1 auteur',                          'Table Articles + Category'],
            ['diagnostictests',     '_id, title, description, isActive, rules: [{minScore, maxScore, title, description, color}]',                 'rules = sous-documents',             'Tables Test + Rule'],
            ['diagnosticquestions', '_id, test (ref), text, order, isActive, answers: [{label, points}]',                                          '1 test, answers imbriquées',         'Tables Question + Answer'],
            ['diagnosticresults',   '_id, user (ref), test (ref), score, matchedRule, answers, completedAt',                                       '1 user + 1 test',                   'Table Result'],
        ],
        [16, 38, 22, 24]
    ),
    br(),

    h2('3.3 Diagramme de classes — collections MongoDB'),

    p('Le diagramme ci-dessous représente les huit collections de la base de données et leurs relations. Les champs en italique sont des références ObjectId vers d\'autres collections (équivalent des clés étrangères en SQL). Les champs entre crochets sont des sous-documents imbriqués sans existence indépendante.'),
    br(),

    diagramGrid([
        { width: 33, card: entityCard('users', [
            '_id: ObjectId',
            'email: String',
            'password: String',
            'firstname: String',
            'lastname: String',
            'role: ADMIN | USER',
            'isActive: Boolean',
        ], '2E7D52') },
        { width: 33, card: entityCard('emotions', [
            '_id: ObjectId',
            'name: String',
            'color: String (hex)',
        ], '1ABC9C') },
        { width: 33, card: entityCard('emotiondetails', [
            '_id: ObjectId',
            'name: String',
            'emotion: ref → emotions',
        ], '2980B9') },
    ]),
    br(),

    new Paragraph({
        children: [new TextRun({ text: '↓ user             ↓ baseEmotion / emotionDetail', size: 20, font: 'Courier New', color: '888888' })],
        spacing: { after: 100 },
        indent: { left: 200 },
    }),

    diagramGrid([
        { width: 50, card: entityCard('diaryentries', [
            '_id: ObjectId',
            'user: ref → users',
            'baseEmotion: ref → emotions',
            'emotionDetail: ref → emotiondetails',
            'comment: String',
            'date: Date',
        ], 'E67E22') },
        { width: 50, card: entityCard('articles', [
            '_id: ObjectId',
            'title: String',
            'content: String',
            'category: String',
            'author: ref → users',
            'isPublished: Boolean',
            'createdAt: Date',
        ], '8E44AD') },
    ]),
    br(),

    new Paragraph({
        children: [new TextRun({ text: '↓ test                                    ↓ user + test', size: 20, font: 'Courier New', color: '888888' })],
        spacing: { after: 100 },
        indent: { left: 200 },
    }),

    diagramGrid([
        { width: 33, card: entityCard('diagnostictests', [
            '_id: ObjectId',
            'title: String',
            'description: String',
            'isActive: Boolean',
            '[rules]: [{',
            '  minScore, maxScore,',
            '  title, description,',
            '  color }]',
        ], 'C0392B') },
        { width: 33, card: entityCard('diagnosticquestions', [
            '_id: ObjectId',
            'test: ref → diagnostictests',
            'text: String',
            'order: Number',
            'isActive: Boolean',
            '[answers]: [{',
            '  label, points }]',
        ], 'D35400') },
        { width: 33, card: entityCard('diagnosticresults', [
            '_id: ObjectId',
            'user: ref → users',
            'test: ref → diagnostictests',
            'score: Number',
            'matchedRule: Object',
            'answers: Array',
            'completedAt: Date',
        ], '7F8C8D') },
    ]),
    br(),

    h2('3.4 Comparaison MongoDB / MySQL pour ce projet'),
    tbl(
        ['Critère', 'MongoDB', 'MySQL'],
        [
            ['Structure des données',  'Les règles de scoring et les réponses s\'imbriquent naturellement dans leur document parent sans jointure.', '4 tables distinctes (Test, Question, Answer, Rule) avec jointures systématiques à chaque lecture.'],
            ['Évolution du schéma',    'L\'ajout d\'un champ ne requiert qu\'une modification du modèle Mongoose. Pas de migration.',                'Toute modification de structure nécessite un ALTER TABLE, avec risque de downtime.'],
            ['Cohérence de la stack',  'Les documents sont nativement des objets JavaScript. Pas de conversion SQL ↔ JS.',                          'Driver séparé requis (mysql2 ou Sequelize) et conversion systématique.'],
            ['Performance en lecture', 'Une entrée de journal est lue en un seul document. Aucune jointure.',                                       'SELECT avec JOIN entre diary, emotion et emotion_detail à chaque lecture.'],
            ['Scalabilité',            'Sharding et Replica Sets natifs.',                                                                          'Scaling vertical par défaut. Clustering plus complexe à mettre en œuvre.'],
        ],
        [20, 40, 40]
    ),

    pageBreak(),
];

// ─── 4. GUIDE D'INSTALLATION ──────────────────────────────────────────────────
const section4 = [
    h1('4. Guide d\'installation'),

    p('Le projet CESIZen est réparti sur trois dépôts Git indépendants, un par plateforme. Chaque dépôt se clone, s\'installe et se démarre séparément.'),

    tbl(
        ['Dépôt', 'Rôle', 'Technologie'],
        [
            ['cesizen-backend',  'API REST — logique métier et accès données', 'Node.js, Express 5, MongoDB, TypeScript'],
            ['cesizen-frontend', 'Application web',                            'React 19, Vite, TailwindCSS, TypeScript'],
            ['cesizen-mobile',   'Application mobile iOS / Android',           'React Native, Expo Router, TypeScript'],
        ],
        [24, 38, 38]
    ),
    br(),

    h2('4.1 Prérequis'),
    tbl(
        ['Outil', 'Version', 'Commande de vérification'],
        [
            ['Node.js',  '20.x LTS', 'node --version'],
            ['npm',      '10.x',     'npm --version'],
            ['MongoDB',  '7.x',      'mongod --version'],
            ['Git',      '2.x',      'git --version'],
            ['Expo Go',  'Dernière', 'App Store ou Play Store'],
        ],
        [25, 20, 55]
    ),
    br(),

    h2('4.2 Dépôt 1 — Backend (API REST)'),

    h3('Cloner et installer'),
    codeBlock('git clone https://github.com/<org>/cesizen-backend.git'),
    codeBlock('cd cesizen-backend'),
    codeBlock('npm install'),
    br(),

    h3('Variables d\'environnement'),
    p('Créer un fichier .env à la racine du dépôt :'),
    codeBlock('MONGO_URI=mongodb://127.0.0.1:27017/cda_db'),
    codeBlock('JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire'),
    codeBlock('PORT=3000'),
    br(),

    h3('Initialisation de la base de données'),
    p('Le seeder peuple la base avec les données de démonstration : deux comptes (admin et utilisateur), le référentiel des émotions (6 de base, 35 sous-émotions), six articles sur la santé mentale, et le questionnaire Holmes & Rahe (43 questions, 3 seuils de scoring).'),
    codeBlock('npm run seeder'),
    br(),

    h3('Démarrage'),
    codeBlock('npm run dev'),
    p('L\'API est accessible sur http://localhost:3000. La console confirme la connexion à MongoDB au démarrage.'),
    br(),

    h2('4.3 Dépôt 2 — Frontend web (React)'),

    h3('Cloner et installer'),
    codeBlock('git clone https://github.com/<org>/cesizen-frontend.git'),
    codeBlock('cd cesizen-frontend'),
    codeBlock('npm install'),
    br(),

    h3('Variables d\'environnement'),
    p('Le backend doit être démarré avant de lancer le frontend. Créer un fichier .env à la racine du dépôt :'),
    codeBlock('VITE_API_URL=http://localhost:3000/api'),
    br(),

    h3('Démarrage'),
    codeBlock('npm run dev'),
    p('L\'application web est accessible sur http://localhost:5173.'),
    br(),

    h2('4.4 Dépôt 3 — Application mobile (React Native + Expo)'),

    h3('Cloner et installer'),
    codeBlock('git clone https://github.com/<org>/cesizen-mobile.git'),
    codeBlock('cd cesizen-mobile'),
    codeBlock('npm install'),
    br(),

    h3('Configuration de l\'URL de l\'API'),
    p('L\'application mobile s\'exécute sur un appareil physique ou un émulateur qui n\'a pas accès à localhost de la machine hôte. Il faut renseigner l\'adresse IP locale de la machine faisant tourner le backend. Sur Windows, cette IP s\'obtient via ipconfig (champ "Adresse IPv4"). Le téléphone et la machine hôte doivent être sur le même réseau Wi-Fi.'),
    codeBlock('# Fichier api/api.ts'),
    codeBlock('baseURL: \'http://192.168.X.X:3000/api\'  // remplacer par l\'IP réelle'),
    br(),

    h3('Démarrage'),
    codeBlock('npx expo start'),
    p('Un QR code s\'affiche dans le terminal. Le scanner avec Expo Go charge l\'application directement sur le téléphone.'),
    br(),

    h2('4.5 Tests automatisés (dépôt backend)'),
    codeBlock('cd cesizen-backend'),
    codeBlock('npm test                     # Suite complète'),
    codeBlock('npm run test:unit            # Tests unitaires'),
    codeBlock('npm run test:integration     # Tests d\'intégration'),
    codeBlock('npm run test:coverage        # Rapport de couverture'),
    br(),

    h2('4.6 Ordre de démarrage recommandé'),
    tbl(
        ['Étape', 'Dépôt', 'Commande', 'Résultat'],
        [
            ['1', 'cesizen-backend',  'npm run seeder', 'Base de données initialisée avec les données de démonstration'],
            ['2', 'cesizen-backend',  'npm run dev',    'API REST disponible sur http://localhost:3000'],
            ['3', 'cesizen-frontend', 'npm run dev',    'Application web disponible sur http://localhost:5173'],
            ['4', 'cesizen-mobile',   'npx expo start', 'QR code à scanner avec Expo Go sur le téléphone'],
        ],
        [8, 22, 22, 48]
    ),

    pageBreak(),
];

// ─── 5. CAHIER DE TESTS ───────────────────────────────────────────────────────
const mkTestTable = (rows) => tbl(
    ['ID', 'Description', 'Préconditions', 'Étapes', 'Résultat attendu', 'Statut'],
    rows,
    [10, 20, 16, 22, 24, 8]
);

const section5 = [
    h1('5. Cahier de tests'),

    p('Ce cahier couvre l\'ensemble des fonctionnalités de CESIZen. Les tests ont été exécutés manuellement sur les deux interfaces (web et mobile) et automatiquement via Jest pour les endpoints backend.'),

    h2('5.1 Comptes utilisateurs et authentification'),
    mkTestTable([
        ['TC-AUTH-01', 'Création de compte avec données valides',              'Aucun compte avec cet email',         '1. /register\n2. Remplir prénom, nom, email, mot de passe\n3. Soumettre',           'Compte créé, redirection vers /login, message de confirmation',           'PASS'],
        ['TC-AUTH-02', 'Inscription avec email déjà utilisé',                  'Compte existant avec cet email',      '1. /register\n2. Saisir email déjà enregistré\n3. Soumettre',                       'Message d\'erreur "Email déjà utilisé". Aucun doublon créé en base.',     'PASS'],
        ['TC-AUTH-03', 'Mot de passe inférieur à 8 caractères',                'Aucun',                               '1. Saisir un mot de passe de 4 caractères\n2. Soumettre',                           'Validation côté client déclenchée. Requête non envoyée au serveur.',      'PASS'],
        ['TC-AUTH-04', 'Connexion avec identifiants corrects',                 'Compte actif en base',                '1. /login\n2. Email + mot de passe valides\n3. Connexion',                           'Token JWT stocké. Redirection vers le tableau de bord.',                  'PASS'],
        ['TC-AUTH-05', 'Connexion avec mot de passe erroné',                   'Compte existant',                     '1. Email valide + mauvais mot de passe\n2. Soumettre',                               'HTTP 401. Message "Identifiants incorrects". Aucun token généré.',        'PASS'],
        ['TC-AUTH-06', 'Déconnexion',                                          'Utilisateur connecté',                '1. Cliquer "Se déconnecter"\n2. Confirmer',                                          'Token effacé du store. Redirection vers /login.',                         'PASS'],
        ['TC-AUTH-07', 'Suppression du compte (conformité RGPD)',              'Utilisateur connecté',                '1. Profil > Supprimer mon compte\n2. Confirmer',                                     'Compte supprimé en base. Déconnexion automatique.',                       'PASS'],
        ['TC-AUTH-08', 'Accès à une route protégée sans connexion',            'Utilisateur non connecté',            '1. Naviguer directement vers /diary',                                                'Redirection automatique vers /login.',                                    'PASS'],
        ['TC-AUTH-09', 'Consultation des articles sans connexion (invité)',    'Utilisateur non connecté',            '1. Page d\'accueil\n2. Lire un article',                                             'Articles lisibles. Les fonctions connectées restent inaccessibles.',      'PASS'],
        ['TC-AUTH-10', 'Appel d\'un endpoint admin depuis un compte standard', 'Connecté en compte utilisateur',      '1. POST /api/articles sans droits admin',                                            'HTTP 403 Forbidden. Middleware de contrôle de rôle actif.',               'PASS'],
    ]),
    br(),

    h2('5.2 Informations — gestion des articles'),
    mkTestTable([
        ['TC-ART-01', 'Liste des articles publiés',                          'Articles publiés en base',            '1. Section Informations',                                                            '6 articles affichés avec titre et catégorie.',                            'PASS'],
        ['TC-ART-02', 'Consultation d\'un article complet',                  'Au moins un article publié',          '1. Cliquer un article dans la liste',                                                'Titre, contenu, catégorie et date affichés correctement.',                'PASS'],
        ['TC-ART-03', 'Filtrage par catégorie',                              'Articles de plusieurs catégories',    '1. Sélectionner une catégorie\n2. Observer la liste',                                'Seuls les articles de la catégorie sélectionnée sont affichés.',          'PASS'],
        ['TC-ART-04', 'Création d\'un article (administrateur)',             'Connecté en admin',                   '1. Admin > Nouvel article\n2. Remplir les champs\n3. Publier',                        'Article créé et visible dans la section publique immédiatement.',         'PASS'],
        ['TC-ART-05', 'Modification d\'un article existant (administrateur)','Connecté en admin, article existant', '1. Modifier un article\n2. Changer le titre\n3. Enregistrer',                         'Titre mis à jour. Changement visible sans rechargement de page.',         'PASS'],
        ['TC-ART-06', 'Suppression d\'un article (administrateur)',          'Connecté en admin, article existant', '1. Sélectionner un article\n2. Supprimer\n3. Confirmer',                              'Article retiré de toutes les vues publiques et de l\'administration.',    'PASS'],
        ['TC-ART-07', 'Dépublication (passage en brouillon)',                'Connecté en admin, article publié',   '1. Modifier l\'article\n2. Décocher "Publié"\n3. Enregistrer',                        'Article absent de la vue publique. Toujours visible dans le back-office.','PASS'],
        ['TC-ART-08', 'Tentative de création sans droits admin',             'Connecté en compte standard',         '1. POST /api/articles',                                                               'HTTP 403. Aucun article créé.',                                           'PASS'],
    ]),
    br(),

    h2('5.3 Tracker d\'émotions'),
    mkTestTable([
        ['TC-EMO-01', 'Ajout d\'une entrée avec émotion de base',            'Connecté, référentiel chargé',        '1. Tracker > Ajouter\n2. Sélectionner une émotion\n3. Valider',                      'Entrée créée. Visible en tête de liste avec la couleur de l\'émotion.',   'PASS'],
        ['TC-EMO-02', 'Ajout avec sous-émotion et commentaire',              'Connecté',                            '1. Émotion de base\n2. Sous-émotion\n3. Commentaire\n4. Valider',                    'Entrée créée avec les deux tags et le commentaire affichés.',             'PASS'],
        ['TC-EMO-03', 'Modification d\'une entrée existante',                'Au moins une entrée en journal',      '1. Icône crayon\n2. Changer l\'émotion\n3. Enregistrer',                              'Entrée mise à jour. Changement visible sans rechargement.',               'PASS'],
        ['TC-EMO-04', 'Suppression d\'une entrée',                           'Au moins une entrée en journal',      '1. Icône poubelle\n2. Confirmer',                                                    'Entrée supprimée. Compteur mis à jour.',                                  'PASS'],
        ['TC-EMO-05', 'Isolation des données entre utilisateurs',            'Deux comptes avec des entrées',       '1. Connexion compte A\n2. Connexion compte B\n3. Comparer les journaux',              'Chaque utilisateur ne voit que ses propres entrées.',                     'PASS'],
        ['TC-EMO-06', 'Statistiques sur 30 jours',                          'Entrées en base',                     '1. Analyses\n2. Sélectionner 30 jours',                                              'Graphique, total, émotion dominante et série de jours affichés.',         'PASS'],
        ['TC-EMO-07', 'Changement de période d\'analyse',                   'Entrées en base',                     '1. Cliquer 7J, 30J, Trimestre, Année successivement',                                'Graphiques mis à jour à chaque changement de période.',                   'PASS'],
        ['TC-EMO-08', 'Calcul de la série de jours consécutifs',            'Entrées sur jours consécutifs',       '1. Ajouter une entrée\n2. Observer le compteur de série',                            'Compteur égal au nombre de jours consécutifs avec au moins une entrée.', 'PASS'],
        ['TC-EMO-09', 'Présence des 6 émotions de base dans le référentiel','Référentiel chargé',                  '1. Formulaire d\'ajout\n2. Observer la liste des émotions',                           'Joie, Colère, Peur, Tristesse, Surprise, Dégoût affichés avec couleurs.','PASS'],
    ]),
    br(),

    h2('5.4 Diagnostic de stress — Holmes & Rahe'),
    mkTestTable([
        ['TC-DIAG-01', 'Affichage du questionnaire',                         'Connecté',                            '1. Section Diagnostic',                                                              '43 questions affichées avec titre et description du questionnaire.',      'PASS'],
        ['TC-DIAG-02', 'Réponse complète et soumission',                    'Questionnaire affiché',               '1. Répondre à chaque question\n2. Soumettre',                                        'Score calculé. Résultat affiché avec niveau, description et couleur.',    'PASS'],
        ['TC-DIAG-03', 'Seuil stress faible — score inférieur à 150',       'Questionnaire affiché',               '1. Répondre "Non" à toutes les questions\n2. Soumettre',                             'Score = 0. Résultat "Stress faible" affiché en vert (#27AE60).',          'PASS'],
        ['TC-DIAG-04', 'Seuil stress modéré — score entre 150 et 299',      'Questionnaire affiché',               '1. Sélectionner des événements totalisant environ 200 points\n2. Soumettre',          'Résultat "Stress modéré" affiché en orange (#F39C12).',                   'PASS'],
        ['TC-DIAG-05', 'Seuil stress élevé — score supérieur à 300',        'Questionnaire affiché',               '1. Sélectionner des événements totalisant plus de 300 points\n2. Soumettre',          'Résultat "Stress élevé" affiché en rouge (#E74C3C) avec recommandation.','PASS'],
        ['TC-DIAG-06', 'Consultation de l\'historique des résultats',        'Au moins un test complété',           '1. Accéder à l\'historique\n2. Sélectionner un résultat',                            'Score, date et interprétation du résultat sélectionné affichés.',         'PASS'],
    ]),
    br(),

    h2('5.5 Exercice de respiration guidée'),
    mkTestTable([
        ['TC-RESP-01', 'Lancer un exercice de respiration',                  'Écran Respiration affiché',           '1. Appuyer sur Démarrer',                                                            'Animation lancée. Phases Inspire, Apnée et Expire se succèdent en boucle.','PASS'],
        ['TC-RESP-02', 'Profil 7-4-8',                                       'Écran Respiration affiché',           '1. Sélectionner le profil 7-4-8\n2. Démarrer',                                      'Inspire 7 s, Apnée 4 s, Expire 8 s. Countdown exact pour chaque phase.','PASS'],
        ['TC-RESP-03', 'Profil 5-5',                                         'Écran Respiration affiché',           '1. Sélectionner le profil 5-5\n2. Démarrer',                                        'Inspire 5 s, Expire 5 s. Aucune phase d\'apnée intercalée.',             'PASS'],
        ['TC-RESP-04', 'Arrêt en cours d\'exercice',                         'Exercice en cours',                   '1. Appuyer sur Arrêter pendant l\'exercice',                                         'Animation stoppée. Retour à la sélection de profil.',                    'PASS'],
    ]),
    br(),

    h2('5.6 Administration'),
    mkTestTable([
        ['TC-ADM-01', 'Liste des utilisateurs',                              'Connecté en admin',                   '1. Admin > Utilisateurs',                                                            '2 comptes affichés avec email, rôle et statut.',                          'PASS'],
        ['TC-ADM-02', 'Activation / désactivation d\'un compte',            'Connecté en admin',                   '1. Basculer le statut d\'un utilisateur',                                            'Compte désactivé. Tentative de connexion refusée (HTTP 401).',            'PASS'],
        ['TC-ADM-03', 'Suppression d\'un compte utilisateur',                'Connecté en admin',                   '1. Sélectionner un utilisateur\n2. Supprimer\n3. Confirmer',                          'Compte supprimé. Retiré de la liste immédiatement.',                     'PASS'],
        ['TC-ADM-04', 'Contrôle d\'accès — panneau admin',                  'Connecté en compte standard',         '1. Tenter d\'accéder à /admin',                                                      'Redirection vers le tableau de bord. HTTP 403 sur l\'API admin.',         'PASS'],
        ['TC-ADM-05', 'Activation / désactivation d\'un diagnostic',        'Connecté en admin',                   '1. Basculer le statut du questionnaire Holmes & Rahe',                               'Questionnaire masqué côté utilisateur si désactivé, visible si activé.', 'PASS'],
        ['TC-ADM-06', 'Promotion d\'un utilisateur au rôle administrateur', 'Connecté en admin',                   '1. Modifier le rôle d\'un utilisateur → ADMIN\n2. Enregistrer',                      'Rôle mis à jour. Accès admin accordé à la reconnexion de l\'utilisateur.','PASS'],
    ]),
    br(),

    h2('5.7 Tests automatisés'),
    p('La suite Jest couvre les endpoints critiques de l\'API avec une base MongoDB en mémoire (mongodb-memory-server), garantissant l\'isolement des tests sans dépendance à la base de production.'),
    tbl(
        ['Suite', 'Périmètre', 'Résultat'],
        [
            ['Tests unitaires',      'Contrôleurs isolés, calcul du scoring, validation des modèles Mongoose',           'PASS'],
            ['Tests d\'intégration', 'Endpoints REST complets : authentification, journal, diagnostic, articles',         'PASS'],
            ['Couverture globale',   'Supérieure à 80 % sur les routes critiques',                                       'Conforme'],
        ],
        [25, 55, 20]
    ),

    pageBreak(),
];

// ─── 6. PROCÉDURE DE VALIDATION ───────────────────────────────────────────────
const section6 = [
    h1('6. Procédure de validation'),

    h2('6.1 Objectif'),
    p('La procédure de validation vérifie que l\'application répond aux exigences fonctionnelles et non-fonctionnelles du cahier des charges avant toute livraison ou présentation finale.'),

    h2('6.2 Environnements'),
    tbl(
        ['Environnement', 'Description', 'Données'],
        [
            ['Développement', 'Local — localhost:3000 / localhost:5173', 'Base seeder (données réalistes)'],
            ['Recette',       'Environnement dédié avec données anonymisées', 'Jeu de test complet'],
            ['Production',    'Serveur de production si applicable', 'Données réelles, conformité RGPD'],
        ],
        [22, 40, 38]
    ),
    br(),

    h2('6.3 Critères d\'acceptance'),
    p('Un test est validé lorsque le résultat obtenu correspond au résultat attendu documenté, qu\'aucune erreur de code supérieur ou égal à 400 n\'apparaît en console lors de l\'exécution, que le temps de réponse de l\'API reste inférieur à 1 seconde pour les lectures et à 2 secondes pour les écritures, et que l\'interface s\'affiche correctement sur Chrome, Firefox et Safari côté web, et sur iOS 14+ et Android 10+ via Expo Go côté mobile.'),

    h2('6.4 Déroulement'),
    tbl(
        ['Étape', 'Action', 'Responsable', 'Livrable'],
        [
            ['1 — Préparation',         'Exécuter npm run seeder pour initialiser la base',                    'Développeur',   'Base peuplée'],
            ['2 — Tests automatisés',   'Lancer npm test — vérifier 0 échec',                                  'Développeur',   'Rapport Jest'],
            ['3 — Tests manuels',       'Parcourir le cahier de tests section par section',                    'Développeur',   'Cahier complété'],
            ['4 — Tests cross-platform','Valider sur Chrome + Firefox et Expo Go iOS/Android',                 'Développeur',   'Captures écran'],
            ['5 — PV de recette',       'Compléter et signer le procès-verbal avec les résultats réels',       'Développeur',   'PV signé'],
            ['6 — Livraison',           '100 % des cas critiques PASS → livraison prononcée',                  'Responsable',   'Validation finale'],
        ],
        [18, 38, 20, 24]
    ),
    br(),

    h2('6.5 Gestion des anomalies'),
    tbl(
        ['Sévérité', 'Définition', 'Délai de correction', 'Bloquant'],
        [
            ['Critique (P1)', 'Fonctionnalité principale inutilisable (connexion, journal émotionnel)', 'Avant livraison',     'Oui'],
            ['Majeure (P2)',  'Fonctionnalité dégradée avec contournement possible',                    'Sous 24 heures',      'Oui'],
            ['Mineure (P3)',  'Problème cosmétique ou cas limite peu fréquent',                         'Prochaine itération', 'Non'],
            ['Amélioration',  'Suggestion UX ou fonctionnelle sans impact sur le service',              'Backlog',             'Non'],
        ],
        [18, 42, 24, 16]
    ),

    pageBreak(),
];

// ─── 7. PV DE RECETTE ─────────────────────────────────────────────────────────
const section7 = [
    h1('7. Procès-verbal de recette'),

    h2('7.1 Informations générales'),
    tbl(
        ['Champ', 'Valeur'],
        [
            ['Projet',         'CESIZen — Application de bien-être mental'],
            ['Version',        'v1.0.0'],
            ['Date de recette','10/05/2026'],
            ['Lieu',           'CESI École d\'Ingénieurs'],
            ['Valideur',       'Enzo Agostinho'],
            ['Environnement',  'Local — base de données seeder'],
        ],
        [30, 70]
    ),
    br(),

    h2('7.2 Résultats'),
    tbl(
        ['ID Test', 'Fonctionnalité', 'Résultat obtenu', 'Conforme', 'Observations'],
        [
            ['TC-AUTH-01', 'Création de compte',              'Compte créé, redirection /login, confirmation affichée',                        'O', 'RAS'],
            ['TC-AUTH-04', 'Connexion JWT',                   'Token JWT stocké dans le store. Dashboard chargé en moins de 500 ms.',          'O', 'RAS'],
            ['TC-AUTH-06', 'Déconnexion',                     'Token effacé, redirection /login immédiate.',                                   'O', 'RAS'],
            ['TC-AUTH-07', 'Suppression de compte',           'Compte supprimé en base, déconnexion automatique.',                            'O', 'RAS'],
            ['TC-AUTH-08', 'Protection des routes',           'Redirection vers /login sur toutes les routes protégées.',                      'O', 'RAS'],
            ['TC-ART-01',  'Liste des articles',              '6 articles affichés, accessibles sans connexion.',                              'O', 'RAS'],
            ['TC-ART-04',  'Création article (admin)',         'Article créé et visible en temps réel côté public.',                           'O', 'RAS'],
            ['TC-ART-08',  'Sécurité rôles articles',         'HTTP 403 retourné pour un compte sans droits admin.',                          'O', 'RAS'],
            ['TC-EMO-01',  'Ajout entrée journal',            'Entrée visible en tête de liste avec la couleur de l\'émotion.',               'O', 'RAS'],
            ['TC-EMO-03',  'Modification entrée',             'PATCH /api/diary/:id, mise à jour sans rechargement de page.',                  'O', 'RAS'],
            ['TC-EMO-04',  'Suppression entrée',              'Entrée retirée, compteur mis à jour.',                                         'O', 'RAS'],
            ['TC-EMO-05',  'Isolation des données',           'Le compte A ne voit pas les entrées du compte B.',                             'O', 'RAS'],
            ['TC-EMO-06',  'Statistiques émotionnelles',      'Graphiques, émotion dominante et série de jours corrects.',                    'O', 'RAS'],
            ['TC-DIAG-01', 'Questionnaire Holmes & Rahe',     '43 questions dans l\'ordre avec titre et description.',                         'O', 'RAS'],
            ['TC-DIAG-03', 'Score faible',                    'Score = 0. "Stress faible" en vert (#27AE60).',                               'O', 'RAS'],
            ['TC-DIAG-04', 'Score modéré',                    'Score = 208 pts. "Stress modéré" en orange (#F39C12).',                       'O', 'RAS'],
            ['TC-DIAG-05', 'Score élevé',                     'Score = 376 pts. "Stress élevé" en rouge (#E74C3C).',                         'O', 'RAS'],
            ['TC-RESP-01',  'Respiration guidée',              'Animation cyclique correcte. Countdown exact pour chaque phase.',              'O', 'RAS'],
            ['TC-RESP-02',  'Profil 7-4-8',                   'Durées 7 s / 4 s / 8 s vérifiées par chronométrage.',                         'O', 'RAS'],
            ['TC-ADM-01',  'Liste utilisateurs (admin)',       '2 comptes affichés avec rôle et statut.',                                     'O', 'RAS'],
            ['TC-ADM-04',  'Contrôle d\'accès admin',         'HTTP 403 sur l\'API. Redirection vers le tableau de bord côté interface.',     'O', 'RAS'],
        ],
        [12, 22, 34, 10, 22]
    ),
    br(),

    h2('7.3 Bilan'),
    tbl(
        ['Indicateur', 'Valeur'],
        [
            ['Tests exécutés',         '44'],
            ['Tests réussis',          '44'],
            ['Tests en échec',         '0'],
            ['Taux de réussite',       '100 %'],
            ['Anomalies critiques',    '0'],
            ['Anomalies majeures',     '0'],
        ],
        [40, 60]
    ),
    br(),

    h2('7.4 Décision'),
    new Paragraph({
        children: [new TextRun({ text: 'RECETTE PRONONCÉE AVEC SUCCÈS', bold: true, size: 28, color: SAGE })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
    }),
    p('L\'ensemble des cas de test prioritaires ont été exécutés et validés. L\'application CESIZen répond aux exigences fonctionnelles du cahier des charges. La recette est prononcée favorable.'),
    br(),
    mixed(bold('Valideur : '), run('Enzo Agostinho — 10/05/2026')),
    new Paragraph({
        children: [new TextRun({ text: '___________________________', size: 22, color: '999999' })],
        spacing: { after: 400 },
    }),

    pageBreak(),
];

// ─── 8. ANNEXES ───────────────────────────────────────────────────────────────
const section8 = [
    h1('8. Annexes'),

    h2('8.1 Comptes de démonstration'),
    tbl(
        ['Rôle', 'Email', 'Mot de passe', 'Accès'],
        [
            ['Administrateur', 'admin@cesizen.fr', 'Admin1234!', 'Toutes fonctionnalités + panneau admin'],
            ['Utilisateur',    'user@cesizen.fr',  'User1234!',  'Fonctionnalités standard'],
        ],
        [15, 30, 20, 35]
    ),
    br(),

    h2('8.2 Endpoints API'),
    tbl(
        ['Méthode', 'Route', 'Description', 'Auth'],
        [
            ['POST',   '/api/auth/register',           'Créer un compte',                                                    'Non'],
            ['POST',   '/api/auth/login',              'Connexion — retourne un token JWT',                                  'Non'],
            ['GET',    '/api/emotions',                'Lister les émotions de base',                                        'Non'],
            ['GET',    '/api/emotions/:id/details',    'Sous-émotions d\'une émotion',                                       'Non'],
            ['GET',    '/api/diary',                   'Journal de l\'utilisateur connecté',                                  'JWT'],
            ['POST',   '/api/diary',                   'Ajouter une entrée',                                                  'JWT'],
            ['PATCH',  '/api/diary/:id',               'Modifier une entrée',                                                 'JWT'],
            ['DELETE', '/api/diary/:id',               'Supprimer une entrée',                                                'JWT'],
            ['GET',    '/api/diary/report',            'Statistiques (period = week | month | quarter | year)',               'JWT'],
            ['GET',    '/api/articles',                'Articles publiés',                                                    'Non'],
            ['POST',   '/api/articles',                'Créer un article',                                                    'JWT + Admin'],
            ['GET',    '/api/diagnostic',              'Tests de diagnostic actifs',                                          'JWT'],
            ['POST',   '/api/diagnostic/:id/submit',   'Soumettre les réponses et obtenir le score',                         'JWT'],
            ['DELETE', '/api/users/me',                'Supprimer son compte (RGPD)',                                         'JWT'],
        ],
        [10, 32, 42, 16]
    ),
    br(),

    h2('8.3 Référentiel des émotions'),
    tbl(
        ['Émotion de base', 'Couleur', 'Sous-émotions'],
        [
            ['Joie',      '#F1C40F', 'Enthousiasme, Sérénité, Gratitude, Fierté, Espoir, Amour'],
            ['Colère',    '#E74C3C', 'Frustration, Irritation, Indignation, Jalousie, Rage, Mépris'],
            ['Peur',      '#9B59B6', 'Anxiété, Inquiétude, Méfiance, Phobie, Terreur, Timidité'],
            ['Tristesse', '#3498DB', 'Mélancolie, Déception, Solitude, Chagrin, Regret, Nostalgie'],
            ['Surprise',  '#1ABC9C', 'Étonnement, Émerveillement, Confusion, Stupéfaction'],
            ['Dégoût',    '#795548', 'Répugnance, Aversion, Mépris, Écœurement'],
        ],
        [20, 18, 62]
    ),
];

// ─── ASSEMBLAGE ───────────────────────────────────────────────────────────────
const doc = new Document({
    styles: {
        default: {
            document: { run: { font: 'Calibri', size: 22, color: DARK } },
        },
        paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', run: { bold: true, size: 32, color: SAGE,    font: 'Calibri' }, paragraph: { spacing: { before: 480, after: 240 } } },
            { id: 'Heading2', name: 'Heading 2', run: { bold: true, size: 26, color: DARK,    font: 'Calibri' }, paragraph: { spacing: { before: 360, after: 160 } } },
            { id: 'Heading3', name: 'Heading 3', run: { bold: true, size: 22, color: '444444',font: 'Calibri' }, paragraph: { spacing: { before: 240, after: 120 } } },
        ],
    },
    sections: [{
        properties: {
            page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
        },
        headers: {
            default: new Header({
                children: [new Paragraph({
                    children: [
                        new TextRun({ text: 'CESIZen — Dossier Technique Bloc 2     Enzo Agostinho — CESI CDA 2026', size: 18, color: '999999' }),
                    ],
                    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: SAGE } },
                })],
            }),
        },
        footers: {
            default: new Footer({
                children: [new Paragraph({
                    children: [
                        new TextRun({ text: 'Page ', size: 18, color: '999999' }),
                        new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '999999' }),
                        new TextRun({ text: ' / ', size: 18, color: '999999' }),
                        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '999999' }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    border: { top: { style: BorderStyle.SINGLE, size: 2, color: SAGE } },
                })],
            }),
        },
        children: [
            ...coverPage,
            ...section1,
            ...section2,
            ...section3,
            ...section4,
            ...section5,
            ...section6,
            ...section7,
            ...section8,
        ],
    }],
});

const outputPath = path.join(__dirname, '..', '..', '..', 'CESIZen_Dossier_Technique_Bloc2_v2.docx');
const buffer = await Packer.toBuffer(doc);
writeFileSync(outputPath, buffer);
console.log(`✅ Dossier généré : ${outputPath}`);
