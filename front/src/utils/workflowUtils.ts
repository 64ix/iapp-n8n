import { ProtectedWorkflow } from '../types';

// Convert arrays to objects to make it compatible with iExec DataProtector
export const convertArraysToObjects = (obj: any): any => {
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

// Parse workflow data and count credentials/workflows
export const parseWorkflowData = (jsonData: string) => {
  try {
    const parsed = JSON.parse(jsonData);
    const credentialsCount = parsed.credentials ? (Array.isArray(parsed.credentials) ? parsed.credentials.length : 1) : 0;
    const workflowsCount = parsed.workflow ? (Array.isArray(parsed.workflow) ? parsed.workflow.length : 1) : 0;
    return { credentials: credentialsCount, workflows: workflowsCount };
  } catch (error) {
    console.error('Error parsing workflow data:', error);
    return { credentials: 0, workflows: 0 };
  }
};

// Validate JSON string
export const validateJson = (jsonString: string): boolean => {
  if (!jsonString.trim()) return true;
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

// Create combined workflow data from separate credentials and workflows
export const createCombinedWorkflowData = (credentialsJson: string, workflowsJson: string): string => {
  try {
    const credentials = JSON.parse(credentialsJson);
    const workflows = JSON.parse(workflowsJson);
    
    return JSON.stringify({
      credentials,
      workflow: workflows
    });
  } catch (error) {
    throw new Error('Invalid JSON format in credentials or workflows');
  }
};

// Create ProtectedWorkflow object
export const createProtectedWorkflow = (
  address: string,
  name: string,
  credentialsJson: string,
  workflowsJson: string
): ProtectedWorkflow => {
  const combinedData = createCombinedWorkflowData(credentialsJson, workflowsJson);
  const dataCounts = parseWorkflowData(combinedData);
  
  return {
    address: address as any,
    name,
    createdAt: new Date().toISOString(),
    data: dataCounts,
    authorizedUsers: [],
    jsonData: combinedData
  };
}; 