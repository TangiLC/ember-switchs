const { EmberClient } = require("node-emberplus");

let isClientConnected = false;

const getConfigFromLocalStorage = () => {
	const config = localStorage.getItem("appConfig");
	return config ? JSON.parse(config) : null;
};

const createEmberClient = () => {
	const config = getConfigFromLocalStorage();

	if (!config || !config.emberServer) {
		throw new Error("Configuration Ember+ manquante dans le localStorage");
	}

	return new EmberClient({
		host: config.emberServer.ip,
		port: config.emberServer.port,
	});
};

const sendStateToEmberServer = async (gpiPath, newState) => {
	const emberClient = createEmberClient();
	try {
		if (!isClientConnected) {
			await emberClient.connectAsync();
			console.log("Connecté au serveur Ember+");
			isClientConnected = true;
		}

		const node = await emberClient.getNodeByPath(gpiPath);
		if (!node || !node.contents || node.contents.value === undefined) {
			throw new Error(
				`Le chemin GPI "${gpiPath}" est introuvable ou invalide.`
			);
		}

		node.contents.value = newState;
		await emberClient.setValue(node);

		console.log(
			`État de ${gpiPath} mis à jour : ${newState ? "onAir" : "offAir"}`
		);
	} catch (error) {
		console.error(
			`Erreur lors de l'envoi de l'état au serveur Ember+ pour ${gpiPath}:`,
			error.message
		);
	} finally {
		await emberClient.disconnectAsync();
		isClientConnected = false;
	}
};

// Fonction pour récupérer l'état depuis le serveur Ember+
const getStateFromEmberServer = async (gpiPath) => {
	const emberClient = createEmberClient();
	try {
		if (!isClientConnected) {
			await emberClient.connectAsync();
			console.log("Connecté au serveur Ember+");
			isClientConnected = true;
		}

		const node = await emberClient.getNodeByPath(gpiPath);
		if (!node || !node.contents || node.contents.value === undefined) {
			throw new Error(
				`Le chemin GPI "${gpiPath}" est introuvable ou invalide.`
			);
		}

		return node.contents.value;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération de l'état de ${gpiPath}:`,
			error.message
		);
		return null;
	} finally {
		await emberClient.disconnectAsync();
		isClientConnected = false;
	}
};

module.exports = {
	sendStateToEmberServer,
	getStateFromEmberServer, // Exporter la nouvelle fonction
};
