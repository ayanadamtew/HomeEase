const { PrismaClient } = require('@prisma/client');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-prod';

const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return ciphertext; // Return original if decryption fails (e.g. it was an unencrypted legacy value)
    }
};

const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const prisma = basePrisma.$extends({
    query: {
        user: {
            async create({ args, query }) {
                if (args.data.stripeAccountId) {
                    args.data.stripeAccountId = encrypt(args.data.stripeAccountId);
                }
                if (args.data.identityDocumentUrl) {
                    args.data.identityDocumentUrl = encrypt(args.data.identityDocumentUrl);
                }
                return query(args);
            },
            async update({ args, query }) {
                if (args.data.stripeAccountId) {
                    args.data.stripeAccountId = encrypt(args.data.stripeAccountId);
                }
                if (args.data.identityDocumentUrl) {
                    args.data.identityDocumentUrl = encrypt(args.data.identityDocumentUrl);
                }
                return query(args);
            },
        },
    },
    result: {
        user: {
            stripeAccountId: {
                needs: { stripeAccountId: true },
                compute(user) {
                    return decrypt(user.stripeAccountId);
                },
            },
            identityDocumentUrl: {
                needs: { identityDocumentUrl: true },
                compute(user) {
                    return decrypt(user.identityDocumentUrl);
                },
            },
        },
    },
});

module.exports = prisma;
