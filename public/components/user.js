const {
	sendStateToEmberServer,
	getStateFromEmberServer,
} = require("./components/emberClient.js");

// Fonction pour récupérer le config depuis le localStorage
const getConfigFromLocalStorage = () => {
	const config = localStorage.getItem("appConfig");
	return config ? JSON.parse(config) : null;
};

// Fonction principale pour initialiser l'interface utilisateur
export const initUser = async (isConfigOpen) => {
	let config = getConfigFromLocalStorage(); // Récupérer la config initiale

	if (!config) {
		console.error("Configuration manquante dans le localStorage");
		return;
	}

	const userSection = document.getElementById("user-section");

	if (isConfigOpen) {
		userSection.innerHTML = "";
		return;
	}

	userSection.innerHTML = `
      <div class="station-info column-flex">
        <h2>${config.userName || "Nom de la station"}</h2> 
        <div class="auto-margin" style="width:300px;height:120px">
        <img src="../assets/station-logo.png" class="station-img"
        alt="${config.userName || "Logo de la station"}"></div>
      </div>
    `;

	const buttonContainer = document.createElement("div");
	buttonContainer.classList.add("button-container");

	const attributs = {
		onAir: {
			bgColor: "red",
			txtColor: "white",
			img: "broadcast.svg",
			label: "On Air",
		},
		offAir: {
			bgColor: "green",
			txtColor: "#333333",
			img: "mic-off.svg",
			label: "Off",
		},
		error: {
			bgColor: "grey",
			txtColor: "darkgrey",
			img: "server-error.svg",
			label: "Error",
		},
	};

	// Récupérer les états initiaux des GPI via getStateFromEmberServer et les stocker dans sessionStorage
	let gpiButtons = await Promise.all(
		config.buttons
			.filter((button) => button.isActive)
			.map(async (button) => {
				let gpiPath = config.emberServer.gpPath + "gpi" + button.gpi;
				let gpiState = await getStateFromEmberServer(gpiPath);
				const state =
					gpiState !== null ? (gpiState ? "onAir" : "offAir") : "error";

				// Sauvegarder l'état dans le sessionStorage
				sessionStorage.setItem(gpiPath, JSON.stringify(state));

				return {
					name: button.name,
					path: gpiPath,
					state: state,
				};
			})
	);

	const buttonWidth = `${90 / gpiButtons.length}%`;

	gpiButtons.forEach((button, index) => {
		const buttonElement = document.createElement("div");
		buttonElement.style.width = buttonWidth;
		buttonElement.classList.add("gpi-btn");
		buttonElement.setAttribute("id", `button-${index}`);
		updateButtonAppearance(index, buttonElement, attributs, gpiButtons);

		buttonElement.addEventListener("click", () => {
			toggleButtonState(index, button, buttonElement, attributs, gpiButtons);
		});

		buttonContainer.appendChild(buttonElement);
	});

	userSection.appendChild(buttonContainer);

	// Vérification régulière de l'état des GPI dans sessionStorage toutes les 500ms
	let gpiIntervalId = setInterval(() => {
		if (isConfigOpen) {
			clearInterval(gpiIntervalId);
			return;
		}

		gpiButtons.forEach((button, index) => {
			// Récupérer l'état du sessionStorage
			const storedState = JSON.parse(sessionStorage.getItem(button.path));

			// Si l'état a changé, mettre à jour l'apparence du bouton
			if (storedState && storedState !== button.state) {
				button.state = storedState;
				const buttonElement = document.getElementById(`button-${index}`);
				updateButtonAppearance(index, buttonElement, attributs, gpiButtons);
			}
		});
	}, 500); // Intervalle de 500ms

	// Vérification régulière des changements dans le localStorage pour la config toutes les 500ms
	let configIntervalId = setInterval(() => {
		const newConfig = getConfigFromLocalStorage();

		if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
			console.log("Changement détecté dans la configuration !");
			config = newConfig;

			// Recharger l'interface utilisateur ou adapter l'affichage selon la nouvelle configuration
			updateConfig(config);
		}
	}, 500);
};

// Fonction pour recharger l'affichage en cas de changement de configuration
const updateConfig = (newConfig) => {
	// Met à jour l'affichage de la section utilisateur selon la nouvelle configuration
	const userSection = document.getElementById("user-section");

	if (!newConfig) return;

	userSection.innerHTML = `
      <div class="station-info column-flex">
        <h2>${newConfig.userName || "Nom de la station"}</h2> 
        <div class="auto-margin" style="width:300px;height:120px">
        <img src="../assets/station-logo.png" class="station-img"
        alt="${newConfig.userName || "Logo de la station"}"></div>
      </div>
    `;
};

const toggleButtonState = (
	index,
	button,
	buttonElement,
	attributs,
	gpiButtons,
	config
) => {
	if (button.state === "error") {
		return;
	}

	// Basculer l'état entre onAir et offAir
	if (button.state === "onAir") {
		button.state = "offAir";
	} else if (button.state === "offAir") {
		button.state = "onAir";
	}

	// Mettre à jour l'apparence
	updateButtonAppearance(index, buttonElement, attributs, gpiButtons);

	// Envoyer le nouvel état au serveur Ember+
	sendStateToEmberServer(button.path, button.state === "onAir");

	// Sauvegarder le nouvel état dans le sessionStorage
	sessionStorage.setItem(button.path, JSON.stringify(button.state));
};

const updateButtonAppearance = (
	index,
	buttonElement,
	attributs,
	gpiButtons
) => {
	const currentState = gpiButtons[index].state;
	const { bgColor, txtColor, img, label } = attributs[currentState];

	buttonElement.style.backgroundColor = bgColor;
	buttonElement.style.color = txtColor;
	buttonElement.innerHTML = `
        <div><h3>${gpiButtons[index].name}</h3></div>
        <div><img src="../assets/${img}" alt="${label}" style="width:40px;height:40px;"></div>
        <div><h2>${label}</h2></div><div>${gpiButtons[index].path}</div>
    `;
};
