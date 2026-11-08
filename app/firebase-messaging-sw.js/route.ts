import { buildFirebaseMessagingSwResponse } from "@/lib/firebase-messaging-sw-script";

export async function GET() {
  return buildFirebaseMessagingSwResponse();
}
