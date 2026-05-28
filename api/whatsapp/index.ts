import type { VercelRequest, VercelResponse } from '../../types/vercel';

function parseMessage(body: any) {
  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const rawMessage = value?.messages?.[0];
    if (!rawMessage) return { isMessage: false };

    const contact = value?.contacts?.[0];
    const interactive = rawMessage.interactive;
    const listReply = interactive?.type === 'list_reply' ? interactive.list_reply : undefined;
    const buttonReply = interactive?.type === 'button_reply' ? interactive.button_reply : undefined;

    return {
      isMessage: true,
      message: {
        from: {
          phone: rawMessage.from,
          name: contact?.profile?.name || 'Customer',
        },
        timestamp: rawMessage.timestamp,
        text: rawMessage.text?.body ? { body: rawMessage.text.body } : undefined,
        type: rawMessage.type,
        message_id: rawMessage.id,
        list_reply: listReply ? { id: listReply.id, title: listReply.title } : undefined,
        button_reply: buttonReply ? { id: buttonReply.id, title: buttonReply.title } : undefined,
      },
    };
  } catch {
    return { isMessage: false };
  }
}

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

  try {
    console.log('WhatsApp webhook POST received');
    const parsed = parseMessage(req.body);

    if (!parsed.isMessage || !parsed.message) {
      console.log('WhatsApp webhook ignored: no user message in payload');
      return res.status(200).json({ received: true, ignored: true });
    }

    const [{ hasProcessedMessage, logProcessedMessage }, { processIncomingWhatsAppMessage }, { markMessageAsRead }] =
      await Promise.all([
        import('../../lib/messageLogs'),
        import('../../lib/bot'),
        import('../../lib/whatsapp'),
      ]);

    const messageId = parsed.message.message_id;
    const phone = parsed.message.from.phone;
    console.log('WhatsApp message parsed', {
      messageId,
      phone,
      type: parsed.message.type,
      hasText: Boolean(parsed.message.text?.body),
      listReply: parsed.message.list_reply?.id,
      buttonReply: parsed.message.button_reply?.id,
    });

    if (await hasProcessedMessage(messageId)) {
      console.log('WhatsApp duplicate message skipped', { messageId });
      return res.status(200).json({ received: true, duplicate: true });
    }

    await logProcessedMessage({
      message_id: messageId,
      phone,
      payload: req.body,
    });

    await markMessageAsRead(messageId).catch(() => undefined);
    await processIncomingWhatsAppMessage(parsed);
    console.log('WhatsApp message processed', { messageId, phone });
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('WhatsApp webhook processing failed', error);
    return res.status(200).json({ received: true, error: 'processing_failed' });
  }
}
