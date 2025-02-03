import admin from 'firebase-admin';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountStr) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

const serviceAccount = JSON.parse(serviceAccountStr);

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const auth = admin.auth();
export default admin;