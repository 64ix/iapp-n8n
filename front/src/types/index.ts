import { Address } from '@iexec/dataprotector';

export type Page = 'welcome' | 'protect' | 'view' | 'workflow-details';

export interface ProtectedWorkflow {
  address: Address;
  name: string;
  createdAt: string;
  data: any;
  authorizedUsers: string[];
  jsonData?: string;
}

export interface WorkflowFormData {
  name: string;
  credentialsJson: string;
  workflowsJson: string;
  isValidCredentials: boolean;
  isValidWorkflows: boolean;
}

export interface AccessFormData {
  userAddress: string;
  appAddress: string;
  numberOfAccess: number;
}

export interface LoadingStates {
  protect: boolean;
  grant: boolean;
  revoke: boolean;
  workflows: boolean;
}

export interface ErrorStates {
  protect: string;
  grant: string;
  revoke: string;
} 