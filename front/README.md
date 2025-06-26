<h1 align="center">DataProtector - Sandbox</h1>

This [Vite.js](https://vitejs.dev/) project uses [DataProtector SDK](https://github.com/iExecBlockchainComputing/dataprotector-sdk) to showcase its methods. To learn more, please refer to [DataProtector documentation](https://tools.docs.iex.ec/tools/dataprotector).

You may also find this project on [Codesandbox](https://codesandbox.io/p/github/iExecBlockchainComputing/dataprotector-sdk/main)

Make sure to use the last [package version](https://www.npmjs.com/package/@iexec/dataprotector).

---

## Features
- **Modern Light Theme** for a clean, professional look
- **iExec DataProtector integration** for secure workflow protection
- **.gitignore** configured to prevent accidental commits of sensitive files and secrets
- **No secrets or private keys** are stored in the repository

## Installation

```sh
npm ci
```

## Running the project

```sh
npm run dev
```

---

## Security & Best Practices
- **Never commit secrets, private keys, or API keys** to the repository.
- Use a `.env` file for any local secrets or environment variables. This file is already ignored by git.
- The `.gitignore` is set up to protect you from accidentally exposing sensitive data.
- If you add new files that may contain secrets, double-check they are listed in `.gitignore`.

## Project Structure
- `src/` - Main source code (React, TypeScript)
- `src/assets/` - Images and static assets
- `src/utils/` - Utility functions
- `.gitignore` - Comprehensive ignore rules for security and cleanliness

---

## License

MIT (see LICENSE file)
