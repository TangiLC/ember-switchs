//import getEmberTree from "./emberTree.js";

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "/user/config.json");

export const initConfig = async (isConfigOpen, toggleConfig) => {
	const configSection = document.getElementById("config-section");
	let configUpdate = {};
	const secretDiv = document.getElementById("secret-div");
	if (isConfigOpen) {
		secretDiv.style.width = "1px";
		secretDiv.style.height = "1px";
	}

	try {
		const localConfig = localStorage.getItem("appConfig");
		if (localConfig) {
			configUpdate = JSON.parse(localConfig);
			console.log(
				"Configuration chargée depuis le localStorage :",
				configUpdate
			);
		} else {
			const response = await fetch("../config.json");
			if (response.ok) {
				configUpdate = await response.json();
				localStorage.setItem("appConfig", JSON.stringify(configUpdate));
				console.log(
					"Configuration chargée depuis config.json et stockée dans le localStorage :",
					configUpdate
				);
			} else {
				console.error("Impossible de charger la configuration");
			}
		}
	} catch (error) {
		console.error("Erreur lors du chargement de la configuration :", error);
	}

	let nodeTree = { error: 1 };
	/*try {
		nodeTree = await getEmberTree(
			configUpdate.emberServer?.ip || "",
			configUpdate.emberServer?.port || 0
		);
	} catch (error) {
		nodeTree = { error: `${error}` };
	}*/
	const nodeTreeString = JSON.stringify(nodeTree, null, 2);

	if (!isConfigOpen) {
		configSection.innerHTML = "";
		return;
	}

	// Remplir le formulaire avec les données de config
	configSection.innerHTML = `<div>
      <h3>Configuration</h3></div>
      <form id="configForm"><div class="row-flex centered-div">
      <div class="row-flex">
          <label for "userName" class="std-label"><h4>Station :</h4></label>
          <input type="text" id="userName" value="${
						configUpdate.userName || ""
					}" required></div>
        <div style="width:150px;height:60px"><img src="../assets/broadcast.svg" class="station-img"/></div>
        </div><div class="row-flex centered-div">
        <div class="row-flex auto-margin">
          <label for="configMdp" class="std-label">mot de passe :</label>
          <input type="password" id="configMdp" value="${
						configUpdate.configMdp || ""
					}" required>
        </div>
        <div class="row-flex auto-margin">
          &nbsp;
        </div></div></br><div>
      <h3>Serveur Ember+</h3></div>
        <div class="row-flex centered-div">
          <div class="row-flex auto-margin">
          <label for="emberServerIp" class="std-label">Adresse IP :</label>
          <input type="text" id="emberServerIp" value="${
						configUpdate.emberServer?.ip || ""
					}" required>
          </div>
          <div class="row-flex auto-margin">
          <label for="emberServerPort" class="std-label">Port Ember+ :</label>
          <input type="number" id="emberServerPort" value="${
						configUpdate.emberServer?.port || ""
					}" required>
          </div>
          </div>
        <div class="row-flex centered-div">
        <div class="row-flex">
          <label for="emberGpPath" class="std-label">GPI/O Path:</label>
          <input type="text" id="emberGpPath" value="${
						configUpdate.emberServer?.gpPath || ""
					}" required>
          </div><div class="row-flex">&nbsp;</div>
        </div>
          </br><div><h3>Boutons</h3></div>
        ${configUpdate.buttons
					?.map(
						(button, index) => `
          <div class="row-flex centered-div"><h4>n°${index + 1}  :</h4>
          <div>
            <label for="isActive${index}">Actif :</label>
            <input type="checkbox" id="isActive${index}" ${
							button.isActive ? "checked" : ""
						}>
          </div>
          <div>
            <label for="name${index}">Nom :</label>
            <input type="text" id="name${index}" value="${button.name || ""}" >
          </div>
          <div>
            <label for="gpi${index}">gpi# :</label>
            <input type="number" size="3" id="gpi${index}" value="${
							button.gpi || ""
						}" class="small-input" >
          </div>
          <div>
            <label for="gpo${index}">gpo# :</label>
            <input type="number" size="3" id="gpo${index}" value="${
							button.gpo || ""
						}" class="small-input" >
          </div></div>
        `
					)
					.join("")}</br>
                    <pre>${nodeTreeString}</pre>
        <div class="row-flex centered-div">
            <button type="submit" class="form-button">Valider</button></div>
      </form>
    `;

	// Gérer la soumission du formulaire pour enregistrer les données dans config.json
	document.getElementById("configForm").addEventListener("submit", (event) => {
		event.preventDefault();

		// Récupérer les nouvelles valeurs du formulaire
		const userName = document.getElementById("userName").value;
		const configMdp = document.getElementById("configMdp").value;
		const emberServerIp = document.getElementById("emberServerIp").value;
		const emberServerPort = document.getElementById("emberServerPort").value;
		const emberGpPath = document.getElementById("emberGpPath").value;

		const buttons = configUpdate.buttons.map((button, index) => ({
			isActive: document.getElementById(`isActive${index}`).checked,
			name: document.getElementById(`name${index}`).value,
			gpi: parseInt(document.getElementById(`gpi${index}`).value, 10),
			gpo: parseInt(document.getElementById(`gpo${index}`).value, 10),
		}));

		// Nouvelle configuration mise à jour
		const updatedConfig = {
			userName,
			configMdp,
			emberServer: {
				ip: emberServerIp,
				port: parseInt(emberServerPort, 10),
				gpPath: emberGpPath,
			},
			buttons,
		};
		localStorage.setItem("appConfig", JSON.stringify(updatedConfig));

		// Enregistrer la configuration dans config.json
		fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), (err) => {
			if (err) {
				console.error("Erreur lors de la mise à jour de config.json:", err);
				alert("Erreur lors de la mise à jour de la configuration.");
			} else {
				alert("Configuration mise à jour avec succès !");
				toggleConfig();
			}
		});
	});
};
