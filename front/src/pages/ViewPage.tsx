import React from 'react';
import { ProtectedWorkflow } from '../types';
import { IEXEC_EXPLORER_URL } from '../utils/utils';
import loader from '../assets/loader.gif';

interface ViewPageProps {
  workflows: ProtectedWorkflow[];
  loading: boolean;
  onWorkflowDetails: (workflow: ProtectedWorkflow) => void;
}

export const ViewPage: React.FC<ViewPageProps> = ({
  workflows,
  loading,
  onWorkflowDetails
}) => {
  return (
    <div className="section">
      <h2>Your Protected Workflows</h2>
      
      {loading ? (
        <div className="loading">
          <img src={loader} alt="loading" />
          Loading your protected workflows...
        </div>
      ) : workflows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Protected Workflows Found</h3>
          <p>You haven't protected any workflows yet. Start by protecting your first n8n workflow!</p>
          <button className="btn" onClick={() => window.location.href = '?page=protect'}>
            🔒 Protect Your First Workflow
          </button>
        </div>
      ) : (
        <div className="workflows-grid">
          {workflows.map((workflow, index) => (
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
                <button className="btn" onClick={() => onWorkflowDetails(workflow)}>
                  📋 View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 