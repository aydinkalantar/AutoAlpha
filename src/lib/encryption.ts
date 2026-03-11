import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const LEGACY_ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a given text using AES-256-GCM.
 * Generates a unique 16-byte Initialization Vector (IV) for every encryption.
 * 
 * @param text The plaintext to encrypt.
 * @param secretKey The 32-byte (256-bit) secret key to use for encryption.
 * @returns A string in the format "iv:authTag:encryptedText" (hex encoded).
 */
export function encryptKey(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(16);
  // Ensure the secret key is exactly 32 bytes
  const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);

  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Return the IV, authTag, and the encrypted data joined by a colon
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a given text that was encrypted using encryptKey (GCM or CBC).
 * 
 * @param hash The string in the format "iv:authTag:encryptedText" (or legacy "iv:encryptedText").
 * @param secretKey The 32-byte (256-bit) secret key used for encryption.
 * @returns The decrypted plaintext string.
 */
export function decryptKey(hash: string, secretKey: string): string {
  const parts = hash.split(':');

  if (parts.length === 2) {
    // Legacy AES-256-CBC Fallback
    const [legacyIvHex, legacyEncryptedText] = parts;
    const legacyIv = Buffer.from(legacyIvHex, 'hex');
    const legacyKey = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);

    const legacyDecipher = crypto.createDecipheriv(LEGACY_ALGORITHM, Buffer.from(legacyKey), legacyIv);
    let legacyDecrypted = legacyDecipher.update(legacyEncryptedText, 'hex', 'utf8');
    legacyDecrypted += legacyDecipher.final('utf8');
    return legacyDecrypted;
  }

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format. Expected 'iv:authTag:encryptedText'.");
  }

  const [ivHex, authTagHex, encryptedText] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
