import {
    generateEd25519KeyPair,
    signWithEd25519,
    verifyEd25519,
} from '../../utils/crypto.js';

describe('Ed25519 asymmetric crypto', () => {
    it('should generate a valid PEM key pair', () => {
        const { privateKey, publicKey } = generateEd25519KeyPair();
        expect(privateKey).toContain('BEGIN PRIVATE KEY');
        expect(publicKey).toContain('BEGIN PUBLIC KEY');
    });

    it('should sign and verify a message', () => {
        const { privateKey, publicKey } = generateEd25519KeyPair();
        const message = 'cesizen-payload-test';
        const signature = signWithEd25519(message, privateKey);
        expect(verifyEd25519(message, signature, publicKey)).toBe(true);
    });

    it('should reject a tampered message', () => {
        const { privateKey, publicKey } = generateEd25519KeyPair();
        const signature = signWithEd25519('original', privateKey);
        expect(verifyEd25519('tampered', signature, publicKey)).toBe(false);
    });

    it('should reject a signature from a different key pair', () => {
        const pair1 = generateEd25519KeyPair();
        const pair2 = generateEd25519KeyPair();
        const signature = signWithEd25519('message', pair1.privateKey);
        expect(verifyEd25519('message', signature, pair2.publicKey)).toBe(false);
    });
});
