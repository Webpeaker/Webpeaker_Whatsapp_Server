import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { sendMessageToPhoneNumber } from '../../lib/whatsapp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, message } = req.body || {};
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  try {
    const response = await sendMessageToPhoneNumber(phone, message);
    return res.status(200).json({ ok: true, data: response.data });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.response?.data || error.message,
    });
  }
}
