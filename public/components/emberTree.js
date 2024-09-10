const { EmberClient } = require("node-emberplus");

const getEmberTree = async (ip, port) => {
	try {
		const client = new EmberClient(ip, port);

		await client.connectAsync();

		console.log(`Connecté au serveur Ember+ à l'IP ${ip}:${port}`);

		// Récupérer la racine
		const rootNode = await client.getDirectory();

		// Fonction récursive pour construire l'arbre
		const buildTree = (node) => ({
			identifier: node.identifier,
			description: node.description || "",
			children: node.children
				? node.children.map((enfant) => buildTree(enfant))
				: [],
		});

		// Construire l'arbre des noeuds
		const nodeTree = buildTree(rootNode);

		client.Disconnect();
		console.log("Déconnecté du serveur Ember+");
		console.log("nodeTree", nodeTree);

		return nodeTree;
	} catch (err) {
		console.error(`Erreur lors de la connexion à ${ip}:${port}:`, err);
		throw err;
	}
};

//export default getEmberTree;
