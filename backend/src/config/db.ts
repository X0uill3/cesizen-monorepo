import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MONGO_URI non définie');
        }

        if (process.env.NODE_ENV === 'test' && !/localhost|127\.0\.0\.1/.test(mongoUri)) {
            throw new Error('Connexion Mongo distante interdite en environnement de test');
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`🚀 MongoDB Connecté : ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erreur de connexion : ${error}`);
        process.exit(1); // Arrêt du processus en cas d'échec critique
    }
};

export default connectDB;