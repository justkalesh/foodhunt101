// ============================================================
// MOCK AADHAAR KYC ENGINE
// ============================================================
// This file simulates the Aadhaar OTP verification flow.
// To switch to a real provider (Setu, Zoop, Sandbox.co.in),
// replace the internals of sendOtp() and verifyOtp() — nothing
// else in the codebase needs to change.
// ============================================================

// In-memory store for pending verifications
// Maps reference_id -> { aadhaarNumber, createdAt, attempts }
const pendingVerifications = new Map();

// Test Aadhaar profiles
const TEST_PROFILES = {
  '999999990019': {
    name: 'Ramesh Kumar',
    dob: '1995-04-15',
    gender: 'M',
    address: '42, Mohan Nagar, Delhi - 110001',
  },
  '999999990027': {
    name: 'Priya Sharma',
    dob: '1998-08-22',
    gender: 'F',
    address: '18, Indira Colony, Mumbai - 400001',
  },
  '123456789012': {
    name: 'Arjun Singh',
    dob: '2000-01-10',
    gender: 'M',
    address: '7, University Road, Jalandhar - 144001',
  },
};

// Blocked/invalid Aadhaar numbers
const BLOCKED_NUMBERS = ['111111111111', '000000000000'];

// Static OTP for sandbox
const VALID_OTP = '123456';

// Reference ID expiry: 10 minutes
const REFERENCE_EXPIRY_MS = 10 * 60 * 1000;

// Max OTP attempts
const MAX_ATTEMPTS = 3;

/**
 * Generate a random reference ID
 */
function generateReferenceId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate Aadhaar number format
 * Must be exactly 12 digits, no spaces
 */
function isValidAadhaarFormat(aadhaar) {
  return /^\d{12}$/.test(aadhaar);
}

/**
 * Clean up expired references (garbage collection)
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [refId, data] of pendingVerifications.entries()) {
    if (now - data.createdAt > REFERENCE_EXPIRY_MS) {
      pendingVerifications.delete(refId);
    }
  }
}

/**
 * STEP 1: Send OTP
 * Validates Aadhaar format and returns a reference_id
 * 
 * In production, this would call:
 * POST https://api.sandbox.co.in/kyc/aadhaar/okyc/otp
 */
export function sendOtp(aadhaarNumber) {
  // Clean up old references
  cleanupExpired();

  // Validate format
  if (!aadhaarNumber || !isValidAadhaarFormat(aadhaarNumber)) {
    return {
      success: false,
      error: 'INVALID_FORMAT',
      message: 'Please enter a valid 12-digit Aadhaar number.',
    };
  }

  // Check blocked numbers
  if (BLOCKED_NUMBERS.includes(aadhaarNumber)) {
    return {
      success: false,
      error: 'INVALID_AADHAAR',
      message: 'This Aadhaar number is invalid or blocked.',
    };
  }

  // Generate reference ID and store
  const referenceId = generateReferenceId();
  pendingVerifications.set(referenceId, {
    aadhaarNumber,
    createdAt: Date.now(),
    attempts: 0,
  });

  // Simulate 1-2 second delay (like real API)
  return {
    success: true,
    reference_id: referenceId,
    message: 'OTP sent to Aadhaar-linked mobile number.',
  };
}

/**
 * STEP 2: Verify OTP
 * Validates the OTP against the reference and returns KYC data
 * 
 * In production, this would call:
 * POST https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify
 */
export function verifyOtp(referenceId, otp) {
  // Clean up old references
  cleanupExpired();

  // Check reference exists
  const pending = pendingVerifications.get(referenceId);
  if (!pending) {
    return {
      success: false,
      error: 'INVALID_REFERENCE',
      message: 'Verification session expired or invalid. Please start again.',
    };
  }

  // Check expiry
  if (Date.now() - pending.createdAt > REFERENCE_EXPIRY_MS) {
    pendingVerifications.delete(referenceId);
    return {
      success: false,
      error: 'SESSION_EXPIRED',
      message: 'Verification session has expired. Please request a new OTP.',
    };
  }

  // Check attempts
  pending.attempts += 1;
  if (pending.attempts > MAX_ATTEMPTS) {
    pendingVerifications.delete(referenceId);
    return {
      success: false,
      error: 'MAX_ATTEMPTS',
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  // Validate OTP
  if (otp !== VALID_OTP) {
    const remaining = MAX_ATTEMPTS - pending.attempts;
    return {
      success: false,
      error: 'INVALID_OTP',
      message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    };
  }

  // OTP is valid — get the profile data
  const profile = TEST_PROFILES[pending.aadhaarNumber] || {
    name: 'Test User',
    dob: '2000-01-01',
    gender: 'M',
    address: 'Test Address, India - 100001',
  };

  // Clean up after successful verification
  pendingVerifications.delete(referenceId);

  return {
    success: true,
    message: 'Aadhaar verification successful.',
    data: {
      name: profile.name,
      dob: profile.dob,
      gender: profile.gender,
      address: profile.address,
      // Masked Aadhaar for display (XXXX XXXX 0019)
      maskedAadhaar: `XXXX XXXX ${pending.aadhaarNumber.slice(-4)}`,
    },
  };
}
