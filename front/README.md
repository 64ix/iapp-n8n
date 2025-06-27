# iExec n8n Workflow Protector

A React TypeScript application that secures n8n workflows and credentials on the blockchain using iExec DataProtector.

## 🚀 Features

- **Blockchain Security**: Protect workflows with military-grade encryption on the blockchain
- **Access Control**: Grant and revoke access to specific users with fine-grained permissions
- **Separate Input Fields**: Credentials and workflows are handled in separate JSON blocks
- **Page State Management**: URL-based navigation that persists on refresh
- **Modular Architecture**: Clean separation of concerns with reusable components
- **Modern UI**: Beautiful, responsive design with glassmorphism effects

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Application header
│   ├── Navigation.tsx  # Navigation bar
│   └── Footer.tsx      # Application footer
├── pages/              # Page components
│   ├── WelcomePage.tsx # Welcome/landing page
│   ├── ProtectPage.tsx # Workflow protection page
│   ├── ViewPage.tsx    # View protected workflows
│   └── WorkflowDetailsPage.tsx # Workflow details and access management
├── services/           # Business logic and external services
│   ├── iexecService.ts # iExec DataProtector operations
│   └── storageService.ts # Local storage management
├── hooks/              # Custom React hooks
│   └── usePageState.ts # Page state management with URL persistence
├── utils/              # Utility functions
│   ├── utils.ts        # General utilities
│   └── workflowUtils.ts # Workflow-specific utilities
├── types/              # TypeScript type definitions
│   └── index.ts        # All application types and interfaces
└── App.tsx             # Main application component
```

## 🛠️ Key Components

### Services

- **IExecService**: Handles all blockchain operations (protect, grant access, revoke access)
- **StorageService**: Manages localStorage operations for workflow persistence

### Hooks

- **usePageState**: Custom hook for URL-based page state management that persists on refresh

### Pages

- **WelcomePage**: Landing page with feature overview and navigation
- **ProtectPage**: Form for protecting new workflows with separate credentials/workflows inputs
- **ViewPage**: Grid view of all protected workflows
- **WorkflowDetailsPage**: Detailed view with access management capabilities

## 🔧 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🎯 Usage

### Protecting a Workflow

1. Navigate to the "Protect Workflow" page
2. Enter your n8n credentials in the "Credentials JSON" field
3. Enter your n8n workflows in the "Workflows JSON" field
4. Provide a name for your workflow
5. Click "Protect Workflow" to secure it on the blockchain

### Managing Access

1. After protecting a workflow, use the "Grant Access" section
2. Enter the user's wallet address and app address
3. Set the number of allowed access attempts
4. Click "Grant Access" to authorize the user

### Viewing Protected Workflows

1. Navigate to "View Workflows" to see all your protected workflows
2. Click "View Details" on any workflow for detailed information
3. Use the "View on Explorer" link to see the workflow on iExec Explorer

## 🔗 URL Structure

The application uses URL parameters for page state management:

- `/` or `/?page=welcome` - Welcome page
- `/?page=protect` - Protect workflow page
- `/?page=view` - View workflows page
- `/?page=workflow-details` - Workflow details page

This ensures that page state persists when refreshing the browser.

## 🎨 Design Features

- **Glassmorphism**: Modern glass-like UI elements with backdrop blur
- **Gradient Backgrounds**: Beautiful gradient backgrounds and text effects
- **Responsive Design**: Fully responsive across all device sizes
- **Smooth Animations**: Hover effects and transitions for better UX
- **Color-coded Messages**: Different styles for success, error, and info messages

## 🔒 Security Features

- **Blockchain Protection**: All workflows are encrypted and stored on the blockchain
- **Access Control**: Fine-grained permission system for workflow access
- **Data Validation**: Comprehensive JSON validation for input data
- **Error Handling**: Robust error handling with user-friendly messages

## 🚀 Deployment

The application is built with Vite and can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📝 Dependencies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **@iexec/dataprotector**: iExec DataProtector SDK
- **MetaMask**: Wallet integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub or contact the development team.
