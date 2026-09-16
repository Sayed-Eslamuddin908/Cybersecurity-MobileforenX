#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "sqlite_carve.py"

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
