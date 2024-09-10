// Fonction pour récupérer la configuration depuis le localStorage
export const getConfigFromLocalStorage = () => {
	const config = localStorage.getItem("appConfig");
	return config ? JSON.parse(config) : null;
};
