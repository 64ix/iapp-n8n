import { ProtectedWorkflow } from '../types';

export class StorageService {
  private static STORAGE_KEY = 'protectedWorkflows';

  // Load all protected workflows from localStorage
  static loadProtectedWorkflows(): ProtectedWorkflow[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const workflows = JSON.parse(stored);
      return Array.isArray(workflows) ? workflows : [];
    } catch (error) {
      console.error('Error loading workflows from storage:', error);
      return [];
    }
  }

  // Save workflow to localStorage
  static saveWorkflow(workflow: ProtectedWorkflow): void {
    try {
      const workflows = this.loadProtectedWorkflows();
      
      // Check if workflow already exists to prevent duplicates
      const existingIndex = workflows.findIndex(w => w.address === workflow.address);
      if (existingIndex !== -1) {
        // Update existing workflow
        workflows[existingIndex] = workflow;
      } else {
        // Add new workflow
        workflows.push(workflow);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
    } catch (error) {
      console.error('Error saving workflow to storage:', error);
    }
  }

  // Remove workflow from localStorage
  static removeWorkflow(address: string): void {
    try {
      const workflows = this.loadProtectedWorkflows();
      const filtered = workflows.filter(w => w.address !== address);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing workflow from storage:', error);
    }
  }

  // Clear all workflows
  static clearAllWorkflows(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing workflows from storage:', error);
    }
  }
} 