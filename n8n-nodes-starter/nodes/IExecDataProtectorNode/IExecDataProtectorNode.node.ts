import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { IExecDataProtector, getWeb3Provider } from '@iexec/dataprotector';

export class IExecDataProtectorNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'iExec DataProtector',
		name: 'iExecDataProtector',
		group: ['transform'],
		version: 1,
		description: 'Protéger et gérer des données avec iExec DataProtector',
		defaults: {
			name: 'iExec DataProtector',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'iExecDataProtectorApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'SMS URL (Optional)',
				name: 'smsUrl',
				type: 'string',
				default: '',
				description: 'URL du SMS (Secret Management Service) pour configurer l\'environnement TEE. Laissez vide pour utiliser l\'URL par défaut.',
				placeholder: 'https://sms.scone-prod.v8-bellecour.iex.ec',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Granted Access',
						value: 'getGrantedAccess',
						description: 'Récupérer la liste des accès accordés',
						action: 'Get list of granted access',
					},
					{
						name: 'Get Protected Data',
						value: 'getProtectedData',
						description: 'Récupérer la liste des données protégées',
						action: 'Get list of protected data',
					},
					{
						name: 'Grant Access',
						value: 'grantAccess',
						description: 'Accorder l\'accès à une application',
						action: 'Grant access to an application',
					},
					{
						name: 'Protect Data',
						value: 'protectData',
						description: 'Protéger des données en les chiffrant',
						action: 'Protect data by encrypting it',
					},
					{
						name: 'Revoke Access',
						value: 'revokeAccess',
						description: 'Révoquer un accès',
						action: 'Revoke access to data',
					},
				],
				default: 'protectData',
			},
			// Paramètres pour protectData
			{
				displayName: 'Data to Protect',
				name: 'dataToProtect',
				type: 'json',
				default: '{}',
				description: 'Les données à protéger au format JSON',
				displayOptions: {
					show: {
						operation: ['protectData'],
					},
				},
			},
			{
				displayName: 'Data Name (Optional)',
				name: 'dataName',
				type: 'string',
				default: '',
				description: 'Nom optionnel pour identifier les données',
				displayOptions: {
					show: {
						operation: ['protectData'],
					},
				},
			},
			{
				displayName: 'Upload Mode',
				name: 'uploadMode',
				type: 'options',
				default: 'ipfs',
				description: 'Mode d\'upload pour les données protégées',
				options: [
					{
						name: 'IPFS',
						value: 'ipfs',
						description: 'Upload vers IPFS (par défaut)',
					},
					{
						name: 'Arweave',
						value: 'arweave',
						description: 'Upload vers Arweave',
					},
				],
				displayOptions: {
					show: {
						operation: ['protectData'],
					},
				},
			},
			// Paramètres pour getProtectedData
			{
				displayName: 'Owner Address (Optional)',
				name: 'ownerAddress',
				type: 'string',
				default: '',
				description: 'Adresse du propriétaire des données (laisser vide pour utiliser l\'adresse connectée)',
				displayOptions: {
					show: {
						operation: ['getProtectedData'],
					},
				},
			},
			{
				displayName: 'Data Schema (Optional)',
				name: 'dataSchema',
				type: 'string',
				default: '',
				description: 'Schéma des données à filtrer',
				displayOptions: {
					show: {
						operation: ['getProtectedData'],
					},
				},
			},
			// Paramètres pour grantAccess
			{
				displayName: 'Protected Data',
				name: 'protectedData',
				type: 'string',
				default: '',
				description: 'Adresse des données protégées',
				displayOptions: {
					show: {
						operation: ['grantAccess'],
					},
				},
			},
			{
				displayName: 'Authorized App',
				name: 'authorizedApp',
				type: 'string',
				default: '',
				description: 'Adresse de l\'application iExec autorisée',
				displayOptions: {
					show: {
						operation: ['grantAccess'],
					},
				},
			},
			{
				displayName: 'Authorized User',
				name: 'authorizedUser',
				type: 'string',
				default: '',
				description: 'Adresse de l\'utilisateur autorisé',
				displayOptions: {
					show: {
						operation: ['grantAccess'],
					},
				},
			},
			{
				displayName: 'Price Per Access',
				name: 'pricePerAccess',
				type: 'number',
				default: 0,
				description: 'Prix par accès en nano RLC (nRLC)',
				displayOptions: {
					show: {
						operation: ['grantAccess'],
					},
				},
			},
			{
				displayName: 'Number of Access',
				name: 'numberOfAccess',
				type: 'number',
				default: 1,
				description: 'Nombre d\'accès accordés',
				displayOptions: {
					show: {
						operation: ['grantAccess'],
					},
				},
			},
			// Paramètres pour getGrantedAccess
			{
				displayName: 'Protected Data Address',
				name: 'protectedDataAddressForAccess',
				type: 'string',
				default: '',
				description: 'Adresse des données protégées',
				displayOptions: {
					show: {
						operation: ['getGrantedAccess'],
					},
				},
			},
			// Paramètres pour revokeAccess
			{
				displayName: 'Protected Data',
				name: 'protectedDataForRevoke',
				type: 'string',
				default: '',
				description: 'Adresse des données protégées',
				displayOptions: {
					show: {
						operation: ['revokeAccess'],
					},
				},
			},
			{
				displayName: 'Application',
				name: 'appForRevoke',
				type: 'string',
				default: '',
				description: 'Adresse de l\'application à révoquer',
				displayOptions: {
					show: {
						operation: ['revokeAccess'],
					},
				},
			},
			{
				displayName: 'User',
				name: 'userForRevoke',
				type: 'string',
				default: '',
				description: 'Adresse de l\'utilisateur (laisser vide pour utiliser l\'adresse connectée)',
				displayOptions: {
					show: {
						operation: ['revokeAccess'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Récupérer les credentials
		const credentials = await this.getCredentials('iExecDataProtectorApi');
		const privateKey = credentials.privateKey as string;

		// Récupérer la configuration SMS
		const smsUrl = this.getNodeParameter('smsUrl', 0, '') as string;

		// Initialiser DataProtector Core avec configuration optionnelle
		const web3Provider = getWeb3Provider(privateKey);
		const dataProtectorOptions: any = {};

		if (smsUrl) {
			dataProtectorOptions.iexecOptions = {
				smsURL: smsUrl,
			};
		}

		const dataProtectorCore = new IExecDataProtector(web3Provider, dataProtectorOptions).core;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				let result: any;

				switch (operation) {
					case 'protectData': {
						const dataToProtect = this.getNodeParameter('dataToProtect', itemIndex, '{}') as string;
						const dataName = this.getNodeParameter('dataName', itemIndex, '') as string;
						const uploadMode = this.getNodeParameter('uploadMode', itemIndex, 'ipfs') as string;

						let dataObject: any;
						try {
							dataObject = JSON.parse(dataToProtect);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Les données doivent être au format JSON valide');
						}

						const protectOptions: any = { data: dataObject };
						if (dataName) {
							protectOptions.name = dataName;
						}
						if (uploadMode) {
							protectOptions.uploadMode = uploadMode;
						}

						result = await dataProtectorCore.protectData(protectOptions);
						break;
					}

					case 'getProtectedData': {
						const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex, '') as string;
						const dataSchema = this.getNodeParameter('dataSchema', itemIndex, '') as string;

						const options: any = {};
						if (ownerAddress) options.owner = ownerAddress;
						if (dataSchema) options.dataSchema = dataSchema;

						result = await dataProtectorCore.getProtectedData(options);
						break;
					}

					case 'grantAccess': {
						const protectedData = this.getNodeParameter('protectedData', itemIndex) as string;
						const authorizedApp = this.getNodeParameter('authorizedApp', itemIndex) as string;
						const authorizedUser = this.getNodeParameter('authorizedUser', itemIndex) as string;
						const pricePerAccess = this.getNodeParameter('pricePerAccess', itemIndex) as number;
						const numberOfAccess = this.getNodeParameter('numberOfAccess', itemIndex) as number;

						if (!protectedData || !authorizedApp) {
							throw new NodeOperationError(this.getNode(), 'L\'adresse des données protégées et l\'adresse de l\'application sont requises');
						}

						const options: any = {
							protectedData,
							authorizedApp,
							authorizedUser,
							pricePerAccess,
							numberOfAccess,
						};

						result = await dataProtectorCore.grantAccess(options);
						break;
					}

					case 'getGrantedAccess': {
						const protectedDataAddress = this.getNodeParameter('protectedDataAddressForAccess', itemIndex) as string;

						if (!protectedDataAddress) {
							throw new NodeOperationError(this.getNode(), 'L\'adresse des données protégées est requise');
						}

						result = await dataProtectorCore.getGrantedAccess({ protectedData: protectedDataAddress });
						break;
					}

					case 'revokeAccess': {
						const protectedData = this.getNodeParameter('protectedDataForRevoke', itemIndex) as string;
						const app = this.getNodeParameter('appForRevoke', itemIndex) as string;
						const user = this.getNodeParameter('userForRevoke', itemIndex, '') as string;

						if (!protectedData || !app) {
							throw new NodeOperationError(this.getNode(), 'L\'adresse des données protégées et l\'adresse de l\'application sont requises');
						}

						const options: any = {
							protectedData,
							app,
						};
						if (user) options.user = user;

						result = await dataProtectorCore.revokeOneAccess(options);
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Opération non supportée: ${operation}`);
				}

				// Ajouter le résultat à l'élément de sortie
				const newItem: INodeExecutionData = {
					json: {
						operation,
						result,
						success: true,
					},
				};

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							operation: this.getNodeParameter('operation', itemIndex),
							error: error.message,
							success: false,
						},
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
