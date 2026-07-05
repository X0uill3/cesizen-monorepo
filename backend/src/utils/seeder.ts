import mongoose from 'mongoose';
import UserModel from '../models/User.js';
import { Emotion } from '../models/Emotion.js';
import { EmotionDetail } from '../models/EmotionDetails.js';
import ArticleModel from '../models/Articles.js';
import DiaryModel from '../models/Diary.js';
import DiagnosticTest from '../models/DiagnosticTest.js';
import DiagnosticQuestion from '../models/DiagnosticQuestion.js';
import { GlobalRole } from '../constants/roles.js';
import { ArticleCategory } from '../constants/categories.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cda_db';

async function seed() {
    try {
        console.log('⏳ Connexion à MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connecté');

        console.log('🧹 Nettoyage de la base de données...');
        await DiagnosticTest.deleteMany({});
        await DiagnosticQuestion.deleteMany({});

        // ─── DIAGNOSTIC : Échelle de Holmes & Rahe ───────────────────────────
        console.log('🧪 Création du questionnaire de stress (Holmes & Rahe)...');

        const stressTest = await DiagnosticTest.create({
            title: "Questionnaire de stress (Échelle de Holmes & Rahe)",
            description: "Cochez les événements que vous avez vécus au cours des 12 derniers mois. Le total de points obtenu indique votre niveau de stress et votre risque d'impact sur la santé.",
            isActive: true,
            rules: [
                {
                    minScore: 0,
                    maxScore: 149,
                    title: "Niveau de stress faible",
                    description: "Votre score indique un faible niveau de stress. Vous avez traversé peu de changements majeurs ces derniers mois. Continuez à prendre soin de vous et à maintenir vos bonnes habitudes de vie.",
                    color: "#27AE60",
                },
                {
                    minScore: 150,
                    maxScore: 299,
                    title: "Niveau de stress modéré",
                    description: "Votre score indique un niveau de stress modéré. Vous avez vécu plusieurs changements importants. Des études montrent un risque modéré d'impact sur la santé. Il est conseillé de pratiquer des techniques de relaxation et de surveiller votre bien-être.",
                    color: "#F39C12",
                },
                {
                    minScore: 300,
                    maxScore: 9999,
                    title: "Niveau de stress élevé",
                    description: "Votre score indique un niveau de stress élevé. Vous avez traversé de nombreux changements majeurs cette année. Il est fortement recommandé de consulter un professionnel de santé et de mettre en place des stratégies de gestion du stress adaptées.",
                    color: "#E74C3C",
                },
            ],
        });

        // Les 43 événements de l'échelle de Holmes & Rahe
        // Chaque question a 2 réponses : "Oui" (points de l'événement) et "Non" (0 point)
        const holmesRaheEvents = [
            { text: "Décès du conjoint(e) ou partenaire de vie", points: 100 },
            { text: "Divorce", points: 73 },
            { text: "Séparation conjugale", points: 65 },
            { text: "Emprisonnement ou détention", points: 63 },
            { text: "Décès d'un membre proche de la famille", points: 63 },
            { text: "Blessure corporelle ou maladie personnelle grave", points: 53 },
            { text: "Mariage", points: 50 },
            { text: "Licenciement ou perte d'emploi", points: 47 },
            { text: "Réconciliation conjugale après une séparation", points: 45 },
            { text: "Départ à la retraite", points: 45 },
            { text: "Changement important dans la santé d'un membre de la famille", points: 44 },
            { text: "Grossesse", points: 40 },
            { text: "Difficultés d'ordre sexuel", points: 39 },
            { text: "Arrivée d'un nouveau membre dans la famille (naissance, adoption, cohabitation...)", points: 39 },
            { text: "Réorganisation importante dans votre activité professionnelle", points: 39 },
            { text: "Changement important dans votre situation financière", points: 38 },
            { text: "Décès d'un(e) ami(e) proche", points: 37 },
            { text: "Changement de type d'emploi ou de secteur professionnel", points: 36 },
            { text: "Augmentation importante du nombre de disputes avec votre conjoint(e)", points: 35 },
            { text: "Emprunt ou crédit important (achat immobilier, voiture...)", points: 32 },
            { text: "Saisie d'un bien immobilier ou impossibilité de rembourser un crédit", points: 30 },
            { text: "Changement important dans vos responsabilités au travail", points: 29 },
            { text: "Départ du foyer d'un enfant (études, mariage...)", points: 29 },
            { text: "Difficultés relationnelles importantes avec votre belle-famille", points: 29 },
            { text: "Accomplissement personnel remarquable (promotion, récompense...)", points: 28 },
            { text: "Votre conjoint(e) commence ou arrête de travailler", points: 26 },
            { text: "Début ou fin d'une formation ou scolarité", points: 26 },
            { text: "Changement important dans vos conditions de logement", points: 25 },
            { text: "Remise en question d'habitudes personnelles (régime, sport, comportement...)", points: 24 },
            { text: "Difficultés importantes avec votre supérieur hiérarchique", points: 23 },
            { text: "Changement important de vos horaires ou conditions de travail", points: 20 },
            { text: "Déménagement dans une nouvelle ville ou région", points: 20 },
            { text: "Changement d'établissement scolaire ou universitaire", points: 20 },
            { text: "Changement important dans vos activités de loisirs ou sportives", points: 19 },
            { text: "Changement important dans vos activités religieuses ou spirituelles", points: 19 },
            { text: "Changement important dans vos activités sociales (associations, sorties...)", points: 18 },
            { text: "Petit emprunt ou crédit (moins de 10 000 €)", points: 17 },
            { text: "Changement important de vos habitudes de sommeil", points: 16 },
            { text: "Changement important dans la fréquence des réunions familiales", points: 15 },
            { text: "Changement important dans vos habitudes alimentaires", points: 15 },
            { text: "Vacances ou voyage important", points: 13 },
            { text: "Fêtes de fin d'année (Noël, Nouvel An...)", points: 12 },
            { text: "Infraction mineure à la loi (contravention, amende...)", points: 11 },
        ];

        await DiagnosticQuestion.insertMany(
            holmesRaheEvents.map((event, idx) => ({
                test: stressTest._id,
                text: event.text,
                order: idx + 1,
                isActive: true,
                answers: [
                    { label: "Oui, cela m'est arrivé", points: event.points },
                    { label: "Non, cela ne m'est pas arrivé", points: 0 },
                ],
            }))
        );

        console.log('\n🎉 Seeding terminé avec succès !');
        console.log('─────────────────────────────────────');
        console.log('🔐 Comptes créés :');
        console.log('   Admin  → admin@cesizen.fr  / Admin1234!');
        console.log('   User   → user@cesizen.fr   / User1234!');
        console.log('─────────────────────────────────────');

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Déconnecté');
        process.exit(0);
    }
}

seed();
