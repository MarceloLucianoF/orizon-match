import * as admin from "firebase-admin";

const db = admin.firestore();

export type NotificationType = "match" | "nda" | "system" | "invite";

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Creates a notification in the Firestore notifications collection.
 * Note: Firestore TTL should be configured in the console on 'createdAt' field.
 */
export async function createNotification(payload: NotificationPayload) {
  try {
    await db.collection("notifications").add({
      ...payload,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Notification created for user ${payload.userId}: ${payload.title}`);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
