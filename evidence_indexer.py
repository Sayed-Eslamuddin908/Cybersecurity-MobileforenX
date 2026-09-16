#!/usr/bin/env python3
# ⚡ PEGASUS 4 X — AES-256-GCM ENCRYPTED BUILD
# ⚡ ENGINEERED & DESIGNED BY Sayed Eslamuddin
# Requires the password used at build time.
import base64, zlib, sys, os, getpass, hashlib, hmac
_BLOB = "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"
_MAGIC = b'PGS3'
_SALT_BYTES, _NONCE_BYTES, _KEY_BYTES, _TAG_BYTES = 16, 12, 32, 16
_ITER = 600000
_ORIG = "evidence_indexer.py"

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
