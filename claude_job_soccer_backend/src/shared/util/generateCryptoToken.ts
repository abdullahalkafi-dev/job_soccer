import { randomBytes } from 'crypto';

/**
 * Returns a cryptographically secure token of 64 hex characters (32 bytes).
 */
export const generateCryptoToken = (): string => randomBytes(32).toString('hex');