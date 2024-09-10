import { initNumericPad } from "./numericPad.js";

function setConfigButton(isPasswordDisplayed, isConfigOpen) {
	let div = "";

	if (!isPasswordDisplayed && !isConfigOpen) {
		div = `
        <div>CONFIG</div>
        <div><img src='../assets/gears.svg' width="40px" height="40px"/></div>`;
	} else {
		div = `
        <div>ANNUL</div>
        <div><img src='../assets/abort.svg' width="40px" height="40px"/></div>`;
	}

	return div;
}

export const initHeader = (isConfigOpen, toggleConfig, mdp) => {
	let isPasswordDisplayed = false;
	const header = document.getElementById("app-header");
	let timeIntervalId = null;
	let clickCount = 0;
	let lastClickTime = 0;

	const togglePasswordDisplay = () => {
		if (!isConfigOpen) {
			isPasswordDisplayed = !isPasswordDisplayed;
			renderHeader();
		} else {
			toggleConfig();
		}
	};

	const updateTime = () => {
		const now = new Date();
		const currentDate = document.getElementById("current-date");
		if (currentDate) {
			currentDate.innerHTML = `${now.toLocaleString("fr-fr", {
				weekday: "long",
			})} ${now.toLocaleDateString()}`;
		}
		const currentTime = document.getElementById("current-time");
		if (currentTime) {
			currentTime.innerHTML = `${now.toLocaleTimeString()}`;
		}
	};

	const handleCheck = () => {
		const passwordInput = document.getElementById("config-password").value;
		if (passwordInput === mdp) {
			toggleConfig(!isConfigOpen);
		} else {
			isPasswordDisplayed = false;
			renderHeader();
		}
	};

	const handleSecretClick = () => {
		const now = new Date().getTime();
		if (now - lastClickTime > 1000) {
			clickCount = 0;
		}
		lastClickTime = now;
		clickCount++;
		if (clickCount === 5) {
			const secretDiv = document.getElementById("secret-div");
			secretDiv.style.width = "1px";
			secretDiv.style.height = "1px";
			clickCount = 0;
		}
	};

	const renderHeader = () => {
		if (!isPasswordDisplayed) {
			header.innerHTML = `<div style="width:66px"></div>
        <div id="header-info" class="time">
          <h3><div id="current-date"></div></h3>
          <h2><div id="current-time"></div></h2>
        </div>
        <div id="config-btn-container" class="config header-button"></div>
        <!-- Div cliquable ajoutée -->
        <div id="secret-div" style="position:absolute; top:0px; right:0px; width:80px; height:80px; background-color:#f3f3f3"></div>
      `;

			const secretDiv = document.getElementById("secret-div");
			secretDiv.addEventListener("click", handleSecretClick);

			updateTime();
			timeIntervalId = setInterval(updateTime, 1000);
		} else {
			if (timeIntervalId) {
				clearInterval(timeIntervalId);
			}

			header.innerHTML = `
        <div style="width:405px" id="numeric-pad"></div>
        <div id="header-info" class="row-flex">
          <div class="column-flex" style="width:300px">
            <h3>Mot de passe</h3>
            <form><input id="config-password" type="password" maxlength="4" placeholder="" /></form>
          </div>
          <div id="password-verif" class="header-button" style="background:lightgreen">
            <div>VÉRIF</div>
            <div><img src='../assets/password.svg' width="40px" height="40px"/></div>
          </div>
        <div id="config-btn-container" class="config header-button"></div>
      `;
			document
				.getElementById("password-verif")
				.addEventListener("click", handleCheck);
			initNumericPad("config-password");
		}

		let configBtn = document.getElementById("config-btn-container");
		configBtn.innerHTML = setConfigButton(isPasswordDisplayed, isConfigOpen);
		configBtn.style.background =
			!isPasswordDisplayed && !isConfigOpen ? "darkgrey" : "red";

		configBtn.addEventListener("click", () => {
			togglePasswordDisplay();
		});
	};

	renderHeader();
};
