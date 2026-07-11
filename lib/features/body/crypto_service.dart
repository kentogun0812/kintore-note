import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:encrypt/encrypt.dart' as enc;

class CryptoService {
  // Static key and IV for mock MVP purposes.
  // In a real app, this key MUST be securely generated and stored in SecureStorage/Keychain.
  static final _key = enc.Key.fromUtf8('my32lengthsupersecretnooneknows1'); 
  static final _iv = enc.IV.fromLength(16);

  static Uint8List encryptImage(Uint8List imageBytes) {
    try {
      final encrypter = enc.Encrypter(enc.AES(_key));
      // For large images in production, streaming encryption is better.
      // For this MVP mock, we encrypt the entire Uint8List in memory.
      final encrypted = encrypter.encryptBytes(imageBytes, iv: _iv);
      return encrypted.bytes;
    } catch (e) {
      debugPrint('Encryption error: $e');
      return imageBytes; // fallback for mock
    }
  }

  static Uint8List decryptImage(Uint8List encryptedBytes) {
    try {
      final encrypter = enc.Encrypter(enc.AES(_key));
      final decrypted = encrypter.decryptBytes(enc.Encrypted(encryptedBytes), iv: _iv);
      return Uint8List.fromList(decrypted);
    } catch (e) {
      debugPrint('Decryption error: $e');
      return encryptedBytes; // fallback for mock
    }
  }
}
