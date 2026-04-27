/**
 * Key Manager — Per-photo AES-256 key management
 * 
 * Each photo gets a unique encryption key stored in the device's
 * secure enclave via expo-secure-store. Keys are identified by
 * photo UUID and never leave the device.
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_PREFIX = 'photo_key_';

/**
 * Generate a new AES-256 key for a photo and store it securely.
 * @param photoId - Unique identifier for the photo (UUID)
 * @returns The generated key as a hex string (32 bytes = 64 hex chars)
 */
export async function generatePhotoKey(photoId: string): Promise<string> {
  // Generate 32 random bytes (256 bits) for AES-256
  const keyBytes = await Crypto.getRandomBytesAsync(32);
  const keyHex = bytesToHex(keyBytes);

  // Store in Secure Enclave
  await SecureStore.setItemAsync(`${KEY_PREFIX}${photoId}`, keyHex, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  return keyHex;
}

/**
 * Retrieve the AES-256 key for a specific photo.
 * @param photoId - Unique identifier for the photo
 * @returns The key as a hex string, or null if not found
 */
export async function getPhotoKey(photoId: string): Promise<string | null> {
  return SecureStore.getItemAsync(`${KEY_PREFIX}${photoId}`);
}

/**
 * Delete the encryption key for a specific photo.
 * Should be called when the photo is permanently deleted.
 * @param photoId - Unique identifier for the photo
 */
export async function deletePhotoKey(photoId: string): Promise<void> {
  await SecureStore.deleteItemAsync(`${KEY_PREFIX}${photoId}`);
}

/** Convert a Uint8Array to a hex string */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
