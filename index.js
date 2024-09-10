const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
//const { exec } = require("child_process");

function createWindow() {
	const win = new BrowserWindow({
		width: 720,
		height: 720,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		icon: path.join(__dirname, "assets/appIcon.png"),
	});

	win.loadFile("public/index.html");
	win.webContents.openDevTools({ mode: "detach" }); 

	/* win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools();
  });*/ //remove ** before build

	Menu.setApplicationMenu(null);
}


let config = {};
const loadConfig = () => {
	const configPath = path.join(__dirname, "public/config.json");
	try {
		const data = fs.readFileSync(configPath, "utf8");
		config = JSON.parse(data);
	} catch (err) {
		console.error(
			"Erreur lors du chargement du fichier de configuration :",
			err
		);
		config = null;
	}
};

loadConfig();

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
