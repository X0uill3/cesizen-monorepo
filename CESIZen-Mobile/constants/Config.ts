import { Platform } from 'react-native';

const PORT = '5000';
const blurHash = '2rzE/nrP?J@(z;Z.Ed=^ze5eg^Z*?{o5GV*%ng97f&X';

const defaultHost = Platform.select({
    android: '10.0.2.2',
    ios: '10.64.128.245',
    default: 'localhost',
});

const apiHost = process.env.EXPO_PUBLIC_API_HOST || defaultHost;

export const Config = {
    BASE_URL: `http://${apiHost}:${PORT}/api`,
    blurHash,
};

