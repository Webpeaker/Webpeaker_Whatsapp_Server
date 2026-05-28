import { optionalEnv } from './env';
import { sendMessageToPhoneNumber } from './whatsapp';

export async function notifyAdmin(message: string) {
  const adminPhone = optionalEnv('ADMIN_PHONE_NUMBER');
  if (!adminPhone) return;
  await sendMessageToPhoneNumber(adminPhone, message);
}
