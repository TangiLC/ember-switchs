const { EmberClient } = require("node-emberplus");

let emberClient = null;
let isClientConnected = false;

// Fonction pour récupérer la configuration depuis le localStorage
const getConfigFromLocalStorage = () => {
	const config = localStorage.getItem("appConfig");
	return config ? JSON.parse(config) : null;
};

// Fonction pour créer un client Ember+
const createEmberClient = () => {
	const config = getConfigFromLocalStorage();

	if (!config || !config.emberServer) {
		throw new Error("Configuration Ember+ manquante dans le localStorage");
	}

	if (!emberClient) {
		emberClient = new EmberClient({
			host: config.emberServer.ip,
			port: config.emberServer.port,
		});
	}

	return emberClient;
};

// Fonction pour se connecter au serveur Ember+ de manière persistante
const connectToEmberServer = async () => {
	console.log("isClientConnected", isClientConnected);
	// Si déjà connecté, on ne se reconnecte pas
	if (isClientConnected) {
		return;
	}

	try {
		emberClient = createEmberClient();
		await emberClient.connectAsync();
		isClientConnected = true;
		console.log("Connecté au serveur Ember+");
	} catch (error) {
		console.error(
			"Erreur lors de la connexion au serveur Ember+ :",
			error.message
		);
		isClientConnected = false;
	}
};

// Fonction pour gérer la reconnexion en cas de déconnexion
const ensureConnection = async () => {
	// Vérifie si la connexion est perdue et tente de reconnecter si nécessaire
	if (!isClientConnected) {
		console.log("Connexion perdue. Tentative de reconnexion...");
		await connectToEmberServer();
	}
};

// Fonction pour écouter en permanence un nœud GPI
const listenToGPIStateChanges = async (gpiPath) => {
	try {
		await ensureConnection();

		const node = await emberClient.getNodeByPath(gpiPath);
		if (!node || !node.contents || node.contents.value === undefined) {
			throw new Error(
				`Le chemin GPI "${gpiPath}" est introuvable ou invalide.`
			);
		}

		node.on("valueChange", (newValue) => {
			const state = newValue ? true : false;
			console.log(
				`Changement d'état détecté sur ${gpiPath}: ${
					state ? "onAir" : "offAir"
				}`
			);
			sessionStorage.setItem(gpiPath, JSON.stringify(state));

			// Optionnel : tu peux ajouter ici un callback ou déclencher une autre fonction en réponse
		});
	} catch (error) {
		console.error(
			`Erreur lors de l'écoute des changements d'état de ${gpiPath}:`,
			error.message
		);
	}
};

// Fonction pour envoyer un nouvel état à un nœud GPI
const sendStateToEmberServer = async (gpiPath, newState) => {
	try {
		await ensureConnection();

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
	}
};

// Fonction pour récupérer l'état initial du nœud depuis le serveur Ember+
const getStateFromEmberServer = async (gpiPath) => {
	try {
		await ensureConnection();

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
	}
};

module.exports = {
	sendStateToEmberServer,
	getStateFromEmberServer,
	listenToGPIStateChanges,
};
