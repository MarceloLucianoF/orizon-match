"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
const admin = require("firebase-admin");
const db = admin.firestore();
/**
 * Creates a notification in the Firestore notifications collection.
 * Note: Firestore TTL should be configured in the console on 'createdAt' field.
 */
async function createNotification(payload) {
    try {
        await db.collection("notifications").add(Object.assign(Object.assign({}, payload), { read: false, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        console.log(`Notification created for user ${payload.userId}: ${payload.title}`);
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
}
//# sourceMappingURL=notifications.service.js.map