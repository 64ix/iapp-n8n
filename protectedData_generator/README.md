# Protected Data Generator

Generates protected data for iExec applications by encrypting n8n credentials and workflows.

## Prerequisites

- Node.js, npm
- n8n CLI (`npm install -g n8n`)
- iExec CLI configured
- `secrets/dataProtector.key` file with your EVM private key

## Quick Start

1. **Export n8n config:**
   ```bash
   ./n8n_config_manager.sh export
   ```

2. **Generate protected data:**
   ```bash
   npm ci
   node script.js
   ```

3. **Run iExec app:**
  

   _Use PROTECTED_DATA_0x from Protected Data: { address: 0x_
   ```bash
   cd ../n8n-iapp/
   EXPERIMENTAL_TDX_APP=true iapp run APP_0x --protectedData PROTECTED_DATA_0x
   ```

## Files

- `n8n_config_manager.sh` - Export/import n8n config
- `script.js` - Protect data using iExec Data Protector
- `secrets/` - Contains credentials, workflows, and private key
