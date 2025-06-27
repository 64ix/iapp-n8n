import React from 'react';
import { ProtectedWorkflow, AccessFormData, LoadingStates, ErrorStates } from '../types';
import { IEXEC_EXPLORER_URL } from '../utils/utils';
import loader from '../assets/loader.gif';
import successIcon from '../assets/success.png';

interface WorkflowDetailsPageProps {
  workflow: ProtectedWorkflow;
  accessForm: AccessFormData;
  loading: LoadingStates;
  errors: ErrorStates;
  revokeAccess: string;
  authorizedUser: string;
  onUserAddressChange: (value: string) => void;
  onAppAddressChange: (value: string) => void;
  onNumberOfAccessChange: (value: number) => void;
  onGrantSubmit: () => void;
  onRevokeSubmit: () => void;
  onShareWithYourself: () => void;
  onDeployWorkflow: () => void;
}

export const WorkflowDetailsPage: React.FC<WorkflowDetailsPageProps> = ({
  workflow,
  accessForm,
  loading,
  errors,
  revokeAccess,
  authorizedUser,
  onUserAddressChange,
  onAppAddressChange,
  onNumberOfAccessChange,
  onGrantSubmit,
  onRevokeSubmit,
  onShareWithYourself,
  onDeployWorkflow
}) => {
  return (
    <>
      {/* Workflow Overview Section */}
      <div className="section">
        <h2>Workflow Overview</h2>
        
        <div className="workflow-overview">
          <div className="workflow-header-large">
            <h3>{workflow.name}</h3>
            <span className="workflow-status">🔒 Protected</span>
          </div>
          
          <div className="workflow-stats-grid">
            <div className="stat-item">
              <label>Blockchain Address:</label>
              <div className="address-display">
                {workflow.address}
              </div>
            </div>
            
            <div className="stat-item">
              <label>Created:</label>
              <span>{new Date(workflow.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="stat-item">
              <label>Credentials:</label>
              <span>{workflow.data.credentials} items</span>
            </div>
            
            <div className="stat-item">
              <label>Workflows:</label>
              <span>{workflow.data.workflows} items</span>
            </div>
            
            <div className="stat-item">
              <label>Authorized Users:</label>
              <span>{workflow.authorizedUsers.length} users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Data Section */}
      {workflow.jsonData && (
        <div className="section">
          <h2>Workflow Data</h2>
          
          <div className="form-group">
            <label>Original JSON Data</label>
            <textarea
              className="form-control"
              value={workflow.jsonData}
              rows={12}
              readOnly
            />
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
            <button className="btn btn-primary" onClick={onDeployWorkflow}>
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
            value={workflow.address}
          />
        </div>

        <div className="form-group">
          <label>Number of Access</label>
          <input
            type="number"
            className="form-control"
            value={accessForm.numberOfAccess}
            placeholder="Allowed Access Count"
            min={1}
            onChange={(e) => onNumberOfAccessChange(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>User Address</label>
          <input
            type="text"
            className="form-control"
            value={accessForm.userAddress}
            placeholder="Enter wallet address to grant access"
            onChange={(e) => onUserAddressChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>App Address</label>
          <input
            type="text"
            className="form-control"
            value={accessForm.appAddress}
            placeholder="Enter app address to grant access"
            onChange={(e) => onAppAddressChange(e.target.value)}
          />
        </div>

        <div className="info-box">
          For testing, you can{' '}
          <button type="button" className="btn btn-secondary" onClick={onShareWithYourself}>
            Use Your Own Wallet
          </button>
        </div>

        {!loading.grant ? (
          <button className="btn" onClick={onGrantSubmit}>
            🔑 Grant Access
          </button>
        ) : (
          <div className="loading">
            <img src={loader} alt="loading" />
            Granting access...
          </div>
        )}

        {errors.grant && (
          <div className="error-message">
            <h6>Grant Access failed</h6>
            {errors.grant}
          </div>
        )}

        {authorizedUser && !errors.grant && (
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
              value={workflow.address}
            />
          </div>

          {!loading.revoke ? (
            <button className="btn btn-secondary" onClick={onRevokeSubmit}>
              🚫 Revoke Access
            </button>
          ) : (
            <div className="loading">
              <img src={loader} alt="loading" />
              Revoking access...
            </div>
          )}

          {revokeAccess && !errors.revoke && (
            <div className="success-message">
              <img src={successIcon} alt="success" />
              Access successfully revoked
            </div>
          )}

          {errors.revoke && (
            <div className="error-message">
              <h6>Revoke Access failed</h6>
              {errors.revoke}
            </div>
          )}
        </div>
      )}
    </>
  );
}; 