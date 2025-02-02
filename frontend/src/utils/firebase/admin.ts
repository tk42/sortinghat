import admin from 'firebase-admin';

var serviceAccount = require("/app/serviceAccount.json");

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const auth = admin.auth();
export default admin;