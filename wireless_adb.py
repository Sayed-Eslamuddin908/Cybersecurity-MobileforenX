#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "wireless_adb.py"

def _derive(pw, salt):
    return hashlib.pbkdf2_hmac('sha512', pw.encode(), salt, _ITER, dklen=_KEY_BYTES)

def _unpack(blob):
    raw = base64.b64decode(blob)
    if raw[:4] != _MAGIC:
        raise ValueError('bad magic')
    rounds = raw[5]
    o = 6
    salt  = raw[o:o+_SALT_BYTES]; o += _SALT_BYTES
    nonce = raw[o:o+_NONCE_BYTES]; o += _NONCE_BYTES
    tag   = raw[o:o+_TAG_BYTES];  o += _TAG_BYTES
    return salt, nonce, rounds, tag, raw[o:]

def _aes_decrypt(key, nonce, ct, tag, aad):
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        return AESGCM(key).decrypt(nonce, ct + tag, aad)
    except ImportError:
        pass
    raise RuntimeError('Install `cryptography` (pip install cryptography) to decrypt this build.')

def _main():
    salt, nonce, rounds, tag, ct = _unpack(_BLOB)
    if sys.stdin.isatty():
        pw = getpass.getpass('🔑 Password: ')
    else:
        pw = os.environ.get('PEGASUS_PASSWORD') or ''
    key = _derive(pw, salt)
    aad = _MAGIC + bytes([1, rounds])
    try:
        payload = _aes_decrypt(key, nonce, ct, tag, aad)
    except Exception:
        print('✗ Wrong password or corrupted build.', file=sys.stderr)
        sys.exit(2)
    for _ in range(rounds):
        payload = zlib.decompress(base64.b64decode(payload))
    return payload

_DATA = _main()
exec(compile(_DATA, _ORIG, 'exec'))
