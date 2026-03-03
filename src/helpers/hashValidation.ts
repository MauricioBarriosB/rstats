/**
 * Hash validation utility for secure data storage
 * Uses environment variables for key generation
 * Includes app key validation to prevent unauthorized compilation
 */

const getSecurityKeys = () => ({
  apiKey: import.meta.env.VITE_RSTATS_API_KEY || "",
  apiHash: import.meta.env.VITE_RSTATS_API_HASH || "",
  apiSalt: import.meta.env.VITE_RSTATS_API_SALT || "",
  validationHash: import.meta.env.VITE_RSTATS_VALIDATION_HASH || "",
  validationPhrase: import.meta.env.VITE_RSTATS_VALIDATION_PHRASE || "",
});

/**
 * Compute SHA-256 hash of a string
 */
async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate the expected validation hash from current keys
 * This must match the stored VITE_RSTATS_VALIDATION_HASH
 */
async function computeValidationHash(): Promise<string> {
  const { apiKey, apiHash, apiSalt, validationPhrase } = getSecurityKeys();
  const combined = `${validationPhrase}:${apiKey}:${apiHash}:${apiSalt}`;
  return computeSHA256(combined);
}

/**
 * Validate that the app keys are correct
 * Returns true only if the keys match the pre-computed validation hash
 */
export async function validateAppKeys(): Promise<boolean> {
  const { apiKey, apiHash, apiSalt, validationHash, validationPhrase } = getSecurityKeys();
  // All keys must be present
  if (!apiKey || !apiHash || !apiSalt || !validationHash || !validationPhrase) {
    console.error("Missing required security keys");
    return false;
  }
  // Compute expected hash from current keys
  const computedHash = await computeValidationHash();
  // Compare with stored validation hash
  const isValid = computedHash === validationHash;
  if (!isValid) {
    console.error("App key validation failed. Unauthorized keys detected.");
  }
  return isValid;
}

/**
 * Generate a hash signature for the given data
 */
export async function generateHash(data: string): Promise<string> {
  const { apiKey, apiHash, apiSalt } = getSecurityKeys();
  const combined = `${apiSalt}${data}${apiKey}${apiHash}`;
  return computeSHA256(combined);
}

/**
 * Validate that the stored hash matches the data
 */
export async function validateHash(data: string, storedHash: string): Promise<boolean> {
  const computedHash = await generateHash(data);
  return computedHash === storedHash;
}

/**
 * Check if security keys are configured
 */
export function areSecurityKeysConfigured(): boolean {
  const { apiKey, apiHash, apiSalt, validationHash, validationPhrase } = getSecurityKeys();
  return Boolean(apiKey && apiHash && apiSalt && validationHash && validationPhrase);
}
