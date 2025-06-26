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
  const [jsonData, setJsonData] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
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
  const saveWorkflowToStorage = (address: Address, workflowName: string, workflowData: string) => {
    const dataCounts = parseWorkflowData(workflowData);
    const newWorkflow: ProtectedWorkflow = {
      address,
      name: workflowName,
      createdAt: new Date().toISOString(),
      data: dataCounts,
      authorizedUsers: [],
      jsonData: workflowData // Store the original JSON data
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

    if (!jsonData.trim()) {
      setErrorProtect('Please enter your n8n workflow and credentials data');
      return;
    }

    if (!isValidJson) {
      setErrorProtect('Please enter valid JSON data');
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
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

    const compatibleData = convertArraysToObjects(parsedData);
    const data = { n8nWorkflow: compatibleData };
    
    try {
      setLoadingProtect(true);
      const protectedWorkflowResponse =
        await iExecDataProtectorClient.core.protectData({
          data,
          name,
        });
      const newAddress = protectedWorkflowResponse.address as Address;
      setProtectedWorkflow(newAddress);
      
      // Save the workflow to localStorage
      saveWorkflowToStorage(newAddress, name || 'Unnamed Workflow', jsonData);
      
      setErrorProtect('');
    } catch (error) {
      setErrorProtect(String(error));
    }
    setLoadingProtect(false);
  };

  // Auto-fill user and app address when entering workflow-details
  useEffect(() => {
    if (currentPage === 'workflow-details') {
      // Auto-fill user address if empty
      if (!userAddress && window.ethereum) {
        window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => {
          if (accounts && accounts[0]) setUserAddress(accounts[0]);
        });
      }
      // Auto-fill app address if empty
      if (!appAddress) setAppAddress(WEB3MAIL_APP_ENS);
    }
    // eslint-disable-next-line
  }, [currentPage]);

  const grantAccessSubmit = async () => {
    setErrorGrant('');
    // Validation
    if (!protectedWorkflow) {
      setErrorGrant('No protected workflow selected.');
      return;
    }
    if (!userAddress || userAddress.trim().length === 0) {
      setErrorGrant('Please enter a user address.');
      return;
    }
    if (!appAddress || appAddress.trim().length === 0) {
      setErrorGrant('Please enter an app address.');
      return;
    }
    if (!numberOfAccess || Number(numberOfAccess) < 1) {
      setErrorGrant('Please enter a valid number of access (minimum 1).');
      return;
    }
    try {
      setLoadingGrant(true);
      checkIsConnected();
      await checkCurrentChain();
      await iExecDataProtectorClient.core.grantAccess({
        protectedData: protectedWorkflow,
        authorizedUser: userAddress,
        authorizedApp: appAddress,
        numberOfAccess: Number(numberOfAccess),
      });
      setAuthorizedUser(userAddress);
      setErrorGrant('');
    } catch (error: any) {
      setErrorGrant(error?.message || String(error));
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
  const handleJsonDataChange = (event: any) => {
    const value = event.target.value;
    setJsonData(value);
    
    if (value.trim() === '') {
      setIsValidJson(true);
      return;
    }
    
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
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
              <strong>Note:</strong> Arrays in your n8n workflow JSON will be automatically converted to objects with numeric keys, and special characters in object keys will be replaced with underscores to ensure compatibility with iExec DataProtector.
            </div>

            <div className="form-group">
              <label>n8n Workflow & Credentials JSON</label>
              <textarea
                className="form-control"
                value={jsonData}
                placeholder='{"credentials": [...], "workflows": [...]}'
                onChange={handleJsonDataChange}
                rows={8}
              />
              {!isValidJson && jsonData.trim() !== '' && (
                <div className="error-message">
                  Please enter valid JSON data
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
