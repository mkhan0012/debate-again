import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Ensure the key exists and is valid
const HEX_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

if (!HEX_KEY || HEX_KEY.length !== 64) {
  throw new Error(
    'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Check your .env file.'
  );
}

// Convert the hex string from .env back into a Buffer
const SECRET_KEY = Buffer.from(HEX_KEY, 'hex');

/**
 * Encrypts a string using AES-256-CBC.
 * Returns an object containing the encrypted content (hex) and the IV (hex).
 */
export function encrypt(text: string) {
  // Generate a unique Initialization Vector (IV) for every encryption
  const iv = randomBytes(16);
  
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    contentEncrypted: encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypts a string using AES-256-CBC.
 * Requires the encrypted content (hex) and the original IV (hex).
 */
export function decrypt(encryptedText: string, ivHex: string) {
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}