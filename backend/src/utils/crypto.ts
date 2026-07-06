import { generateKeyPairSync, sign, verify } from 'node:crypto';

/**
 * Chiffrement asymétrique Ed25519 (RFC 8032)
 * Avantages vs RSA : clés 32 octets, signatures 64 octets,
 * performances supérieures, déterministe (pas de gestion de nonce).
 * Standard : SSH, TLS 1.3, Signal, WireGuard.
 */

export interface Ed25519KeyPair {
    privateKey: string; // PEM PKCS8
    publicKey: string;  // PEM SPKI
}

export const generateEd25519KeyPair = (): Ed25519KeyPair =>
    generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

// Ed25519 est one-pass : pas de digest séparé, null indique l'algorithme natif de la clé
export const signWithEd25519 = (message: string, privateKeyPem: string): string =>
    sign(null, Buffer.from(message), privateKeyPem).toString('base64');

export const verifyEd25519 = (
    message: string,
    signature: string,
    publicKeyPem: string,
): boolean => {
    try {
        return verify(null, Buffer.from(message), publicKeyPem, Buffer.from(signature, 'base64'));
    } catch {
        return false;
    }
};
