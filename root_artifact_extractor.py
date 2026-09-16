#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "root_artifact_extractor.py"

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
