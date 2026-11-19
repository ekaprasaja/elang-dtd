import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const DEFAULT_SECRET = process.env.ENCRYPTION_SECRET || 'elang_dtd_secret_encryption_key_2026_kepri!';

function getKey(): Buffer {
  return crypto.createHash('sha256').update(DEFAULT_SECRET).digest();
}

/**
 * Encrypts a plaintext NIK using AES-256-GCM.
 * Output format: Base64(iv + authTag + ciphertext)
 */
export function encryptNik(nik: string): string {
  if (!nik) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(nik, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts an encrypted NIK token.
 */
export function decryptNik(encryptedToken: string): string {
  if (!encryptedToken) return '';
  
  // Handle mock enc_ prefix if any
  if (encryptedToken.startsWith('enc_')) {
    return encryptedToken.replace('enc_', '');
  }

  try {
    const data = Buffer.from(encryptedToken, 'base64');
    if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      return 'NIK-INVALID';
    }

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(ciphertext) + decipher.final('utf8');
  } catch (err) {
    console.error('Failed to decrypt NIK:', err);
    return 'NIK-TERPROTEKSI';
  }
}

/**
 * Returns a masked representation of NIK (only showing the last 4 digits).
 * UU PDP requirement: No plaintext full NIK displayed by default.
 */
export function maskNik(nik: string): string {
  if (!nik) return '****';
  const clean = nik.replace(/\D/g, '');
  if (clean.length <= 4) return `****${clean}`;
  return `${'*'.repeat(clean.length - 4)}${clean.slice(-4)}`;
}

export function extractLast4(nik: string): string {
  if (!nik) return '0000';
  const clean = nik.replace(/\D/g, '');
  return clean.slice(-4) || '0000';
}
