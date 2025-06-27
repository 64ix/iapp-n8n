import React from 'react';
import { WorkflowFormData, AccessFormData, LoadingStates, ErrorStates } from '../types';
import { IEXEC_EXPLORER_URL } from '../utils/utils';
import loader from '../assets/loader.gif';
import successIcon from '../assets/success.png';

interface ProtectPageProps {
  workflowForm: WorkflowFormData;
  accessForm: AccessFormData;
  protectedWorkflow: string;
  loading: LoadingStates;
  errors: ErrorStates;
  revokeAccess: string;
  authorizedUser: string;
  onCredentialsChange: (value: string) => void;
  onWorkflowsChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onUserAddressChange: (value: string) => void;
  onAppAddressChange: (value: string) => void;
  onNumberOfAccessChange: (value: number) => void;
  onProtectSubmit: () => void;
  onGrantSubmit: () => void;
  onRevokeSubmit: () => void;
  onShareWithYourself: () => void;
}

export const ProtectPage: React.FC<ProtectPageProps> = ({
  workflowForm,
  accessForm,
  protectedWorkflow,
  loading,
  errors,
  revokeAccess,
  authorizedUser,
  onCredentialsChange,
  onWorkflowsChange,
  onNameChange,
  onUserAddressChange,
  onAppAddressChange,
  onNumberOfAccessChange,
  onProtectSubmit,
  onGrantSubmit,
  onRevokeSubmit,
  onShareWithYourself
}) => {
  return (
    <>
      {/* Protect Workflow Section */}
      <div className="section">
        <h2>Protect Your n8n Workflow</h2>
        
        {protectedWorkflow && (
          <div className="info-box">
            <strong>Managing Access for:</strong> {workflowForm.name} ({protectedWorkflow})
          </div>
        )}
        
        <div className="info-box">
          <strong>Note:</strong> Enter your n8n credentials and workflows in separate JSON blocks. 
          The system will automatically combine them into the format: <code>{'{"credentials": [...], "workflow": [...]}'}</code>
          <br />
          Arrays in your JSON will be automatically converted to objects with numeric keys, and special characters in object keys will be replaced with underscores to ensure compatibility with iExec DataProtector.
        </div>

        <div className="form-group">
          <label>Credentials JSON</label>
          <textarea
            className="form-control"
            value={workflowForm.credentialsJson}
            placeholder={`[
  {
    "createdAt": "2025-06-26T09:18:09.265Z",
    "updatedAt": "2025-06-26T09:18:23.488Z",
    "id": "your-id",
    "name": "your-name",
    "data": {
      "accessToken": "your-access-token"
    },
    "type": "your-type",
    "isManaged": false
  }
]`}
            onChange={(e) => onCredentialsChange(e.target.value)}
            rows={8}
          />
          {!workflowForm.isValidCredentials && workflowForm.credentialsJson.trim() !== '' && (
            <div className="error-message">
              Please enter valid credentials JSON data
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Workflows JSON</label>
          <textarea
            className="form-control"
            value={workflowForm.workflowsJson}
            placeholder={`[
  {
    "createdAt": "2025-06-26T08:33:05.547Z",
    "updatedAt": "2025-06-26T10:30:13.000Z",
    "id": "N43f6oGefV50KGZX",
    "name": "Simple_Slack",
    "active": false,
    "isArchived": false,
    "nodes": [
      {
        "id": "node-1",
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "position": [240, 300]
      }
    ],
    "connections": {
      "Start": {
        "main": [
          [
            {
              "node": "node-1",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }
]`}
            onChange={(e) => onWorkflowsChange(e.target.value)}
            rows={8}
          />
          {!workflowForm.isValidWorkflows && workflowForm.workflowsJson.trim() !== '' && (
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
            value={workflowForm.name}
            placeholder="Enter a name for your protected workflow"
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        {errors.protect && (
          <div className="error-message">
            <h6>Protection failed</h6>
            {errors.protect}
          </div>
        )}

        {!loading.protect ? (
          <button className="btn" onClick={onProtectSubmit}>
            🔒 Protect Workflow
          </button>
        ) : (
          <div className="loading">
            <img src={loader} alt="loading" />
            Protecting your workflow...
          </div>
        )}
        
        {protectedWorkflow && !errors.protect && (
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