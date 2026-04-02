import { sendOtp } from './aadhaar-mock-engine.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { aadhaar_number } = req.body;

    if (!aadhaar_number) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELD',
        message: 'Aadhaar number is required.',
      });
    }

    // Strip spaces (frontend formats as XXXX XXXX XXXX)
    const cleanAadhaar = aadhaar_number.replace(/\s/g, '');

    // Simulate network delay (makes it feel real)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const result = sendOtp(cleanAadhaar);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Aadhaar Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}
