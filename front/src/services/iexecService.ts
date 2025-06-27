import { IExecDataProtector, Address } from '@iexec/dataprotector';
import { checkIsConnected, checkCurrentChain } from '../utils/utils';

const iExecDataProtectorClient = new IExecDataProtector(window.ethereum, {
  iexecOptions: {
    smsURL: 'https://sms.labs.iex.ec',
  },
});

export class IExecService {
  // Protect workflow data
  static async protectWorkflow(data: any, name: string): Promise<Address> {
    await checkIsConnected();
    await checkCurrentChain();
    
    const response = await iExecDataProtectorClient.core.protectData({
      data,
      name,
    });
    
    return response.address as Address;
  }

  // Grant access to workflow
  static async grantAccess(
    protectedData: Address,
    authorizedUser: string,
    authorizedApp: string,
    numberOfAccess: number
  ): Promise<void> {
    await checkIsConnected();
    await checkCurrentChain();
    
    await iExecDataProtectorClient.core.grantAccess({
      protectedData,
      authorizedUser,
      authorizedApp,
      numberOfAccess,
    });
  }

  // Revoke access from workflow
  static async revokeAccess(
    protectedData: Address,
    authorizedUser: string,
    authorizedApp: string
  ): Promise<string> {
    await checkIsConnected();
    await checkCurrentChain();
    
    const allGrantedAccess = await iExecDataProtectorClient.core.getGrantedAccess({
      protectedData,
      authorizedUser,
      authorizedApp,
    });
    
    if (allGrantedAccess.count === 0) {
      throw new Error('No access to revoke');
    }
    
    const { txHash } = await iExecDataProtectorClient.core.revokeOneAccess(
      allGrantedAccess.grantedAccess[0]
    );
    
    return txHash;
  }

  // Get current user address
  static async getCurrentUserAddress(): Promise<string> {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  }
} 