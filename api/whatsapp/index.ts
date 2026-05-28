import type { VercelRequest, VercelResponse } from '../../types/vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === (process.env.META_WA_VERIFY_TOKEN || '')) {
      return res.status(200).send(challenge);
    }

    return res.status(401).json({ error: 'Webhook verification failed' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { parseMessage } = await import('../../lib/whatsapp');
  const parsed = parseMessage(req.body);
  res.status(200).json({ received: true });

  if (!parsed.isMessage || !parsed.message) return;

  try {
    const [{ hasProcessedMessage, logProcessedMessage }, { processIncomingWhatsAppMessage }, { markMessageAsRead }] =
      await Promise.all([
        import('../../lib/messageLogs'),
        import('../../lib/bot'),
        import('../../lib/whatsapp'),
      ]);

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
