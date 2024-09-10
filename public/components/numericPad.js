export const initNumericPad = (inputId) => {
	const numericPadContainer = document.getElementById("numeric-pad");
	const deleteButton = document.createElement("button");
	deleteButton.innerText = "X";
	deleteButton.classList.add("delete-btn");
	deleteButton.addEventListener("click", () => {
		removeLastCharacter(inputId);
	});
	numericPadContainer.appendChild(deleteButton);
	for (let i = 0; i <= 9; i++) {
		const button = document.createElement("button");
		button.innerText = i;
		button.classList.add("numeric-btn");
		button.addEventListener("click", () => {
			appendToInput(inputId, i);
		});
		numericPadContainer.appendChild(button);
	}
};

const appendToInput = (inputId, value) => {
	const input = document.getElementById(inputId);
	if (input.value.length < 4) {
		input.value += value;
	}
};

const removeLastCharacter = (inputId) => {
	const input = document.getElementById(inputId);
	input.value = input.value.slice(0, -1);
};
