module.exports = {
	nodes: [
		require('./dist/nodes/ExampleNode/ExampleNode.node.js'),
		require('./dist/nodes/HttpBin/HttpBin.node.js'),
		require('./dist/nodes/IExecDataProtectorNode/IExecDataProtectorNode.node.js'),
	],
	credentials: [
		require('./dist/credentials/ExampleCredentialsApi.credentials.js'),
		require('./dist/credentials/HttpBinApi.credentials.js'),
		require('./dist/credentials/IExecDataProtectorApi.credentials.js'),
	],
};
