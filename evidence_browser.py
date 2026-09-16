#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "evidence_browser.py"

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
