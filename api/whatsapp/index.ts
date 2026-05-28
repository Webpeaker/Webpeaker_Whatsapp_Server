import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { optionalEnv } from '../../lib/env';
import { hasProcessedMessage, logProcessedMessage } from '../../lib/messageLogs';
import { processIncomingWhatsAppMessage } from '../../lib/bot';
import { markMessageAsRead, parseMessage } from '../../lib/whatsapp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === optionalEnv('META_WA_VERIFY_TOKEN')) {
      return res.status(200).send(challenge);
    }

    return res.status(401).json({ error: 'Webhook verification failed' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = parseMessage(req.body);
  res.status(200).json({ received: true });

  if (!parsed.isMessage || !parsed.message) return;

  try {
    const messageId = parsed.message.message_id;
    if (await hasProcessedMessage(messageId)) return;

    await logProcessedMessage({
      message_id: messageId,
      phone: parsed.message.from.phone,
      payload: req.body,
    });

    await markMessageAsRead(messageId).catch(() => undefined);
    await processIncomingWhatsAppMessage(parsed);
  } catch (error) {
    console.error('WhatsApp webhook processing failed', error);
  }
}
