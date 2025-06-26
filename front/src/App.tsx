import { useState, useEffect } from 'react';
import { Address, IExecDataProtector } from '@iexec/dataprotector';
import {
  AddressOrEnsName,
  checkCurrentChain,
  checkIsConnected,
  IEXEC_EXPLORER_URL,
  WEB3MAIL_APP_ENS,
} from './utils/utils.ts';
import './App.css';
import loader from './assets/loader.gif';
import successIcon from './assets/success.png';

const iExecDataProtectorClient = new IExecDataProtector(window.ethereum,{
  iexecOptions: {
    smsURL: 'https://sms.labs.iex.ec',
  },
});

type Page = 'welcome' | 'protect' | 'view' | 'workflow-details';

interface ProtectedWorkflow {
  address: Address;
  name: string;
  createdAt: string;
  data: any;
  authorizedUsers: string[];
  jsonData?: string; // Store the original JSON data
}

export default function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProtectedWorkflow | null>(null);
  
  // Global state
  const [protectedWorkflow, setProtectedWorkflow] = useState<Address | ''>('');
  const [authorizedUser, setAuthorizedUser] = useState<AddressOrEnsName | ''>('');
  const [authorizedApp, setAuthorizedApp] = useState<AddressOrEnsName | ''>('');
  const [protectedWorkflows, setProtectedWorkflows] = useState<ProtectedWorkflow[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);

  // Loading and error states
  const [loadingProtect, setLoadingProtect] = useState(false);
  const [errorProtect, setErrorProtect] = useState('');
  const [loadingGrant, setLoadingGrant] = useState(false);
  const [errorGrant, setErrorGrant] = useState('');
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [errorRevoke, setErrorRevoke] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [credentialsJson, setCredentialsJson] = useState('');
  const [workflowsJson, setWorkflowsJson] = useState('');
  const [isValidCredentials, setIsValidCredentials] = useState(true);
  const [isValidWorkflows, setIsValidWorkflows] = useState(true);
  const [numberOfAccess, setNumberOfAccess] = useState<number>(1);
  const [userAddress, setUserAddress] = useState<AddressOrEnsName>('');
  const [appAddress, setAppAddress] = useState<AddressOrEnsName>('');
  const [revokeAccess, setRevokeAccess] = useState('');

  const loadProtectedWorkflows = async () => {
    setLoadingWorkflows(true);
    try {
      checkIsConnected();
      await checkCurrentChain();
      
      // Get the current user's address
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const userAddress = accounts[0];
      const appAddress = accounts[1];
      
      // Load workflows from localStorage only (no duplicates)
      const workflows: ProtectedWorkflow[] = [];
      
      const storedWorkflows = localStorage.getItem('protectedWorkflows');
      if (storedWorkflows) {
        try {
          const parsed = JSON.parse(storedWorkflows);
          workflows.push(...parsed);
        } catch (error) {
          console.error('Error parsing stored workflows:', error);
        }
      }
      
      // Remove duplicates based on address
      const uniqueWorkflows = workflows.filter((workflow, index, self) => 
        index === self.findIndex(w => w.address === workflow.address)
      );
      
      setProtectedWorkflows(uniqueWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setProtectedWorkflows([]);
    }
    setLoadingWorkflows(false);
  };

  // Function to parse workflow data and count credentials/workflows
  const parseWorkflowData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      const credentialsCount = parsed.credentials ? (Array.isArray(parsed.credentials) ? parsed.credentials.length : 1) : 0;
      const workflowsCount = parsed.workflows ? (Array.isArray(parsed.workflows) ? parsed.workflows.length : 1) : 0;
      return { credentials: credentialsCount, workflows: workflowsCount };
    } catch (error) {
      console.error('Error parsing workflow data:', error);
      return { credentials: 0, workflows: 0 };
    }
  };

  // Function to save workflow to localStorage when protected
  const saveWorkflowToStorage = (address: Address, workflowName: string, credentialsData: string, workflowsData: string) => {
    // Combine credentials and workflows into the final format
    const combinedData = JSON.stringify({
      credentials: JSON.parse(credentialsData),
      workflows: JSON.parse(workflowsData)
    });
    
    const dataCounts = parseWorkflowData(combinedData);
    const newWorkflow: ProtectedWorkflow = {
      address,
      name: workflowName,
      createdAt: new Date().toISOString(),
      data: dataCounts,
      authorizedUsers: [],
      jsonData: combinedData // Store the combined JSON data
    };
    
    const storedWorkflows = localStorage.getItem('protectedWorkflows');
    let workflows: ProtectedWorkflow[] = [];
    
    if (storedWorkflows) {
      try {
        workflows = JSON.parse(storedWorkflows);
      } catch (error) {
        console.error('Error parsing stored workflows:', error);
      }
    }
    
    // Check if workflow already exists to prevent duplicates
    const existingIndex = workflows.findIndex(w => w.address === address);
    if (existingIndex !== -1) {
      // Update existing workflow
      workflows[existingIndex] = newWorkflow;
    } else {
      // Add new workflow
      workflows.push(newWorkflow);
    }
    
    // Save back to localStorage
    localStorage.setItem('protectedWorkflows', JSON.stringify(workflows));
  };

  const protectWorkflowSubmit = async () => {
    setErrorProtect('');

    try {
      checkIsConnected();
      await checkCurrentChain();
    } catch (err) {
      setErrorProtect('Please install MetaMask');
      return;
    }

    if (!credentialsJson.trim() || !workflowsJson.trim()) {
      setErrorProtect('Please enter your credentials and workflows data');
      return;
    }

    if (!isValidCredentials || !isValidWorkflows) {
      setErrorProtect('Please enter valid JSON data');
      return;
    }

    let parsedCredentials, parsedWorkflows;
    try {
      parsedCredentials = JSON.parse(credentialsJson);
      parsedWorkflows = JSON.parse(workflowsJson);
    } catch (error) {
      setErrorProtect('Invalid JSON format');
      return;
    }

    // Convert arrays to objects to make it compatible with iExec DataProtector
    const convertArraysToObjects = (obj: any): any => {
      if (Array.isArray(obj)) {
        const result: any = {};
        obj.forEach((item, index) => {
          result[index.toString()] = convertArraysToObjects(item);
        });
        return result;
      } else if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            // Sanitize the key to remove special characters
            const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
            result[sanitizedKey] = convertArraysToObjects(obj[key]);
          }
        }
        return result;
      }
      return obj;
    };

    const compatibleCredentials = convertArraysToObjects(parsedCredentials);
    const compatibleWorkflows = convertArraysToObjects(parsedWorkflows);
    
    // Create the combined data structure
    const combinedData = {
      credentials: compatibleCredentials,
      workflows: compatibleWorkflows
    };
    
    const data = { n8nWorkflow: combinedData };
    
    try {
      setLoadingProtect(true);
      const protectedWorkflowResponse =
        await iExecDataProtectorClient.core.protectData({
          data,
          name,
        });
      const newAddress = protectedWorkflowResponse.address as Address;
      setProtectedWorkflow(newAddress);
      
      // Save the workflow to localStorage with combined data
      saveWorkflowToStorage(newAddress, name || 'Unnamed Workflow', credentialsJson, workflowsJson);
      
      setErrorProtect('');
    } catch (error) {
      setErrorProtect(String(error));
    }
    setLoadingProtect(false);
  };

  const grantAccessSubmit = async () => {
    setErrorGrant('');
    try {
      checkIsConnected();
      await checkCurrentChain();
    } catch (err) {
      setErrorGrant('Please install MetaMask');
      return;
    }

    if (!userAddress) {
      setErrorGrant('Please enter a user address');
      return;
    }
    if (!appAddress) {
      setErrorGrant('Please enter a user address');
      return;
    }
    try {
      setLoadingGrant(true);
      await iExecDataProtectorClient.core.grantAccess({
        protectedData: protectedWorkflow,
        authorizedUser: userAddress,
        authorizedApp: appAddress,
        numberOfAccess,
      });
      setAuthorizedUser(userAddress);
      setAppAddress(appAddress);
    } catch (error) {
      setErrorGrant(String(error));
    }
    setLoadingGrant(false);
  };

  const revokeAccessSubmit = async () => {
    setRevokeAccess('');
    try {
      checkIsConnected();
      await checkCurrentChain();
    } catch (err) {
      setErrorRevoke('Please install MetaMask');
      return;
    }

    try {
      setLoadingRevoke(true);
      const allGrantedAccess =
        await iExecDataProtectorClient.core.getGrantedAccess({
          protectedData: protectedWorkflow,
          authorizedUser,
          authorizedApp: WEB3MAIL_APP_ENS,
        });
      if (allGrantedAccess.count === 0) {
        throw new Error('No access to revoke');
      }
      const { txHash } = await iExecDataProtectorClient.core.revokeOneAccess(
        allGrantedAccess.grantedAccess[0]
      );
      setRevokeAccess(txHash);
    } catch (error) {
      setErrorRevoke(String(error));
      setRevokeAccess('');
    }
    setLoadingRevoke(false);
  };

  // Handlers
  const handleCredentialsJsonChange = (event: any) => {
    const value = event.target.value;
    setCredentialsJson(value);
    
    if (value.trim() === '') {
      setIsValidCredentials(true);
      return;
    }
    
    try {
      JSON.parse(value);
      setIsValidCredentials(true);
    } catch (error) {
      setIsValidCredentials(false);
    }
  };

  const handleWorkflowsJsonChange = (event: any) => {
    const value = event.target.value;
    setWorkflowsJson(value);
    
    if (value.trim() === '') {
      setIsValidWorkflows(true);
      return;
    }
    
    try {
      JSON.parse(value);
      setIsValidWorkflows(true);
    } catch (error) {
      setIsValidWorkflows(false);
    }
  };

  const handleNameChange = (event: any) => {
    setName(event.target.value);
  };

  const handleNumberOfAccessChange = (event: any) => {
    setNumberOfAccess(event.target.value);
  };

  const shareWithYourself = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setUserAddress(accounts[0]);
      setAppAddress(accounts[1]);
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    if (page === 'view') {
      loadProtectedWorkflows();
    }
  };

  // Function to handle Manage Access button click
  const handleManageAccess = (workflow: ProtectedWorkflow) => {
    // Set the current workflow for access management
    setProtectedWorkflow(workflow.address);
    setName(workflow.name);
    setAuthorizedUser('');
    setRevokeAccess('');
    
    // Navigate to protect page
    navigateTo('protect');
  };

  // Function to handle workflow details navigation
  const handleWorkflowDetails = (workflow: ProtectedWorkflow) => {
    setSelectedWorkflow(workflow);
    setProtectedWorkflow(workflow.address);
    setName(workflow.name);
    setAuthorizedUser('');
    setRevokeAccess('');
    
    // Navigate to workflow details page
    navigateTo('workflow-details');
  };

  // Function to handle Deploy Workflow button
  const handleDeployWorkflow = () => {
    // TODO: Implement workflow deployment functionality
    alert('Workflow deployment functionality will be implemented soon!');
  };

  // Welcome Page
  if (currentPage === 'welcome') {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">🔐</div>
          <h1>iExec n8n Workflow Protector</h1>
          <p>Secure your n8n workflows and credentials on the blockchain</p>
        </div>

        <div className="content">
          <div className="welcome-section">
            <div className="hero-content">
              <h2>Welcome to the Future of Workflow Security</h2>
              <p className="hero-description">
                Protect your n8n workflows and sensitive credentials using blockchain technology. 
                With iExec DataProtector, your automation workflows are secured with decentralized 
                access control, ensuring only authorized users can access your data.
              </p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Blockchain Security</h3>
                  <p>Your workflows are encrypted and stored on the blockchain with military-grade security</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">👥</div>
                  <h3>Access Control</h3>
                  <p>Grant and revoke access to specific users with fine-grained permissions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Instant Protection</h3>
                  <p>Protect your workflows instantly with just a few clicks</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🌐</div>
                  <h3>Decentralized</h3>
                  <p>No single point of failure - your data is distributed across the network</p>
                </div>
              </div>

              <div className="cta-buttons">
                <button className="btn btn-primary" onClick={() => navigateTo('protect')}>
                  🔒 Protect New Workflow
                </button>
                <button className="btn btn-secondary" onClick={() => navigateTo('view')}>
                  📋 View Protected Workflows
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          <p>Powered by iExec - Decentralized Cloud Computing Platform</p>
          <p>📍 Lyon, France</p>
        </div>
      </div>
    );
  }

  // Protect Workflow Page
  if (currentPage === 'protect') {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">🔐</div>
          <h1>iExec n8n Workflow Protector</h1>
          <p>Secure your n8n workflows and credentials on the blockchain</p>
        </div>

        <div className="content">
          <div className="navigation-bar">
            <button className="nav-btn" onClick={() => navigateTo('welcome')}>
              🏠 Home
            </button>
            <button className="nav-btn active" onClick={() => navigateTo('protect')}>
              🔒 Protect Workflow
            </button>
            <button className="nav-btn" onClick={() => navigateTo('view')}>
              📋 View Workflows
            </button>
          </div>

          <div className="section">
            <h2>Protect Your n8n Workflow</h2>
            
            {protectedWorkflow && (
              <div className="info-box">
                <strong>Managing Access for:</strong> {name} ({protectedWorkflow})
              </div>
            )}
            
            <div className="info-box">
              <strong>Note:</strong> Enter your n8n credentials and workflows in separate JSON blocks. 
              The system will automatically combine them into the format: <code>{'{"credentials": [...], "workflows": [...]}'}</code>
              <br />
              Arrays in your JSON will be automatically converted to objects with numeric keys, and special characters in object keys will be replaced with underscores to ensure compatibility with iExec DataProtector.
            </div>

            <div className="form-group">
              <label>Credentials JSON</label>
              <textarea
                className="form-control"
                value={credentialsJson}
                placeholder='[{"name": "My Credential", "type": "httpBasicAuth", "data": {...}}]'
                onChange={handleCredentialsJsonChange}
                rows={8}
              />
              {!isValidCredentials && credentialsJson.trim() !== '' && (
                <div className="error-message">
                  Please enter valid credentials JSON data
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Workflows JSON</label>
              <textarea
                className="form-control"
                value={workflowsJson}
                placeholder='[{"name": "My Workflow", "nodes": [...], "connections": {...}}]'
                onChange={handleWorkflowsJsonChange}
                rows={8}
              />
              {!isValidWorkflows && workflowsJson.trim() !== '' && (
                <div className="error-message">
                  Please enter valid workflows JSON data
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Workflow Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                placeholder="Enter a name for your protected workflow"
                onChange={handleNameChange}
              />
            </div>

            {errorProtect && (
              <div className="error-message">
                <h6>Protection failed</h6>
                {errorProtect}
              </div>
            )}

            {!loadingProtect ? (
              <button className="btn" onClick={protectWorkflowSubmit}>
                🔒 Protect Workflow
              </button>
            ) : (
              <div className="loading">
                <img src={loader} alt="loading" />
                Protecting your workflow...
              </div>
            )}

            {protectedWorkflow && !errorProtect && (
              <div className="success-message">
                <img src={successIcon} alt="success" />
                <div>
                  <strong>Your n8n workflow has been protected!</strong>
                  <br />
                  <a
                    href={IEXEC_EXPLORER_URL + protectedWorkflow}
                    className="link"
                    rel="noreferrer"
                    target="_blank"
                  >
                    View on iExec Explorer →
                  </a>
                  <div className="address-display">
                    {protectedWorkflow}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grant Access Section */}
          {protectedWorkflow && (
            <div className="section">
              <h2>Grant Access to Workflow</h2>
              
              <div className="form-group">
                <label>Protected Workflow Address</label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={protectedWorkflow}
                />
              </div>

              <div className="form-group">
                <label>Number of Access</label>
                <input
                  type="number"
                  className="form-control"
                  value={numberOfAccess}
                  placeholder="Allowed Access Count"
                  min={1}
                  onChange={handleNumberOfAccessChange}
                />
              </div>

              <div className="form-group">
                <label>User Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={userAddress}
                  placeholder="Enter wallet address to grant access"
                  onChange={(event) => setUserAddress(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>App Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={appAddress}
                  placeholder="Enter app address to grant access"
                  onChange={(event) => setAppAddress(event.target.value)}
                />
              </div>

              <div className="info-box">
                For testing, you can{' '}
                <button type="button" className="btn btn-secondary" onClick={shareWithYourself}>
                  Use Your Own Wallet
                </button>
              </div>

              {!loadingGrant ? (
                <button className="btn" onClick={grantAccessSubmit}>
                  🔑 Grant Access
                </button>
              ) : (
                <div className="loading">
                  <img src={loader} alt="loading" />
                  Granting access...
                </div>
              )}

              {errorGrant && (
                <div className="error-message">
                  <h6>Grant Access failed</h6>
                  {errorGrant}
                </div>
              )}

              {authorizedUser && !errorGrant && (
                <div className="success-message">
                  <img src={successIcon} alt="success" />
                  Access successfully granted to {authorizedUser}
                </div>
              )}
            </div>
          )}

          {/* Revoke Access Section */}
          {protectedWorkflow && authorizedUser && (
            <div className="section">
              <h2>Revoke Access to Workflow</h2>
              
              <div className="form-group">
                <label>Protected Workflow Address</label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={protectedWorkflow}
                />
              </div>

              {!loadingRevoke ? (
                <button className="btn btn-secondary" onClick={revokeAccessSubmit}>
                  🚫 Revoke Access
                </button>
              ) : (
                <div className="loading">
                  <img src={loader} alt="loading" />
                  Revoking access...
                </div>
              )}

              {revokeAccess && !errorRevoke && (
                <div className="success-message">
                  <img src={successIcon} alt="success" />
                  Access successfully revoked
                </div>
              )}

              {errorRevoke && (
                <div className="error-message">
                  <h6>Revoke Access failed</h6>
                  {errorRevoke}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="footer">
          <p>Powered by iExec - Decentralized Cloud Computing Platform</p>
          <p>📍 Lyon, France</p>
        </div>
      </div>
    );
  }

  // View Protected Workflows Page
  if (currentPage === 'view') {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">🔐</div>
          <h1>iExec n8n Workflow Protector</h1>
          <p>Secure your n8n workflows and credentials on the blockchain</p>
        </div>

        <div className="content">
          <div className="navigation-bar">
            <button className="nav-btn" onClick={() => navigateTo('welcome')}>
              🏠 Home
            </button>
            <button className="nav-btn" onClick={() => navigateTo('protect')}>
              🔒 Protect Workflow
            </button>
            <button className="nav-btn active" onClick={() => navigateTo('view')}>
              📋 View Workflows
            </button>
          </div>

          <div className="section">
            <h2>Your Protected Workflows</h2>
            
            {loadingWorkflows ? (
              <div className="loading">
                <img src={loader} alt="loading" />
                Loading your protected workflows...
              </div>
            ) : protectedWorkflows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Protected Workflows Found</h3>
                <p>You haven't protected any workflows yet. Start by protecting your first n8n workflow!</p>
                <button className="btn" onClick={() => navigateTo('protect')}>
                  🔒 Protect Your First Workflow
                </button>
              </div>
            ) : (
              <div className="workflows-grid">
                {protectedWorkflows.map((workflow, index) => (
                  <div key={index} className="workflow-card">
                    <div className="workflow-header">
                      <h3>{workflow.name}</h3>
                      <span className="workflow-status">🔒 Protected</span>
                    </div>
                    
                    <div className="workflow-details">
                      <div className="detail-item">
                        <label>Address:</label>
                        <div className="address-display">
                          {workflow.address}
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <label>Created:</label>
                        <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="detail-item">
                        <label>Credentials:</label>
                        <span>{workflow.data.credentials} items</span>
                      </div>
                      
                      <div className="detail-item">
                        <label>Workflows:</label>
                        <span>{workflow.data.workflows} items</span>
                      </div>
                      
                      <div className="detail-item">
                        <label>Authorized Users:</label>
                        <span>{workflow.authorizedUsers.length} users</span>
                      </div>
                    </div>
                    
                    <div className="workflow-actions">
                      <a
                        href={IEXEC_EXPLORER_URL + workflow.address}
                        className="btn btn-secondary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        🔍 View on Explorer
                      </a>
                      <button className="btn" onClick={() => handleWorkflowDetails(workflow)}>
                        📋 View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="footer">
          <p>Powered by iExec - Decentralized Cloud Computing Platform</p>
          <p>📍 Lyon, France</p>
        </div>
      </div>
    );
  }

  // Workflow Details Page
  if (currentPage === 'workflow-details' && selectedWorkflow) {
    return (
      <div className="container">
        <div className="header">
          <div className="logo">🔐</div>
          <h1>iExec n8n Workflow Protector</h1>
          <p>Secure your n8n workflows and credentials on the blockchain</p>
        </div>

        <div className="content">
          <div className="navigation-bar">
            <button className="nav-btn" onClick={() => navigateTo('welcome')}>
              🏠 Home
            </button>
            <button className="nav-btn" onClick={() => navigateTo('protect')}>
              🔒 Protect Workflow
            </button>
            <button className="nav-btn" onClick={() => navigateTo('view')}>
              📋 View Workflows
            </button>
            <button className="nav-btn active">
              📋 Workflow Details
            </button>
          </div>

          {/* Workflow Overview Section */}
          <div className="section">
            <h2>Workflow Overview</h2>
            
            <div className="workflow-overview">
              <div className="workflow-header-large">
                <h3>{selectedWorkflow.name}</h3>
                <span className="workflow-status">🔒 Protected</span>
              </div>
              
              <div className="workflow-stats-grid">
                <div className="stat-item">
                  <label>Blockchain Address:</label>
                  <div className="address-display">
                    {selectedWorkflow.address}
                  </div>
                </div>
                
                <div className="stat-item">
                  <label>Created:</label>
                  <span>{new Date(selectedWorkflow.createdAt).toLocaleString()}</span>
                </div>
                
                <div className="stat-item">
                  <label>Credentials:</label>
                  <span>{selectedWorkflow.data.credentials} items</span>
                </div>
                
                <div className="stat-item">
                  <label>Workflows:</label>
                  <span>{selectedWorkflow.data.workflows} items</span>
                </div>
                
                <div className="stat-item">
                  <label>Authorized Users:</label>
                  <span>{selectedWorkflow.authorizedUsers.length} users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Data Section */}
          {selectedWorkflow.jsonData && (
            <div className="section">
              <h2>Workflow Data</h2>
              
              <div className="form-group">
                <label>Original JSON Data</label>
                <textarea
                  className="form-control"
                  value={selectedWorkflow.jsonData}
                  rows={12}
                  readOnly
                />
              </div>
              
              <div className="workflow-actions">
                <a
                  href={IEXEC_EXPLORER_URL + selectedWorkflow.address}
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  🔍 View on Explorer
                </a>
                <button className="btn btn-primary" onClick={handleDeployWorkflow}>
                  🚀 Deploy Workflow
                </button>
              </div>
            </div>
          )}

          {/* Access Management Section */}
          <div className="section">
            <h2>Access Management</h2>
            
            <div className="form-group">
              <label>Protected Workflow Address</label>
              <input
                type="text"
                className="form-control"
                disabled
                value={selectedWorkflow.address}
              />
            </div>

            <div className="form-group">
              <label>Number of Access</label>
              <input
                type="number"
                className="form-control"
                value={numberOfAccess}
                placeholder="Allowed Access Count"
                min={1}
                onChange={handleNumberOfAccessChange}
              />
            </div>

            <div className="form-group">
              <label>User Address</label>
              <input
                type="text"
                className="form-control"
                value={userAddress}
                placeholder="Enter wallet address to grant access"
                onChange={(event) => setUserAddress(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>App Address</label>
              <input
                type="text"
                className="form-control"
                value={appAddress}
                placeholder="Enter app address to grant access"
                onChange={(event) => setAppAddress(event.target.value)}
              />
            </div>

            <div className="info-box">
              For testing, you can{' '}
              <button type="button" className="btn btn-secondary" onClick={shareWithYourself}>
                Use Your Own Wallet
              </button>
            </div>

            {!loadingGrant ? (
              <button className="btn" onClick={grantAccessSubmit}>
                🔑 Grant Access
              </button>
            ) : (
              <div className="loading">
                <img src={loader} alt="loading" />
                Granting access...
              </div>
            )}

            {errorGrant && (
              <div className="error-message">
                <h6>Grant Access failed</h6>
                {errorGrant}
              </div>
            )}

            {authorizedUser && !errorGrant && (
              <div className="success-message">
                <img src={successIcon} alt="success" />
                Access successfully granted to {authorizedUser}
              </div>
            )}
          </div>

          {/* Revoke Access Section */}
          {authorizedUser && (
            <div className="section">
              <h2>Revoke Access</h2>
              
              <div className="form-group">
                <label>Protected Workflow Address</label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={selectedWorkflow.address}
                />
              </div>

              {!loadingRevoke ? (
                <button className="btn btn-secondary" onClick={revokeAccessSubmit}>
                  🚫 Revoke Access
                </button>
              ) : (
                <div className="loading">
                  <img src={loader} alt="loading" />
                  Revoking access...
                </div>
              )}

              {revokeAccess && !errorRevoke && (
                <div className="success-message">
                  <img src={successIcon} alt="success" />
                  Access successfully revoked
                </div>
              )}

              {errorRevoke && (
                <div className="error-message">
                  <h6>Revoke Access failed</h6>
                  {errorRevoke}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="footer">
          <p>Powered by iExec - Decentralized Cloud Computing Platform</p>
          <p>📍 Lyon, France</p>
        </div>
      </div>
    );
  }

  return null;
}
