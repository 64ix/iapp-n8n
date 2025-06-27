import React, { useState, useEffect } from 'react';
import { Page, ProtectedWorkflow, WorkflowFormData, AccessFormData, LoadingStates, ErrorStates } from './types';
import { usePageState } from './hooks/usePageState';
import { IExecService } from './services/iexecService';
import { StorageService } from './services/storageService';
import { convertArraysToObjects, validateJson, createProtectedWorkflow } from './utils/workflowUtils';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { WelcomePage } from './pages/WelcomePage';
import { ProtectPage } from './pages/ProtectPage';
import { ViewPage } from './pages/ViewPage';
import { WorkflowDetailsPage } from './pages/WorkflowDetailsPage';
import { WEB3MAIL_APP_ENS, IEXEC_EXPLORER_URL } from './utils/utils';
import './App.css';
import loader from './assets/loader.gif';
import successIcon from './assets/success.png';

export default function App() {
  const { currentPage, navigateTo } = usePageState();
  
  // State management
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProtectedWorkflow | null>(null);
  const [protectedWorkflow, setProtectedWorkflow] = useState<string>('');
  const [protectedWorkflows, setProtectedWorkflows] = useState<ProtectedWorkflow[]>([]);
  
  // Form states
  const [workflowForm, setWorkflowForm] = useState<WorkflowFormData>({
    name: '',
    credentialsJson: '',
    workflowsJson: '',
    isValidCredentials: true,
    isValidWorkflows: true
  });
  
  const [accessForm, setAccessForm] = useState<AccessFormData>({
    userAddress: '',
    appAddress: WEB3MAIL_APP_ENS,
    numberOfAccess: 1
  });
  
  // Loading and error states
  const [loading, setLoading] = useState<LoadingStates>({
    protect: false,
    grant: false,
    revoke: false,
    workflows: false
  });
  
  const [errors, setErrors] = useState<ErrorStates>({
    protect: '',
    grant: '',
    revoke: ''
  });
  
  const [revokeAccess, setRevokeAccess] = useState('');
  const [authorizedUser, setAuthorizedUser] = useState<string>('');

  // Load workflows when entering view page
  useEffect(() => {
    if (currentPage === 'view') {
      loadProtectedWorkflows();
    }
  }, [currentPage]);

  // Auto-fill user address when entering workflow-details
  useEffect(() => {
    if (currentPage === 'workflow-details' && !accessForm.userAddress) {
      IExecService.getCurrentUserAddress().then(address => {
        setAccessForm(prev => ({ ...prev, userAddress: address }));
      }).catch(console.error);
    }
  }, [currentPage, accessForm.userAddress]);

  const loadProtectedWorkflows = async () => {
    setLoading(prev => ({ ...prev, workflows: true }));
    try {
      const workflows = StorageService.loadProtectedWorkflows();
      setProtectedWorkflows(workflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setProtectedWorkflows([]);
    }
    setLoading(prev => ({ ...prev, workflows: false }));
  };

  const protectWorkflowSubmit = async () => {
    setErrors(prev => ({ ...prev, protect: '' }));
    
    // Validation
    if (!workflowForm.name.trim()) {
      setErrors(prev => ({ ...prev, protect: 'Please enter a workflow name' }));
      return;
    }
    
    if (!workflowForm.credentialsJson.trim() || !workflowForm.workflowsJson.trim()) {
      setErrors(prev => ({ ...prev, protect: 'Please enter both credentials and workflows data' }));
      return;
    }
    
    if (!workflowForm.isValidCredentials || !workflowForm.isValidWorkflows) {
      setErrors(prev => ({ ...prev, protect: 'Please enter valid JSON data' }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, protect: true }));
      
      // Parse and convert data
      const parsedCredentials = JSON.parse(workflowForm.credentialsJson);
      const parsedWorkflows = JSON.parse(workflowForm.workflowsJson);
      
      const compatibleCredentials = convertArraysToObjects(parsedCredentials);
      const compatibleWorkflows = convertArraysToObjects(parsedWorkflows);
      
      // Create combined data structure
      const combinedData = {
        credentials: compatibleCredentials,
        workflow: compatibleWorkflows
      };
      
      const data = { n8nWorkflow: combinedData };
      
      // Protect the workflow
      const newAddress = await IExecService.protectWorkflow(data, workflowForm.name);
      setProtectedWorkflow(newAddress);
      
      // Save to storage
      const workflow = createProtectedWorkflow(
        newAddress,
        workflowForm.name,
        workflowForm.credentialsJson,
        workflowForm.workflowsJson
      );
      StorageService.saveWorkflow(workflow);
      
      setErrors(prev => ({ ...prev, protect: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, protect: String(error) }));
    }
    setLoading(prev => ({ ...prev, protect: false }));
  };

  const grantAccessSubmit = async () => {
    setErrors(prev => ({ ...prev, grant: '' }));
    
    // Validation
    if (!protectedWorkflow) {
      setErrors(prev => ({ ...prev, grant: 'No protected workflow selected' }));
      return;
    }
    
    if (!accessForm.userAddress.trim()) {
      setErrors(prev => ({ ...prev, grant: 'Please enter a user address' }));
      return;
    }
    
    if (!accessForm.appAddress.trim()) {
      setErrors(prev => ({ ...prev, grant: 'Please enter an app address' }));
      return;
    }
    
    if (!accessForm.numberOfAccess || accessForm.numberOfAccess < 1) {
      setErrors(prev => ({ ...prev, grant: 'Please enter a valid number of access (minimum 1)' }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, grant: true }));
      
      await IExecService.grantAccess(
        protectedWorkflow as any,
        accessForm.userAddress,
        accessForm.appAddress,
        accessForm.numberOfAccess
      );
      
      setAuthorizedUser(accessForm.userAddress);
      setErrors(prev => ({ ...prev, grant: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, grant: String(error) }));
    }
    setLoading(prev => ({ ...prev, grant: false }));
  };

  const revokeAccessSubmit = async () => {
    setRevokeAccess('');
    setErrors(prev => ({ ...prev, revoke: '' }));
    
    try {
      setLoading(prev => ({ ...prev, revoke: true }));
      
      const txHash = await IExecService.revokeAccess(
        protectedWorkflow as any,
        authorizedUser,
        accessForm.appAddress
      );
      
      setRevokeAccess(txHash);
    } catch (error) {
      setErrors(prev => ({ ...prev, revoke: String(error) }));
      setRevokeAccess('');
    }
    setLoading(prev => ({ ...prev, revoke: false }));
  };

  // Form handlers
  const handleCredentialsChange = (value: string) => {
    const isValid = validateJson(value);
    setWorkflowForm(prev => ({
      ...prev,
      credentialsJson: value,
      isValidCredentials: isValid
    }));
  };

  const handleWorkflowsChange = (value: string) => {
    const isValid = validateJson(value);
    setWorkflowForm(prev => ({
      ...prev,
      workflowsJson: value,
      isValidWorkflows: isValid
    }));
  };

  const handleNameChange = (value: string) => {
    setWorkflowForm(prev => ({ ...prev, name: value }));
  };

  const handleUserAddressChange = (value: string) => {
    setAccessForm(prev => ({ ...prev, userAddress: value }));
  };

  const handleAppAddressChange = (value: string) => {
    setAccessForm(prev => ({ ...prev, appAddress: value }));
  };

  const handleNumberOfAccessChange = (value: number) => {
    setAccessForm(prev => ({ ...prev, numberOfAccess: value }));
  };

  const shareWithYourself = async () => {
    try {
      const address = await IExecService.getCurrentUserAddress();
      setAccessForm(prev => ({ ...prev, userAddress: address }));
    } catch (error) {
      console.error('Error getting user address:', error);
    }
  };

  const handleWorkflowDetails = (workflow: ProtectedWorkflow) => {
    setSelectedWorkflow(workflow);
    setProtectedWorkflow(workflow.address);
    setWorkflowForm(prev => ({ ...prev, name: workflow.name }));
    setAuthorizedUser('');
    setRevokeAccess('');
    navigateTo('workflow-details');
  };

  const handleDeployWorkflow = () => {
    alert('Workflow deployment functionality will be implemented soon!');
  };

  // Render different pages based on currentPage
  if (currentPage === 'welcome') {
    return <WelcomePage navigateTo={navigateTo} />;
  }

  // Common layout for other pages
  return (
    <div className="container">
      <Header />
      
      <div className="content">
        <Navigation currentPage={currentPage} navigateTo={navigateTo} />
        
        {/* Render page content based on currentPage */}
        {currentPage === 'protect' && (
          <ProtectPage
            workflowForm={workflowForm}
            accessForm={accessForm}
            protectedWorkflow={protectedWorkflow}
            loading={loading}
            errors={errors}
            revokeAccess={revokeAccess}
            authorizedUser={authorizedUser}
            onCredentialsChange={handleCredentialsChange}
            onWorkflowsChange={handleWorkflowsChange}
            onNameChange={handleNameChange}
            onUserAddressChange={handleUserAddressChange}
            onAppAddressChange={handleAppAddressChange}
            onNumberOfAccessChange={handleNumberOfAccessChange}
            onProtectSubmit={protectWorkflowSubmit}
            onGrantSubmit={grantAccessSubmit}
            onRevokeSubmit={revokeAccessSubmit}
            onShareWithYourself={shareWithYourself}
          />
        )}
        
        {currentPage === 'view' && (
          <ViewPage
            workflows={protectedWorkflows}
            loading={loading.workflows}
            onWorkflowDetails={handleWorkflowDetails}
          />
        )}
        
        {currentPage === 'workflow-details' && selectedWorkflow && (
          <WorkflowDetailsPage
            workflow={selectedWorkflow}
            accessForm={accessForm}
            loading={loading}
            errors={errors}
            revokeAccess={revokeAccess}
            authorizedUser={authorizedUser}
            onUserAddressChange={handleUserAddressChange}
            onAppAddressChange={handleAppAddressChange}
            onNumberOfAccessChange={handleNumberOfAccessChange}
            onGrantSubmit={grantAccessSubmit}
            onRevokeSubmit={revokeAccessSubmit}
            onShareWithYourself={shareWithYourself}
            onDeployWorkflow={handleDeployWorkflow}
          />
        )}
      </div>
      
      <Footer />
    </div>
  );
}
