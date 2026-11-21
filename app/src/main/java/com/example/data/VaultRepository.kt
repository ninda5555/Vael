package com.example.data

import android.content.Context
import android.util.Base64
import com.example.model.UserPreferences
import com.example.model.VaultPayload
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

@Serializable
private data class EncryptedBlob(
    val iv: String,
    val ciphertext: String
)

@Serializable
private data class VaultMeta(
    val passphraseEnabled: Boolean = false,
    val deviceKeyB64: String? = null,
    val wrappedKeyIv: String? = null,
    val wrappedKeyCiphertext: String? = null,
    val pbkdf2Salt: String? = null
)

/**
 * Local-first encrypted vault storing letters, feeling cards, and check-ins
 * encrypted at rest with AES-256-GCM. Optional passphrase lock wraps the
 * vault key with PBKDF2-HMAC-SHA256 so locked state leaks zero excerpts.
 */
class VaultRepository(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    private val metaFile: File get() = File(context.filesDir, "unsent_vault_meta.json")
    private val dataFile: File get() = File(context.filesDir, "unsent_vault_data.enc")
    private val prefsFile: File get() = File(context.filesDir, "unsent_prefs.json")

    private val secureRandom = SecureRandom()

    fun loadPreferences(): UserPreferences {
        if (!prefsFile.exists()) return UserPreferences()
        return try {
            json.decodeFromString<UserPreferences>(prefsFile.readText())
        } catch (_: Exception) {
            UserPreferences()
        }
    }

    fun savePreferences(prefs: UserPreferences) {
        val tmp = File(context.filesDir, "unsent_prefs.tmp")
        tmp.writeText(json.encodeToString(prefs))
        tmp.renameTo(prefsFile)
    }

    fun isPassphraseLocked(): Boolean {
        val meta = readMeta() ?: return false
        return meta.passphraseEnabled
    }

    /** Initialize or unlock device-bound vault when no passphrase lock is active. */
    fun initializeUnlockedVault(): Pair<ByteArray, String> {
        val existing = readMeta()
        if (existing != null && !existing.passphraseEnabled && existing.deviceKeyB64 != null) {
            val rawKey = Base64.decode(existing.deviceKeyB64, Base64.NO_WRAP)
            return rawKey to toRecoveryCode(rawKey)
        }
        val keyBytes = ByteArray(32).also { secureRandom.nextBytes(it) }
        val b64 = Base64.encodeToString(keyBytes, Base64.NO_WRAP)
        writeMeta(VaultMeta(passphraseEnabled = false, deviceKeyB64 = b64))
        return keyBytes to toRecoveryCode(keyBytes)
    }

    fun unlockWithPassphrase(passphrase: String): Pair<ByteArray, String>? {
        val meta = readMeta() ?: return null
        if (!meta.passphraseEnabled || meta.pbkdf2Salt == null ||
            meta.wrappedKeyIv == null || meta.wrappedKeyCiphertext == null
        ) {
            return null
        }
        return try {
            val salt = Base64.decode(meta.pbkdf2Salt, Base64.NO_WRAP)
            val wrappingKey = deriveKey(passphrase, salt)
            val unwrapped = decryptBytes(
                wrappingKey,
                Base64.decode(meta.wrappedKeyIv, Base64.NO_WRAP),
                Base64.decode(meta.wrappedKeyCiphertext, Base64.NO_WRAP)
            )
            unwrapped to toRecoveryCode(unwrapped)
        } catch (_: Exception) {
            null
        }
    }

    fun enablePassphraseLock(vaultKey: ByteArray, passphrase: String) {
        require(passphrase.length >= 4) { "Passphrase must be at least 4 characters." }
        val salt = ByteArray(16).also { secureRandom.nextBytes(it) }
        val wrappingKey = deriveKey(passphrase, salt)
        val (iv, cipher) = encryptBytes(wrappingKey, vaultKey)
        writeMeta(
            VaultMeta(
                passphraseEnabled = true,
                deviceKeyB64 = null,
                wrappedKeyIv = Base64.encodeToString(iv, Base64.NO_WRAP),
                wrappedKeyCiphertext = Base64.encodeToString(cipher, Base64.NO_WRAP),
                pbkdf2Salt = Base64.encodeToString(salt, Base64.NO_WRAP)
            )
        )
    }

    fun disablePassphraseLock(vaultKey: ByteArray) {
        val b64 = Base64.encodeToString(vaultKey, Base64.NO_WRAP)
        writeMeta(VaultMeta(passphraseEnabled = false, deviceKeyB64 = b64))
    }

    fun loadVaultPayload(vaultKey: ByteArray): VaultPayload {
        if (!dataFile.exists()) return VaultPayload()
        return try {
            val blob = json.decodeFromString<EncryptedBlob>(dataFile.readText())
            val plain = decryptBytes(
                vaultKey,
                Base64.decode(blob.iv, Base64.NO_WRAP),
                Base64.decode(blob.ciphertext, Base64.NO_WRAP)
            )
            json.decodeFromString<VaultPayload>(plain.decodeToString())
        } catch (_: Exception) {
            VaultPayload()
        }
    }

    fun saveVaultPayload(vaultKey: ByteArray, payload: VaultPayload): Boolean {
        return try {
            val raw = json.encodeToString(payload).encodeToByteArray()
            val (iv, cipher) = encryptBytes(vaultKey, raw)
            val blob = EncryptedBlob(
                iv = Base64.encodeToString(iv, Base64.NO_WRAP),
                ciphertext = Base64.encodeToString(cipher, Base64.NO_WRAP)
            )
            val tmp = File(context.filesDir, "unsent_vault_data.tmp")
            tmp.writeText(json.encodeToString(blob))
            tmp.renameTo(dataFile)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun eraseAllLocalData() {
        dataFile.delete()
        metaFile.delete()
        prefsFile.delete()
    }

    private fun readMeta(): VaultMeta? {
        if (!metaFile.exists()) return null
        return try {
            json.decodeFromString<VaultMeta>(metaFile.readText())
        } catch (_: Exception) {
            null
        }
    }

    private fun writeMeta(meta: VaultMeta) {
        val tmp = File(context.filesDir, "unsent_vault_meta.tmp")
        tmp.writeText(json.encodeToString(meta))
        tmp.renameTo(metaFile)
    }

    private fun deriveKey(passphrase: String, salt: ByteArray): ByteArray {
        val spec = PBEKeySpec(passphrase.toCharArray(), salt, 65_536, 256)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        return factory.generateSecret(spec).encoded
    }

    private fun encryptBytes(key: ByteArray, plaintext: ByteArray): Pair<ByteArray, ByteArray> {
        val iv = ByteArray(12).also { secureRandom.nextBytes(it) }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
        val ciphertext = cipher.doFinal(plaintext)
        return iv to ciphertext
    }

    private fun decryptBytes(key: ByteArray, iv: ByteArray, ciphertext: ByteArray): ByteArray {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
        return cipher.doFinal(ciphertext)
    }

    private fun toRecoveryCode(rawKey: ByteArray): String {
        return Base64.encodeToString(rawKey, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    }
}
