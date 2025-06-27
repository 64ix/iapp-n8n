import React from 'react';
import { Page } from '../types';

interface NavigationProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, navigateTo }) => {
  return (
    <div className="navigation-bar">
      <button 
        className={`nav-btn ${currentPage === 'welcome' ? 'active' : ''}`}
        onClick={() => navigateTo('welcome')}
      >
        🏠 Home
      </button>
      <button 
        className={`nav-btn ${currentPage === 'protect' ? 'active' : ''}`}
        onClick={() => navigateTo('protect')}
      >
        🔒 Protect Workflow
      </button>
      <button 
        className={`nav-btn ${currentPage === 'view' ? 'active' : ''}`}
        onClick={() => navigateTo('view')}
      >
        📋 View Workflows
      </button>
      {currentPage === 'workflow-details' && (
        <button className="nav-btn active">
          📋 Workflow Details
        </button>
      )}
    </div>
  );
}; 