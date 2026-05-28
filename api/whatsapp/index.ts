import type { VercelRequest, VercelResponse } from '../../types/vercel';

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function envDiagnostics() {
  return {
    hasVerifyToken: Boolean(process.env.META_WA_VERIFY_TOKEN),
    hasAccessToken: Boolean(process.env.META_WA_ACCESS_TOKEN),
    hasPhoneNumberId: Boolean(process.env.META_WA_PHONE_NUMBER_ID),
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAdminPhone: Boolean(process.env.ADMIN_PHONE_NUMBER),
  };
}

function logWebhook(event: string, data: Record<string, unknown> = {}) {
  console.log(`[webpeaker-wa-webhook] ${event}`, data);
}

function errorSummary(error: any) {
  return {
    name: error?.name,
    message: error?.message || String(error),
    code: error?.code,
    status: error?.response?.status,
    apiError: error?.response?.data?.error?.message || error?.response?.data?.message,
  };
}

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
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  logWebhook('request_received', {
    requestId,
    method: req.method,
    queryKeys: Object.keys(req.query || {}),
    env: envDiagnostics(),
  });

  if (req.method === 'GET') {
    if (queryValue(req.query.debug) === '1') {
      logWebhook('debug_check', { requestId });
      return res.status(200).json({
        ok: true,
        route: '/api/whatsapp',
        requestId,
        env: envDiagnostics(),
      });
    }

    const mode = queryValue(req.query['hub.mode']);
    const token = queryValue(req.query['hub.verify_token']);
    const challenge = queryValue(req.query['hub.challenge']);
    const verifyToken = process.env.META_WA_VERIFY_TOKEN || '';

    logWebhook('verification_attempt', {
      requestId,
      mode,
      hasTokenFromMeta: Boolean(token),
      hasChallenge: Boolean(challenge),
      tokenMatches: Boolean(token && token === verifyToken),
    });

    if (mode === 'subscribe' && token === verifyToken) {
      logWebhook('verification_success', { requestId });
      return res.status(200).send(challenge);
    }

    logWebhook('verification_failed', { requestId });
    return res.status(401).json({ error: 'Webhook verification failed', requestId });
  }

  if (req.method !== 'POST') {
    logWebhook('method_not_allowed', { requestId, method: req.method });
    return res.status(405).json({ error: 'Method not allowed', requestId });
  }

  try {
    logWebhook('post_received', {
      requestId,
      bodyType: typeof req.body,
      bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
      object: req.body?.object,
      entryCount: Array.isArray(req.body?.entry) ? req.body.entry.length : 0,
    });

    const parsed = parseMessage(req.body);

    if (!parsed.isMessage || !parsed.message) {
      logWebhook('post_ignored_no_message', { requestId });
      return res.status(200).json({ received: true, ignored: true, requestId });
    }

    logWebhook('message_parse_success', {
      requestId,
      messageId: parsed.message.message_id,
      phone: parsed.message.from.phone,
      type: parsed.message.type,
      hasText: Boolean(parsed.message.text?.body),
      listReply: parsed.message.list_reply?.id,
      buttonReply: parsed.message.button_reply?.id,
    });

    const [{ hasProcessedMessage, logProcessedMessage }, { processIncomingWhatsAppMessage }, { markMessageAsRead }] =
      await Promise.all([
        import('../../lib/messageLogs.js'),
        import('../../lib/bot.js'),
        import('../../lib/whatsapp.js'),
      ]);
    logWebhook('runtime_imports_loaded', { requestId });

    const messageId = parsed.message.message_id;
    const phone = parsed.message.from.phone;

    if (await hasProcessedMessage(messageId)) {
      logWebhook('duplicate_skipped', { requestId, messageId, phone });
      return res.status(200).json({ received: true, duplicate: true, requestId });
    }

    await logProcessedMessage({
      message_id: messageId,
      phone,
      payload: req.body,
    });
    logWebhook('message_logged', { requestId, messageId, phone });

    await markMessageAsRead(messageId).catch(() => undefined);
    logWebhook('mark_read_attempted', { requestId, messageId, phone });

    await processIncomingWhatsAppMessage(parsed);
    logWebhook('message_processed', { requestId, messageId, phone });
    return res.status(200).json({ received: true, requestId });
  } catch (error) {
    const summary = errorSummary(error);
    console.error('[webpeaker-wa-webhook] processing_failed', { requestId, error: summary });
    return res.status(200).json({ received: true, error: 'processing_failed', requestId, details: summary });
  }
}
