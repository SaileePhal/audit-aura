# Encryption Key Fix Guide

## Problem

You're seeing an error like:
```
Connection test failed: Test failed: Failed to decrypt configuration: Failed to decrypt data:
```

## Root Cause

This error occurs when the `ENCRYPTION_KEY` environment variable is not set or has changed. The application generates a new random encryption key on each startup when `ENCRYPTION_KEY` is not configured, which means previously encrypted connection credentials cannot be decrypted.

## Solution

### Quick Fix (Recommended)

Run the automated fix script:

```bash
python tests/fix_encryption_key.py
```

This script will:
1. Generate a new encryption key
2. Update your `.env` file
3. Provide options to clean up corrupted connections

### Manual Fix

#### Option 1: Set a Persistent Encryption Key

1. **Generate a new encryption key:**
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

2. **Add it to your `.env` file:**
   ```bash
   ENCRYPTION_KEY=your_generated_key_here
   ```

3. **Restart the application:**
   ```bash
   docker-compose restart
   # or
   ./start.sh
   ```

4. **Clean up corrupted connections:**
   - Option A: Delete and recreate connections in the UI
   - Option B: Use the cleanup API endpoint:
     ```bash
     curl -X POST http://localhost:8000/api/connections/cleanup/corrupted
     ```

#### Option 2: Delete Existing Connections

If you don't have many connections or don't mind recreating them:

1. **Stop the application:**
   ```bash
   docker-compose down
   ```

2. **Delete the connections file:**
   ```bash
   rm backend/data/connections.json
   ```

3. **Generate and set encryption key (see Option 1, steps 1-2)**

4. **Restart the application:**
   ```bash
   ./start.sh
   ```

5. **Recreate your connections in the UI**

## Prevention

To prevent this issue in the future:

1. **Always set `ENCRYPTION_KEY` in your `.env` file** before creating connections
2. **Never commit your `.env` file** to version control (it's in `.gitignore`)
3. **Back up your encryption key** securely if you have important connections
4. **Use the same encryption key** across all environments where you want to share connection data

## API Endpoints

### Cleanup Corrupted Connections

Remove all connections that cannot be decrypted:

```bash
POST /api/connections/cleanup/corrupted
```

Example:
```bash
curl -X POST http://localhost:8000/api/connections/cleanup/corrupted
```

Response:
```json
{
  "message": "Removed 1 corrupted connection(s)",
  "removed_count": 1
}
```

## Technical Details

### How Encryption Works

1. When you create a connection, the credentials are encrypted using the `ENCRYPTION_KEY`
2. The encrypted data is stored in `backend/data/connections.json`
3. When you test or use a connection, the credentials are decrypted using the same key
4. If the key changes, decryption fails

### Encryption Service

The encryption service (`backend/infrastructure/security/encryption.py`) uses the Fernet symmetric encryption scheme from the `cryptography` library:

- **Algorithm:** AES-128 in CBC mode with PKCS7 padding
- **Key derivation:** PBKDF2-HMAC-SHA256
- **Authentication:** HMAC-SHA256

### Key Generation

The encryption key is a base64-encoded 32-byte random value:

```python
from cryptography.fernet import Fernet
key = Fernet.generate_key()  # Returns bytes like b'...'
key_str = key.decode()        # Convert to string for .env
```

## Troubleshooting

### "ENCRYPTION_KEY is already set but still getting errors"

This means your connections were encrypted with a different key. You have two options:

1. **Keep current key:** Delete corrupted connections and recreate them
2. **Use old key:** If you have the old key, restore it in `.env`

### "Can't find .env file"

Create one from the example:
```bash
cp .env.example .env
```

Then run the fix script:
```bash
python tests/fix_encryption_key.py
```

### "Script fails with import error"

Make sure you have the required dependencies:
```bash
pip install cryptography
```

Or if using Docker:
```bash
docker-compose exec backend pip install cryptography
```

## Related Files

- [`backend/infrastructure/security/encryption.py`](../../backend/infrastructure/security/encryption.py) - Encryption service implementation
- [`backend/infrastructure/cloud/connection_manager.py`](../../backend/infrastructure/cloud/connection_manager.py) - Connection management with encryption
- [`backend/routers/connections.py`](../../backend/routers/connections.py) - API endpoints for connections
- [`fix_encryption_key.py`](../../tests/fix_encryption_key.py) - Automated fix script
- [`.env.example`](../../.env.example) - Environment variable template

## See Also

- [Connection Management Documentation](../features/DYNAMIC_CLOUD_CONNECTIONS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)