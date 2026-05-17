import sodium from 'libsodium-wrappers-sumo';

// Derives a 32-byte key from the master password using Argon2id.
// Uses sensitive limits (high memory and CPU cost) for extreme security.
export async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.crypto_pwhash(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_SENSITIVE, // Very high CPU cost
    sodium.crypto_pwhash_MEMLIMIT_SENSITIVE, // Very high RAM cost
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
}

export async function encryptData(data: string, key: Uint8Array): Promise<{ ciphertext: string, nonce: string }> {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    data,
    null,
    null,
    nonce,
    key
  );
  
  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce)
  };
}

export async function decryptData(ciphertextB64: string, nonceB64: string, key: Uint8Array): Promise<string> {
  await sodium.ready;
  const ciphertext = sodium.from_base64(ciphertextB64);
  const nonce = sodium.from_base64(nonceB64);
  
  const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key
  );
  
  return sodium.to_string(decrypted);
}

export async function generateSalt(): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
}
