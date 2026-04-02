import { createClient } from '@supabase/supabase-js';
import { verifyOtp } from './aadhaar-mock-engine.js';

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
    const { reference_id, otp, user_id } = req.body;

    // Validate required fields
    if (!reference_id || !otp || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'reference_id, otp, and user_id are all required.',
      });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));

    // Verify with mock engine
    const result = verifyOtp(reference_id, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // OTP verified — update Supabase with service role (server-side, tamper-proof)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({
        success: false,
        error: 'SERVER_CONFIG',
        message: 'Server configuration error. Contact admin.',
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_verified: true,
        aadhaar_verified_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'DB_ERROR',
        message: 'Verification succeeded but failed to update profile. Please contact support.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Identity verified successfully!',
      data: result.data,
    });
  } catch (error) {
    console.error('Aadhaar Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}
