// Env vars minimum pour que les modules chargent sans erreur
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-cesizen-minimum-32chars';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cesizen_test';
