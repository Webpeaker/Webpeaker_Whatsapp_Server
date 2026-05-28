import { optionalEnv } from './env.js';
import { sendMessageToPhoneNumber } from './whatsapp.js';

export async function notifyAdmin(message: string) {
  const adminPhone = optionalEnv('ADMIN_PHONE_NUMBER');
  if (!adminPhone) return;
  await sendMessageToPhoneNumber(adminPhone, message);
}
