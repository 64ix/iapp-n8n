import { IExecDataProtector, getWeb3Provider } from '@iexec/dataprotector';
import { readFile } from 'fs/promises';

// Get Web3 provider from a private key
const DataProtectorPrivateKey = await readFile('secrets/dataProtector.key', 'utf8');
const web3Provider = getWeb3Provider(DataProtectorPrivateKey);

// Instantiate using the umbrella module for full functionality
const dataProtector = new IExecDataProtector(web3Provider, {
  iexecOptions: {
    smsURL: 'https://sms.labs.iex.ec',
  },
});

const dataProtectorCore = dataProtector.core; // access to core methods

// Example usage of the dataProtectorCore
async function protectData() {
  try {
    // Load credentials and workflow from local files
    const credentials = await readFile('secrets/n8n-credentials.json', 'utf8');
    const workflow = await readFile('secrets/n8n-workflow.json', 'utf8');

    dataProtectorCore.protectData({
        data : {
            'credentials': credentials,
            'workflow': workflow,
    }})
      .then((protectedDataobj) => {
        console.log('Protected Data:', protectedDataobj);
        dataProtectorCore.grantAccess({
          protectedData: protectedDataobj.address,
          authorizedApp: "0xdAB1CAEBe36810B0bc847f407d34a3Ea7Df2dca6",
          authorizedUser: "0xb631150041fbc4a28b7d8ca43ba0be0b3b03e008",
        numberOfAccess: 1000000
      })})
      .catch((error) => {
        console.error('Error protecting data:', error);
      });
  } catch (error) {
    console.error('Error reading files:', error);
  }
}

// Execute the function
protectData();

