#!/usr/bin/env python3
"""
Fix Encryption Key Issue
Generates a new encryption key and provides instructions for fixing corrupted connections
"""
import os
import sys
from pathlib import Path
from cryptography.fernet import Fernet

def main():
    print("=" * 70)
    print("Aegis AI - Encryption Key Fix Utility")
    print("=" * 70)
    print()
    
    # Check if .env file exists
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if not env_path.exists():
        if env_example_path.exists():
            print("⚠️  No .env file found. Creating from .env.example...")
            with open(env_example_path, 'r') as f:
                content = f.read()
            with open(env_path, 'w') as f:
                f.write(content)
            print("✅ Created .env file from .env.example")
        else:
            print("❌ No .env or .env.example file found!")
            sys.exit(1)
    
    # Read current .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Check if ENCRYPTION_KEY is already set
    has_encryption_key = False
    key_is_placeholder = False
    
    for line in lines:
        if line.strip().startswith('ENCRYPTION_KEY='):
            has_encryption_key = True
            value = line.split('=', 1)[1].strip()
            if value in ['your_encryption_key_here', '']:
                key_is_placeholder = True
            break
    
    if has_encryption_key and not key_is_placeholder:
        print("✅ ENCRYPTION_KEY is already set in .env")
        print()
        print("If you're still seeing decryption errors, it means your connections")
        print("were encrypted with a different key.")
        print()
        print("Options:")
        print("1. Keep current key and delete/recreate corrupted connections")
        print("2. Generate a new key (will require recreating ALL connections)")
        print()
        choice = input("Generate new key? (y/N): ").strip().lower()
        if choice != 'y':
            print("\nTo clean up corrupted connections, run:")
            print("  curl -X POST http://localhost:8000/api/connections/cleanup/corrupted")
            return
    
    # Generate new encryption key
    print("\n🔑 Generating new encryption key...")
    new_key = Fernet.generate_key().decode()
    print(f"✅ Generated: {new_key[:20]}...{new_key[-20:]}")
    
    # Update .env file
    print("\n📝 Updating .env file...")
    updated_lines = []
    key_updated = False
    
    for line in lines:
        if line.strip().startswith('ENCRYPTION_KEY='):
            updated_lines.append(f'ENCRYPTION_KEY={new_key}\n')
            key_updated = True
        else:
            updated_lines.append(line)
    
    # If ENCRYPTION_KEY wasn't in the file, add it
    if not key_updated:
        updated_lines.append(f'\n# Encryption Key (auto-generated)\n')
        updated_lines.append(f'ENCRYPTION_KEY={new_key}\n')
    
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print("✅ Updated .env file with new encryption key")
    
    # Check for existing connections
    connections_path = Path("backend/data/connections.json")
    if connections_path.exists():
        print("\n⚠️  WARNING: Existing connections found!")
        print("These connections were encrypted with the old key and cannot be decrypted.")
        print()
        print("Options:")
        print("1. Delete connections.json and recreate all connections")
        print("2. Use the cleanup API endpoint after restarting the application")
        print()
        choice = input("Delete connections.json now? (y/N): ").strip().lower()
        if choice == 'y':
            connections_path.unlink()
            print("✅ Deleted connections.json")
        else:
            print("\nAfter restarting the application, run:")
            print("  curl -X POST http://localhost:8000/api/connections/cleanup/corrupted")
    
    print("\n" + "=" * 70)
    print("✅ Fix Complete!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Restart the application (docker-compose restart or ./start.sh)")
    print("2. If you have corrupted connections, either:")
    print("   - Delete and recreate them in the UI")
    print("   - Use the cleanup endpoint: POST /api/connections/cleanup/corrupted")
    print()

if __name__ == "__main__":
    main()