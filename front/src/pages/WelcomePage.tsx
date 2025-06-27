import React from 'react';
import { Page } from '../types';

interface WelcomePageProps {
  navigateTo: (page: Page) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ navigateTo }) => {
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
}; 