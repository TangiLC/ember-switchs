import { getConfigFromLocalStorage } from "./utils.js";

const {
	sendStateToEmberServer,
	getStateFromEmberServer,
} = require("./components/emberClient.js");

let intervalId = null;

export const initUser = async (isConfigOpen) => {
	const userSection = document.getElementById("user-section");
	let config = getConfigFromLocalStorage();

	if (!config) {
		console.error("Configuration manquante dans le localStorage");
		return;
	}
	if (isConfigOpen) {
		clearInterval(intervalId);
		intervalId = null;
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

	// Récupérer les états initiaux des GPI via getStateFromEmberServer
	let gpiButtons = await Promise.all(
		config.buttons
			.filter((button) => button.isActive)
			.map(async (button) => {
				let gpiPath = config.emberServer.gpPath + "gpi" + button.gpi;
				let gpiState = await getStateFromEmberServer(gpiPath);
				const state =
					gpiState !== null ? (gpiState ? "onAir" : "offAir") : "error";

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

	if (intervalId !== null) {
		clearInterval(intervalId);
	}

	// Vérification régulière de l'état des GPI via getStateFromEmberServer toutes les 3000ms
	intervalId = setInterval(async () => {
		if (isConfigOpen) {
			clearInterval(intervalId);
			intervalId = null;
			return;
		}

		// Récupérer la configuration mise à jour du localStorage
		let updatedConfig = getConfigFromLocalStorage();
		if (!updatedConfig) {
			console.error("Configuration manquante dans le localStorage");
			clearInterval(intervalId);
			return;
		}

		// Créer une nouvelle version de gpiButtons avec la configuration mise à jour
		let updatedButtons = await Promise.all(
			updatedConfig.buttons
				.filter((button) => button.isActive)
				.map(async (button, index) => {
					let gpiPath = updatedConfig.emberServer.gpPath + "gpi" + button.gpi;
					const newState = await getStateFromEmberServer(gpiPath);

					// Si l'état a changé, mettre à jour l'apparence du bouton
					const newStateLabel =
						newState !== null ? (newState ? "onAir" : "offAir") : "error";
					const buttonElement = document.getElementById(`button-${index}`);

					// Si l'état a changé ou si la configuration a changé
					if (
						newStateLabel !== gpiButtons[index].state ||
						updatedConfig !== config
					) {
						updateButtonAppearance(index, buttonElement, attributs, gpiButtons);
					}

					// Mettre à jour l'état dans le tableau des boutons
					return {
						name: button.name,
						path: gpiPath,
						state: newStateLabel,
					};
				})
		);

		// Remplacer gpiButtons par la nouvelle version mise à jour
		gpiButtons = updatedButtons;
		config = updatedConfig; // Mise à jour de la configuration globale
	}, 500);
};

const toggleButtonState = (
	index,
	button,
	buttonElement,
	attributs,
	gpiButtons
) => {
	if (button.state === "error") {
		button.state = "onAir"; // Réinitialiser si en erreur
	} else if (button.state === "onAir") {
		button.state = "offAir";
	} else if (button.state === "offAir") {
		button.state = "onAir";
	}
	updateButtonAppearance(index, buttonElement, attributs, gpiButtons);
	sendStateToEmberServer(button.path, button.state === "onAir");
};

const updateButtonAppearance = (
	index,
	buttonElement,
	attributs,
	buttonsArray
) => {
	console.log("gpiButtons", buttonsArray);
	const currentState = buttonsArray[index].state;
	const { bgColor, txtColor, img, label } = attributs[currentState];

	buttonElement.style.backgroundColor = bgColor;
	buttonElement.style.color = txtColor;
	buttonElement.innerHTML = `
        <div><h3>${buttonsArray[index].name}</h3></div>
        <div><img src="../assets/${img}" alt="${label}" style="width:40px;height:40px;"></div>
        <div><h2>${label}</h2></div><div>${buttonsArray[index].path}</div>
    `;
};
