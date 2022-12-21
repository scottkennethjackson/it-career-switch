// Word Script
const getCategory = () => {
    let max = categories.length;
    return Math.floor(Math.random() * max);
};

const categoryPlace = getCategory();

const getWord = (category) => {
    let max = category.length;
    let wordIndex = Math.floor(Math.random() * max);
    return category[wordIndex];
};

const word = "Javascript"/*getWord(categories[categoryPlace]);*/

const setUpWord = () => {
    let wordArray = word.split(" ");

    for (j=0; j<wordArray.length; j++) {
        let eachWord = document.getElementsByClassName(`index${j}`);
        eachWord[0].classList.add("word");

        for (i=0; i<wordArray[j].length; i++) {
            let letter = wordArray[j][i];

            tile = document.createElement("div");
            tile.dataset.letter = (letter === " ") ? " " : letter.toLowerCase();
            tile.dataset.tag = (letter === " ") ? " " : letter.toLowerCase();
            tile.className = (letter === " ") ? " " : "tile unflipped";
            eachWord[0].insertAdjacentElement("beforeend", tile);
        }
    }
};

// Lives Script
let livesLeft = 10;
const livesCounter = document.querySelector("#lives-counter");

const setUpLives = () => {
    livesCounter.innerHTML = `${livesLeft}`;
};

const reduceLives = () => {
    livesLeft - 1; 
};

// Hint Script
const categoryNames = ["Activity", "Animal", "Colour", "Country", "Film", "Musician / Band"];
const hintButton = document.getElementById("hint-button");

hintButton.addEventListener("click", function() {
    hintButton.innerHTML = categoryNames[categoryPlace];
    hintButton.classList.add("revealed");
})

// Game Script
window.onload = () => {
    setUpWord();
    startGame();
};

const startGame = () => {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

const handleMouseClick = (e) => {
    if (e.target.matches("[data-key")) {
        pressKey(e.target.dataset.key);
        return;
    }
};

const handleKeyPress = (e) => {
    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key);
        return;
    }
};

const pressKey = (key) => {
    key = key.toUpperCase();

    let wordUpper = word.toUpperCase();
    let pressedKey = document.querySelector(`[data-key=${key}]`);

    if (wordUpper.includes(key)) {
        correctGuess(pressedKey, key);

        let emptyTiles = document.getElementsByClassName("tile");

        if (!emptyTiles.length) {
            switch(true) {
                case (livesLeft > 8): congratulations = "Impressive";
                break;
                case (livesLeft > 5): congratulations = "Awesome";
                break;
                case (livesLeft > 2): congratulations = "Well done";
                break;
                case (livesLeft > 0): congratulations = "Phew!";
                break;
            };

            stopGame();
            bounceTiles()
            showAlert(congratulations);
        }
    } else {
        pressedKey.classList.add("incorrect");
        reduceLives(livesLeft--);
        livesCounter.innerHTML = `${livesLeft}`;

        if (livesLeft == 0) {
            let remainingTiles = document.querySelectorAll(`[class="tile unflipped"]`);
            remainingTiles.forEach(remainingTile => {
                remainingTile.className = "missing flipped";
                remainingTile.innerHTML = remainingTile.dataset.tag;
            })

            stopGame();
            shakeTiles();
            showAlert("Better luck next time");
        };
    }
};

const correctGuess = (pressedKey, key) => {
    pressedKey.className = "key correct";

    let correctKeys = document.querySelectorAll([`[data-letter=${key.toLowerCase()}]`]);
    correctKeys.forEach(correctKey => {
        correctKey.className = "correct flipped";
        correctKey.innerHTML = key;
    })
};

// Post-game Script
const playAgain = document.getElementById("alert-container");
const hideCountdown = document.getElementById("countdown-container");

const stopGame = () => {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);

    playAgain.classList.add("visible");
    hideCountdown.classList.add("hidden");
}

const alert = document.querySelector("#alert");

const showAlert = (message) => {
    alert.innerHTML = message;
};

let gameReset = document.getElementById("play-again");

gameReset.addEventListener("click", function() {
    location.reload();
})

// Victory Script
function bounceTiles() {
    const answer = document.getElementById("word-container");
    
    answer.className = "bounce";
}

// Failure Script
function shakeTiles() {
    const answer = document.getElementById("word-container");
    
    answer.className = "shake";
}