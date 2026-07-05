import PptxGenJS from 'pptxgenjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prs = new PptxGenJS();

// ─── PALETTE OFFICIELLE CESIZEN ───────────────────────────────────────────────
const SKY    = 'AEC6CF';  // bleu principal
const SAGE   = '8BA889';  // vert — accent uniquement
const CREAM  = 'F9F7F2';  // fond
const DARK   = '2D3436';  // texte
const WHITE  = 'FFFFFF';
const ERROR  = 'E74C3C';  // rouge erreur

// Nuances dérivées pour ne pas tout mettre en SKY
const SKY_DARK   = '7AAAB5';  // sky plus sombre (hover/accent)
const SKY_LIGHT  = 'D6E8ED';  // sky très clair (fond carte)
const SLATE      = '5D7E87';  // bleu-gris profond (headers)
const WARM       = 'C4956A';  // brun chaud (variation)
const MUTED      = 'B2BEC3';  // gris neutre
const DARK_CARD  = '353B48';  // fonds sombres

// Coordonnées en cm — on définit un layout custom pour que pptxgenjs
// utilise le même espace de coordonnées (33.87 × 19.05 unités = 16:9)
prs.defineLayout({ name: 'WIDE_CM', width: 33.87, height: 19.05 });
prs.layout  = 'WIDE_CM';
prs.author  = 'Enzo Agostinho';
prs.company = 'CESI École d\'Ingénieurs';
prs.subject = 'CESIZen — Dossier Technique Bloc 2';

const W = 33.87;
const H = 19.05;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const addBg = (slide, color = CREAM) =>
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color } });

function addHeader(slide, label) {
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.6, fill: { color: SLATE } });
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 1.6, w: W, h: 0.1, fill: { color: SKY } });
    slide.addText(label, {
        x: 0.6, y: 0, w: W - 1.2, h: 1.6,
        fontSize: 22, bold: true, color: WHITE, valign: 'middle',
    });
}

function addFooter(slide, num) {
    slide.addShape(prs.ShapeType.rect, { x: 0, y: H - 0.65, w: W, h: 0.65, fill: { color: DARK } });
    slide.addText('CESIZen — Enzo Agostinho — CESI CDA 2026', {
        x: 0.5, y: H - 0.65, w: W - 2, h: 0.65,
        fontSize: 9, color: MUTED, valign: 'middle',
    });
    if (num) slide.addText(String(num), {
        x: W - 1.5, y: H - 0.65, w: 1, h: 0.65,
        fontSize: 9, color: MUTED, align: 'right', valign: 'middle',
    });
}

function card(slide, x, y, w, h, title, body, accent = SKY) {
    slide.addShape(prs.ShapeType.rect, {
        x, y, w, h,
        fill: { color: WHITE },
        shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.09 },
    });
    slide.addShape(prs.ShapeType.rect, { x, y, w, h: 0.14, fill: { color: accent } });
    slide.addText(title, { x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 0.65, fontSize: 13, bold: true, color: DARK });
    slide.addText(body,  { x: x + 0.3, y: y + 1,    w: w - 0.6, h: h - 1.2, fontSize: 10.5, color: '4A5568', valign: 'top', wrap: true });
}

function pill(slide, x, y, w, label, color = SKY) {
    slide.addShape(prs.ShapeType.roundRect, { x, y, w, h: 0.55, fill: { color }, rectRadius: 0.1 });
    slide.addText(label, { x, y, w, h: 0.55, fontSize: 11, color: WHITE, align: 'center', valign: 'middle', bold: true });
}

// ─── SLIDE 1 : COUVERTURE ────────────────────────────────────────────────────
{
    const s = prs.addSlide();

    // Fond deux tons
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: DARK } });
    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W * 0.52, h: H, fill: { color: SLATE } });

    // Cercle décoratif
    s.addShape(prs.ShapeType.ellipse, { x: W * 0.52 - 5, y: -5, w: 12, h: 12, fill: { color: SKY }, opacity: 0.12 });
    s.addShape(prs.ShapeType.ellipse, { x: W * 0.52 - 2, y: H - 4, w: 6, h: 6, fill: { color: SKY }, opacity: 0.08 });

    // Ligne verticale séparatrice
    s.addShape(prs.ShapeType.rect, { x: W * 0.52, y: 0, w: 0.1, h: H, fill: { color: SKY } });

    // Titre
    s.addText('CESIZen', {
        x: 1.5, y: 2.5, w: 15, h: 3.5,
        fontSize: 68, bold: true, color: WHITE,
    });
    s.addShape(prs.ShapeType.rect, { x: 1.5, y: 6.2, w: 5, h: 0.1, fill: { color: SKY } });
    s.addText('Application de bien-être mental', {
        x: 1.5, y: 6.5, w: 16, h: 1,
        fontSize: 18, color: SKY_LIGHT,
    });
    s.addText('Dossier Technique — Bloc 2\nConcepteur Développeur d\'Applications', {
        x: 1.5, y: 7.8, w: 16, h: 1.8,
        fontSize: 13, color: MUTED,
    });

    // Infos auteur
    s.addText('Enzo Agostinho', { x: 1.5, y: 13.5, w: 16, h: 0.9, fontSize: 18, bold: true, color: WHITE });
    s.addText('CESI École d\'Ingénieurs  ·  CDA 2024/2026  ·  Mai 2026', {
        x: 1.5, y: 14.5, w: 16, h: 0.7, fontSize: 11, color: MUTED,
    });

    // Tags stack (partie droite)
    s.addText('Stack technique', { x: 20, y: 5, w: 13, h: 0.8, fontSize: 14, bold: true, color: MUTED, align: 'center' });
    const tags = [
        ['Node.js + Express',  SKY_DARK],
        ['MongoDB + Mongoose', SLATE],
        ['React 19 + Vite',    SKY_DARK],
        ['React Native + Expo',SLATE],
        ['TypeScript',         SKY_DARK],
        ['Jest + Supertest',   SLATE],
    ];
    tags.forEach(([t, c], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        s.addShape(prs.ShapeType.roundRect, {
            x: 20 + col * 6.5, y: 6.2 + row * 2,
            w: 6, h: 1.5,
            fill: { color: c }, rectRadius: 0.15,
        });
        s.addText(t, {
            x: 20 + col * 6.5, y: 6.2 + row * 2,
            w: 6, h: 1.5,
            fontSize: 11, color: WHITE, align: 'center', valign: 'middle', bold: true,
        });
    });
}

// ─── SLIDE 2 : SOMMAIRE ───────────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, 'Sommaire');
    addFooter(s, 2);

    const items = [
        ['01', 'Présentation du projet',        SKY],
        ['02', 'Comparaison des architectures', SLATE],
        ['03', 'Modèle de données MongoDB',      SKY_DARK],
        ['04', 'Fonctionnalités clés',           DARK],
        ['05', 'Guide d\'installation',          SLATE],
        ['06', 'Stratégie de tests',             ERROR],
        ['07', 'Accessibilité & Mobile First',   SKY_DARK],
        ['08', 'Conclusion',                     DARK],
    ];

    items.forEach(([num, label, color], i) => {
        const col = i < 4 ? 0 : 1;
        const row = i % 4;
        const x = 1.5 + col * 16;
        const y = 2.4 + row * 3.6;

        s.addShape(prs.ShapeType.rect, {
            x, y, w: 15, h: 3.2,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.07 },
        });
        s.addShape(prs.ShapeType.rect, { x, y, w: 0.12, h: 3.2, fill: { color } });
        s.addText(num, { x: x + 0.4, y, w: 2, h: 3.2, fontSize: 26, bold: true, color, valign: 'middle' });
        s.addText(label, { x: x + 2.6, y, w: 12, h: 3.2, fontSize: 14, color: DARK, valign: 'middle' });
    });
}

// ─── SLIDE 3 : PRÉSENTATION ───────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '01 — Présentation du projet');
    addFooter(s, 3);

    s.addText('Application web et mobile de bien-être mental — Bloc 2 CDA, CESI École d\'Ingénieurs.', {
        x: 1, y: 1.9, w: 31, h: 0.8,
        fontSize: 12, color: '5D6D7E', italic: true,
    });

    const modules = [
        { icon: '📔', title: 'Journal émotionnel',  desc: '6 émotions · 35 sous-émotions\nStatistiques · Streak',      accent: SKY },
        { icon: '🫁', title: 'Respiration guidée',  desc: 'Profils 7-4-8, 5-5, 4-6\nAnimation + minuteur',            accent: SAGE },
        { icon: '🧠', title: 'Diagnostic de stress',desc: 'Échelle Holmes & Rahe\n43 questions · 3 seuils',             accent: SLATE },
        { icon: '📰', title: 'Articles',            desc: 'Consultation publique\nGestion admin CRUD',                  accent: WARM },
        { icon: '🔐', title: 'Authentification',    desc: 'JWT · Rôles ADMIN/USER\nSuppression RGPD',                  accent: DARK },
        { icon: '⚙️', title: 'Administration',      desc: 'Utilisateurs · Contenu\nDiagnostic · Émotions',             accent: SKY_DARK },
    ];

    modules.forEach((m, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.7 + col * 11;
        const y = 3.1 + row * 7.5;
        const w = 10.6;
        const h = 7;

        s.addShape(prs.ShapeType.rect, {
            x, y, w, h,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 5, offset: 2, angle: 45, color: '000000', opacity: 0.07 },
        });
        s.addShape(prs.ShapeType.rect, { x, y, w, h: 0.12, fill: { color: m.accent } });

        s.addText(m.icon, { x, y: y + 0.3, w, h: 1.5, fontSize: 26, align: 'center' });
        s.addText(m.title, { x: x + 0.3, y: y + 2,   w: w - 0.6, h: 1,   fontSize: 13, bold: true, color: DARK, align: 'center' });
        s.addText(m.desc,  { x: x + 0.3, y: y + 3.2, w: w - 0.6, h: 3.5, fontSize: 10.5, color: '5D6D7E', align: 'center', valign: 'top' });
    });
}

// ─── SLIDE 4 : COMPARAISON ARCHITECTURES ─────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '02 — Comparaison des architectures logicielles');
    addFooter(s, 4);

    const archs = [
        {
            title: 'Monolithique',
            note: 'Non retenu',
            accent: MUTED,
            bg: WHITE,
            pros: ['Démarrage rapide', 'Logs centralisés', 'Déploiement simple'],
            cons: ['Scalabilité verticale uniquement', 'Maintenance dégradée avec la taille', 'SPOF — panne = tout arrêté'],
            score: '2 / 5',
        },
        {
            title: 'N-tiers / MVC',
            note: 'Choix retenu ✓',
            accent: SKY,
            bg: SKY_LIGHT,
            pros: ['1 API REST → 2 clients (web + mobile)', 'TypeScript end-to-end', 'Backend stateless JWT', 'Testabilité couche par couche'],
            cons: ['3 dépôts à synchroniser', 'Scalabilité globale au backend'],
            score: '5 / 5',
        },
        {
            title: 'Microservices',
            note: 'Non retenu',
            accent: MUTED,
            bg: WHITE,
            pros: ['Scalabilité par service', 'Déploiements indépendants', 'Isolation des pannes'],
            cons: ['Kubernetes requis', 'Tracing distribué nécessaire', 'Sur-dimensionné pour ce projet'],
            score: '3 / 5',
        },
    ];

    archs.forEach((a, i) => {
        const x = 0.6 + i * 11.1;
        const w = 10.7;
        const y = 1.9;

        s.addShape(prs.ShapeType.rect, {
            x, y, w, h: 16.3,
            fill: { color: a.bg },
            shadow: { type: 'outer', blur: a.accent === SKY ? 10 : 3, offset: a.accent === SKY ? 3 : 1, angle: 45, color: '000000', opacity: a.accent === SKY ? 0.14 : 0.06 },
        });
        s.addShape(prs.ShapeType.rect, { x, y, w, h: 0.14, fill: { color: a.accent } });

        s.addText(a.title, { x: x + 0.3, y: y + 0.3, w: w - 0.6, h: 1, fontSize: 17, bold: true, color: a.accent === SKY ? SLATE : MUTED });

        s.addShape(prs.ShapeType.roundRect, { x: x + 0.3, y: y + 1.4, w: w - 0.6, h: 0.65, fill: { color: a.accent === SKY ? SKY : 'EEEEEE' }, rectRadius: 0.09 });
        s.addText(a.note, { x: x + 0.3, y: y + 1.4, w: w - 0.6, h: 0.65, fontSize: 11, color: a.accent === SKY ? WHITE : '999999', bold: a.accent === SKY, align: 'center', valign: 'middle' });

        s.addText('Points forts', { x: x + 0.3, y: y + 2.35, w: w - 0.6, h: 0.55, fontSize: 11, bold: true, color: SAGE });
        a.pros.forEach((p, pi) => {
            s.addText(`+ ${p}`, { x: x + 0.3, y: y + 3 + pi * 1.45, w: w - 0.6, h: 1.35, fontSize: 10, color: DARK, wrap: true });
        });

        const cy = y + 3 + a.pros.length * 1.45 + 0.4;
        s.addText('Limites', { x: x + 0.3, y: cy, w: w - 0.6, h: 0.55, fontSize: 11, bold: true, color: ERROR });
        a.cons.forEach((c, ci) => {
            s.addText(`− ${c}`, { x: x + 0.3, y: cy + 0.6 + ci * 1.45, w: w - 0.6, h: 1.35, fontSize: 10, color: '7F8C8D', wrap: true });
        });

        s.addShape(prs.ShapeType.rect, { x: x + 0.3, y: y + 15.3, w: w - 0.6, h: 0.8, fill: { color: a.accent === SKY ? SKY_LIGHT : CREAM } });
        s.addText(`Score : ${a.score}`, { x: x + 0.3, y: y + 15.3, w: w - 0.6, h: 0.8, fontSize: 13, bold: true, color: a.accent === SKY ? SLATE : MUTED, align: 'center', valign: 'middle' });
    });
}

// ─── SLIDE 5 : ARCHITECTURE CESIZEN ──────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '02 — Architecture retenue : N-tiers / MVC');
    addFooter(s, 5);

    const layers = [
        { label: 'Présentation',    sub: 'React 19 (Web)  ·  React Native + Expo (Mobile)',               color: SKY,      x: 0.7,  w: 21 },
        { label: 'Logique métier',  sub: 'Node.js · Express 5 · TypeScript · JWT · Middlewares',           color: SLATE,    x: 3,    w: 16.5 },
        { label: 'Données',         sub: 'MongoDB 7 · Mongoose ODM · 8 collections',                       color: SKY_DARK, x: 5.3,  w: 12 },
    ];

    layers.forEach((l, i) => {
        const y = 2.2 + i * 4.5;
        s.addShape(prs.ShapeType.rect, {
            x: l.x, y, w: l.w, h: 3.5,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 5, offset: 2, angle: 45, color: '000000', opacity: 0.09 },
        });
        s.addShape(prs.ShapeType.rect, { x: l.x, y, w: 0.15, h: 3.5, fill: { color: l.color } });
        s.addText(l.label, { x: l.x + 0.5, y: y + 0.5, w: l.w - 1, h: 0.9, fontSize: 16, bold: true, color: l.color });
        s.addText(l.sub,   { x: l.x + 0.5, y: y + 1.5, w: l.w - 1, h: 1.6, fontSize: 12, color: '5D6D7E' });
        if (i < 2) s.addText('↕  HTTP REST / JSON', {
            x: l.x + l.w / 2 - 3, y: y + 3.5, w: 6, h: 0.9,
            fontSize: 10, color: MUTED, align: 'center', italic: true,
        });
    });

    // Colonne droite
    s.addText('Pourquoi ce choix ?', { x: 23, y: 2.2, w: 10.4, h: 0.8, fontSize: 15, bold: true, color: SLATE });
    const reasons = [
        '1 API REST consommée par 2 clients distincts sans duplication de logique',
        'Stack TypeScript unifiée — contrats de types partagés entre couches',
        'Backend stateless JWT — scalabilité horizontale sans refactoring',
        'Testabilité couche par couche via Jest, Supertest et mongodb-memory-server',
    ];
    reasons.forEach((r, i) => {
        s.addShape(prs.ShapeType.rect, {
            x: 23, y: 3.3 + i * 3.5, w: 10.4, h: 3,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 3, offset: 1, angle: 45, color: '000000', opacity: 0.07 },
        });
        s.addShape(prs.ShapeType.rect, { x: 23, y: 3.3 + i * 3.5, w: 0.12, h: 3, fill: { color: SKY } });
        s.addText(r, { x: 23.3, y: 3.3 + i * 3.5, w: 9.9, h: 3, fontSize: 10.5, color: DARK, valign: 'middle', wrap: true });
    });
}

// ─── SLIDE 6 : MODÈLE DE DONNÉES ─────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '03 — Modèle de données MongoDB');
    addFooter(s, 6);

    const entities = [
        { name: 'users',               fields: ['email, password (bcrypt)', 'firstname, lastname', 'role: ADMIN | USER', 'isActive: Boolean'],                         color: SLATE,    x: 0.5,  y: 2,   w: 7.8 },
        { name: 'emotions',            fields: ['name: String', 'color: String (hex)'],                                                                                 color: SKY,      x: 9.3,  y: 2,   w: 7.8 },
        { name: 'emotiondetails',      fields: ['name: String', 'emotion: ref → emotions'],                                                                             color: SKY_DARK, x: 18.1, y: 2,   w: 7.8 },
        { name: 'diaryentries',        fields: ['user: ref → users', 'baseEmotion: ref → emotions', 'emotionDetail: ref → emotiondetails', 'comment, date'],            color: WARM,     x: 0.5,  y: 9.5, w: 10.5 },
        { name: 'articles',            fields: ['title, content, category', 'author: ref → users', 'isPublished: Boolean'],                                             color: DARK,     x: 12,   y: 9.5, w: 10.5 },
        { name: 'diagnostictests',     fields: ['title, description', 'isActive: Boolean', 'rules: [{ minScore, maxScore, title, color }]'],                            color: ERROR,    x: 0.5,  y: 15.5,w: 10.5 },
        { name: 'diagnosticquestions', fields: ['test: ref → diagnostictests', 'text, order', 'answers: [{ label, points }]'],                                          color: SLATE,    x: 12,   y: 15.5,w: 10.5 },
        { name: 'diagnosticresults',   fields: ['user: ref → users', 'test: ref → diagnostictests', 'score: Number', 'matchedRule, completedAt'],                       color: SKY_DARK, x: 23.5, y: 9.5, w: 9.8 },
    ];

    entities.forEach(e => {
        const nbFields = e.fields.length;
        const cardH = nbFields * 1.1 + 1.2;
        s.addShape(prs.ShapeType.rect, {
            x: e.x, y: e.y, w: e.w, h: cardH,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.09 },
        });
        s.addShape(prs.ShapeType.rect, { x: e.x, y: e.y, w: e.w, h: 0.72, fill: { color: e.color } });
        s.addText(e.name, { x: e.x + 0.15, y: e.y, w: e.w - 0.3, h: 0.72, fontSize: 11, bold: true, color: WHITE, valign: 'middle' });
        e.fields.forEach((f, fi) => {
            s.addText(f, { x: e.x + 0.25, y: e.y + 0.82 + fi * 1.1, w: e.w - 0.5, h: 1, fontSize: 9, color: '444444', font: 'Courier New' });
        });
    });

    // Légende relations
    s.addShape(prs.ShapeType.roundRect, { x: 26.5, y: 2, w: 7, h: 3, fill: { color: SKY_LIGHT }, rectRadius: 0.12 });
    s.addText('Légende', { x: 26.5, y: 2.1, w: 7, h: 0.7, fontSize: 11, bold: true, color: SLATE, align: 'center' });
    s.addText('ref →  référence ObjectId\n(clé étrangère MongoDB)', { x: 26.7, y: 2.9, w: 6.6, h: 1.8, fontSize: 9.5, color: DARK, font: 'Courier New', wrap: true });
}

// ─── SLIDE 7 : FONCTIONNALITÉS ────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '04 — Fonctionnalités clés');
    addFooter(s, 7);

    card(s, 0.5, 1.9, 16, 8,
        '📔 Journal émotionnel',
        'Ajout, modification et suppression d\'entrées avec un référentiel à deux niveaux (6 émotions de base, 35 sous-émotions). Chaque entrée peut inclure un commentaire libre.\n\nStatistiques filtrables sur 4 périodes — pie chart, bar chart, émotion dominante et série de jours consécutifs.\n\nIsolation stricte : un compte ne peut pas accéder aux entrées d\'un autre.',
        SKY
    );
    card(s, 17.5, 1.9, 15.9, 8,
        '🧠 Diagnostic Holmes & Rahe',
        '43 événements de vie avec leurs points. Score calculé automatiquement.\n\nTrois seuils de résultat :\n• Stress faible — score < 150\n• Stress modéré — 150 à 299\n• Stress élevé — ≥ 300\n\nDescription et recommandations adaptées à chaque seuil. Historique des résultats consultable.',
        ERROR
    );
    card(s, 0.5, 10.3, 16, 8,
        '🫁 Respiration guidée',
        'Trois profils sélectionnables :\n• 7-4-8 : technique anti-stress (inspire 7 s, apnée 4 s, expire 8 s)\n• 5-5 : respiration équilibrée (5 s / 5 s)\n• 4-6 : relaxation (4 s / 6 s)\n\nAnimation React Native Animated avec countdown par phase. Arrêt propre au démontage du composant.',
        SAGE
    );
    card(s, 17.5, 10.3, 15.9, 8,
        '🔐 Authentification & Sécurité',
        'JWT stateless — token signé côté serveur, vérifié à chaque requête. Aucune session serveur à maintenir.\n\nMots de passe hashés avec bcryptjs. Middleware requireAdmin sur toutes les routes sensibles.\n\nSuppression de compte conforme RGPD disponible depuis l\'écran Profil.',
        SLATE
    );
}

// ─── SLIDE 8 : INSTALLATION ───────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '05 — Guide d\'installation — 3 dépôts indépendants');
    addFooter(s, 8);

    const repos = [
        {
            name: 'cesizen-backend',
            color: SLATE,
            steps: [
                'git clone <repo-backend>',
                'npm install',
                'Créer .env\n(MONGO_URI, JWT_SECRET, PORT=3000)',
                'npm run seeder',
                'npm run dev  →  API :3000',
            ],
        },
        {
            name: 'cesizen-frontend',
            color: SKY,
            steps: [
                'git clone <repo-frontend>',
                'npm install',
                'Créer .env\n(VITE_API_URL=:3000/api)',
                'npm run dev  →  Web :5173',
            ],
        },
        {
            name: 'cesizen-mobile',
            color: SKY_DARK,
            steps: [
                'git clone <repo-mobile>',
                'npm install',
                'Éditer api/api.ts\n→ baseURL = IP locale',
                'npx expo start\n→ Scanner QR avec Expo Go',
            ],
        },
    ];

    repos.forEach((r, i) => {
        const x = 0.5 + i * 11.1;
        const w = 10.6;

        s.addShape(prs.ShapeType.rect, {
            x, y: 1.9, w, h: 15.1,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.08 },
        });
        s.addShape(prs.ShapeType.rect, { x, y: 1.9, w, h: 0.12, fill: { color: r.color } });

        s.addShape(prs.ShapeType.roundRect, { x: x + 0.3, y: 2.1, w: w - 0.6, h: 0.9, fill: { color: r.color }, rectRadius: 0.1 });
        s.addText(r.name, { x: x + 0.3, y: 2.1, w: w - 0.6, h: 0.9, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });

        r.steps.forEach((step, si) => {
            s.addShape(prs.ShapeType.rect, {
                x: x + 0.3, y: 3.3 + si * 2.5, w: w - 0.6, h: 2.2,
                fill: { color: CREAM },
            });
            s.addShape(prs.ShapeType.roundRect, {
                x: x + 0.3, y: 3.3 + si * 2.5, w: 0.65, h: 2.2,
                fill: { color: r.color }, rectRadius: 0.05,
            });
            s.addText(String(si + 1), { x: x + 0.3, y: 3.3 + si * 2.5, w: 0.65, h: 2.2, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle' });
            s.addText(step, { x: x + 1.1, y: 3.3 + si * 2.5, w: w - 1.4, h: 2.2, fontSize: 10, color: DARK, valign: 'middle', font: 'Courier New', wrap: true });
        });
    });

    // Ordre de démarrage
    s.addShape(prs.ShapeType.rect, { x: 0.5, y: 16.2, w: 32.9, h: 1.8, fill: { color: SKY_LIGHT } });
    s.addShape(prs.ShapeType.rect, { x: 0.5, y: 16.2, w: 0.12, h: 1.8, fill: { color: SKY } });
    s.addText('Ordre recommandé :  1. seeder  →  2. backend (:3000)  →  3. frontend (:5173)  →  4. mobile (Expo Go)', {
        x: 0.9, y: 16.2, w: 32, h: 1.8,
        fontSize: 12, color: SLATE, valign: 'middle', bold: true,
    });
}

// ─── SLIDE 9 : TESTS ──────────────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '06 — Stratégie de tests');
    addFooter(s, 9);

    const counters = [
        { val: '44',    label: 'Tests exécutés',      color: SKY   },
        { val: '100%',  label: 'Taux de réussite',    color: SAGE  },
        { val: '> 80%', label: 'Couverture routes',   color: SLATE },
        { val: '0',     label: 'Anomalies critiques', color: ERROR },
    ];
    counters.forEach((c, i) => {
        const x = 0.5 + i * 8.3;
        s.addShape(prs.ShapeType.rect, {
            x, y: 1.9, w: 7.9, h: 4.5,
            fill: { color: WHITE },
            shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.08 },
        });
        s.addShape(prs.ShapeType.rect, { x, y: 1.9, w: 7.9, h: 0.12, fill: { color: c.color } });
        s.addText(c.val,   { x, y: 2.2, w: 7.9, h: 2.3, fontSize: 44, bold: true, color: c.color, align: 'center' });
        s.addText(c.label, { x, y: 4.7, w: 7.9, h: 0.7, fontSize: 12, color: '5D6D7E', align: 'center' });
    });

    const modules = [
        ['Auth & Comptes',     '10', SKY],
        ['Articles',           '8',  SLATE],
        ['Tracker émotions',   '9',  SKY_DARK],
        ['Diagnostic stress',  '6',  ERROR],
        ['Respiration',        '4',  SAGE],
        ['Administration',     '7',  DARK],
    ];
    s.addText('Répartition par module', { x: 0.5, y: 7.1, w: 20, h: 0.8, fontSize: 14, bold: true, color: DARK });
    modules.forEach((m, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.5 + col * 11;
        const y = 8.1 + row * 4.4;
        s.addShape(prs.ShapeType.rect, { x, y, w: 10.5, h: 3.9, fill: { color: WHITE } });
        s.addShape(prs.ShapeType.rect, { x, y, w: 0.12, h: 3.9, fill: { color: m[2] } });
        s.addText(m[0], { x: x + 0.4, y, w: 7.5, h: 3.9, fontSize: 12, color: DARK, valign: 'middle' });
        s.addShape(prs.ShapeType.roundRect, { x: x + 7.8, y: y + 0.7, w: 2.3, h: 2.5, fill: { color: m[2] }, rectRadius: 0.1 });
        s.addText(m[1], { x: x + 7.8, y: y + 0.7, w: 2.3, h: 2.5, fontSize: 22, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    });

    s.addText('Types de tests', { x: 23.5, y: 7.1, w: 10, h: 0.8, fontSize: 14, bold: true, color: DARK });
    const jestItems = [
        ['Unitaires',      'Contrôleurs isolés, modèles Mongoose, scoring', SKY],
        ['Intégration',    'Endpoints REST complets — MongoDB in-memory',    SLATE],
        ['Couverture',     'Supérieure à 80 % sur les routes critiques',     SKY_DARK],
    ];
    jestItems.forEach((j, i) => {
        s.addShape(prs.ShapeType.rect, { x: 23.5, y: 8.1 + i * 4, w: 10, h: 3.5, fill: { color: WHITE } });
        s.addShape(prs.ShapeType.rect, { x: 23.5, y: 8.1 + i * 4, w: 0.12, h: 3.5, fill: { color: j[2] } });
        s.addText(j[0], { x: 23.8, y: 8.1  + i * 4, w: 9.5, h: 1.3, fontSize: 12, bold: true, color: j[2], valign: 'bottom' });
        s.addText(j[1], { x: 23.8, y: 9.4  + i * 4, w: 9.5, h: 2,   fontSize: 10, color: '5D6D7E', valign: 'top', wrap: true });
    });
}

// ─── SLIDE 10 : ACCESSIBILITÉ ─────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, CREAM);
    addHeader(s, '07 — Accessibilité & Mobile First');
    addFooter(s, 10);

    card(s, 0.5, 1.9, 16, 8.5,
        '📱 Mobile First',
        'Styles de base ciblant les petits écrans (320 px). Les breakpoints TailwindCSS sm / md / lg étendent progressivement la mise en page vers les grands écrans (jusqu\'à 1440 px).\n\nSur mobile natif, une seule base de code TypeScript (React Native) génère des composants natifs iOS et Android.',
        SKY
    );
    card(s, 17.5, 1.9, 15.9, 8.5,
        '♿ Accessibilité RGAA',
        'Critères appliqués :\n• 3.2 — Contraste ≥ 4,5:1 sur le corps de texte\n• 11.1 — Labels associés à chaque champ de formulaire\n• 4.1 — Focus clavier visible sur tous les éléments interactifs\n\nSur mobile : composants Expo exposent leurs rôles à VoiceOver (iOS) et TalkBack (Android). Scaling de la police système respecté.',
        SLATE
    );

    const criteria = [
        ['Contraste texte',       'Ratio ≥ 4,5:1',           'Respecté'],
        ['Labels formulaires',    'aria-label / <label>',    'Respecté'],
        ['Navigation clavier',    'Focus visible',            'Respecté'],
        ['Mobile First',          'Breakpoints sm/md/lg',    'Respecté'],
        ['Responsive',            '320 px → 1440 px',        'Respecté'],
        ['Accessibilité mobile',  'VoiceOver / TalkBack',    'Respecté'],
    ];
    s.addShape(prs.ShapeType.rect, { x: 0.5, y: 10.7, w: 32.9, h: 0.85, fill: { color: SLATE } });
    ['Critère RGAA', 'Implémentation', 'Statut'].forEach((h, i) =>
        s.addText(h, { x: 0.5 + i * 11, y: 10.7, w: 11, h: 0.85, fontSize: 11, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    );
    criteria.forEach((row, ri) => {
        s.addShape(prs.ShapeType.rect, { x: 0.5, y: 11.55 + ri * 1.2, w: 32.9, h: 1.2, fill: { color: ri % 2 === 0 ? WHITE : SKY_LIGHT } });
        row.forEach((cell, ci) => s.addText(cell, {
            x: 0.5 + ci * 11, y: 11.55 + ri * 1.2, w: 11, h: 1.2,
            fontSize: 10.5, color: ci === 2 ? SAGE : DARK,
            bold: ci === 2, align: ci === 2 ? 'center' : 'left',
            valign: 'middle', indent: ci === 0 ? 0.3 : 0,
        }));
    });
}

// ─── SLIDE 11 : CONCLUSION ────────────────────────────────────────────────────
{
    const s = prs.addSlide();
    addBg(s, DARK);

    s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W, h: H * 0.45, fill: { color: SLATE } });
    s.addShape(prs.ShapeType.rect, { x: 0, y: H * 0.45, w: W, h: 0.12, fill: { color: SKY } });

    s.addShape(prs.ShapeType.ellipse, { x: -3, y: -3, w: 10, h: 10, fill: { color: SKY }, opacity: 0.08 });
    s.addShape(prs.ShapeType.ellipse, { x: W - 7, y: H - 5, w: 10, h: 10, fill: { color: SKY }, opacity: 0.06 });

    s.addText('CESIZen', { x: 1.5, y: 1.2, w: W - 3, h: 3.5, fontSize: 68, bold: true, color: WHITE, align: 'center' });
    s.addText('Merci pour votre attention', { x: 1.5, y: 4.8, w: W - 3, h: 1.2, fontSize: 20, color: SKY_LIGHT, align: 'center' });
    s.addShape(prs.ShapeType.rect, { x: W / 2 - 4, y: 6.2, w: 8, h: 0.1, fill: { color: SKY } });

    const bilan = [
        ['Architecture N-tiers MVC',        '1 API → web + mobile'],
        ['Stack TypeScript unifiée',         'Backend · Frontend · Mobile'],
        ['44 tests — 100 % de réussite',    'Unitaires + Intégration Jest'],
        ['Conformité RGPD',                  'Suppression de compte native'],
        ['Accessibilité RGAA',               'Mobile First + VoiceOver/TalkBack'],
    ];
    bilan.forEach((b, i) => {
        s.addShape(prs.ShapeType.rect, { x: 3, y: 7.3 + i * 1.85, w: 28, h: 1.6, fill: { color: DARK_CARD } });
        s.addShape(prs.ShapeType.rect, { x: 3, y: 7.3 + i * 1.85, w: 0.12, h: 1.6, fill: { color: SKY } });
        s.addText(b[0], { x: 3.4,  y: 7.3 + i * 1.85, w: 13.5, h: 1.6, fontSize: 12, bold: true, color: WHITE,     valign: 'middle' });
        s.addText(b[1], { x: 17.2, y: 7.3 + i * 1.85, w: 13.5, h: 1.6, fontSize: 11, color: SKY_LIGHT, valign: 'middle' });
    });

    s.addText('Questions ?', { x: 1.5, y: H - 2.8, w: W - 3, h: 1.5, fontSize: 24, bold: true, color: SKY, align: 'center' });
    s.addText('Enzo Agostinho — CESI CDA 2026', { x: 1.5, y: H - 1.4, w: W - 3, h: 0.9, fontSize: 12, color: MUTED, align: 'center' });
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, '..', '..', '..', 'CESIZen_Presentation_Bloc2.pptx');
await prs.writeFile({ fileName: outputPath });
console.log(`✅ Présentation générée : ${outputPath}`);
