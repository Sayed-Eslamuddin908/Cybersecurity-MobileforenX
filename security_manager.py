#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "security_manager.py"

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
