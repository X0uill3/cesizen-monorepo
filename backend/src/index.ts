import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import * as dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import articlesRoutes from './routes/articlesRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import emotionRoutes from './routes/emotionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import diagnosticRoutes from './routes/diagnosticRoutes.js';

dotenv.config();

const app: Application = express();

// Sécurité : en-têtes HTTP sécurisés (OWASP A05 - Security Misconfiguration)
app.use(helmet());

// Sécurité : restriction des origines CORS aux domaines autorisés
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

// Sécurité : limitation du taux de requêtes (OWASP A04 - Insecure Design / DoS)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' },
    skip: () => process.env.NODE_ENV === 'test',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.' },
    skip: () => process.env.NODE_ENV === 'test',
});

app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

// Sécurité : sanitisation des entrées MongoDB (OWASP A03 - Injection)
app.use(mongoSanitize());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/diagnostic', diagnosticRoutes);

// Ajoute bien les types ici pour que res.send() soit reconnu
app.get('/', (req: Request, res: Response) => {
    res.send('API CESIZen opérationnelle 🧘');
});

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;