import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Helper: validates key ONLY when needed (prevents app crash on startup)
function getKey() {
  const HEX_KEY = process.env.ENCRYPTION_KEY;
  
  if (!HEX_KEY) {
    throw new Error('Missing ENCRYPTION_KEY in .env file');
  }
  
  if (HEX_KEY.length !== 64) {
    throw new Error(`ENCRYPTION_KEY must be 64 characters long (Received: ${HEX_KEY.length}). It must be a 32-byte hex string.`);
  }

  return Buffer.from(HEX_KEY, 'hex');
}

export function encrypt(text: string) {
  const SECRET_KEY = getKey(); // Validate here, not at top level
  const iv = randomBytes(16);
  
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    contentEncrypted: encrypted,
    iv: iv.toString('hex'),
  };
}

export function decrypt(encryptedText: string, ivHex: string) {
  const SECRET_KEY = getKey(); // Validate here, not at top level
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}