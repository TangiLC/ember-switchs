import { initHeader } from "./components/header.js";
import { initUser } from "./components/user.js";
import { initConfig } from "./components/config.js";

let isConfigOpen = false;
let config = {};

const toggleConfig = () => {
	isConfigOpen = !isConfigOpen;
	loadConfig();
};

const renderApp = () => {
	initHeader(isConfigOpen, toggleConfig, config.configMdp);
	initUser(isConfigOpen);
	initConfig(isConfigOpen, toggleConfig);
};

const loadConfig = async () => {
	try {
		const localConfig = localStorage.getItem("appConfig");
		if (localConfig) {
			config = JSON.parse(localConfig);
			console.log("Configuration chargée depuis le localStorage :", config);
			renderApp();
		} else {
			const response = await fetch("./config.json");
			if (response.ok) {
				config = await response.json();
				localStorage.setItem("appConfig", JSON.stringify(config));
				console.log(
					"Configuration chargée depuis config.json et stockée dans le localStorage :",
					config
				);
				renderApp();
			} else {
				console.error("Impossible de charger la configuration");
			}
		}
	} catch (error) {
		console.error("Erreur lors du chargement de la configuration :", error);
	}
};

// Fonction pour recharger et mettre à jour la configuration dans le localStorage
/*const updateConfigInLocalStorage = (newConfig) => {
	config = newConfig;
	localStorage.setItem("appConfig", JSON.stringify(config));
	console.log(
		"Configuration mise à jour et stockée dans le localStorage :",
		config
	);
	renderApp();
};*/

window.onload = () => {
	loadConfig();
};

window.addEventListener("beforeunload", () => {
	localStorage.removeItem("appConfig");
});

//export { updateConfigInLocalStorage };
