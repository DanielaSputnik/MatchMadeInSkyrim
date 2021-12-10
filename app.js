
document.addEventListener('DOMContentLoaded', () => {
    const boardGrid = document.querySelector('.grid');
    const boardWidth = 12;
    const tiles = [];
    const timeLimit = 60;
    const startFreeGameBtn = document.querySelector('#startFreeBtn');
    const startTimerBtn = document.querySelector('#startTimerBtn');
    const endTimerBtn = document.querySelector('#EndTimerBtn');
    let gameIsOnInterval;
    const timeLeftDisplay = document.querySelector('#timeLeft');
    const scoreDisplay = document.querySelector('#score');
    let score = 0;
    const highestTimedScore = document.querySelector('#highestTimedScore');
    const highestFreeScore = document.querySelector('#highestFreeScore');

    const soundToggle = document.getElementById('sound-toggle');
    const slideAudio = new Audio('Resources/DwarvenChest.mp3');
    const matchAudio = new Audio('Resources/Match.mp3');
    const endAudio = new Audio('Resources/TimerEnd.mp3');
    let soundOn = false;

    const shuffleBtn = document.querySelector('#shuffleBtn');

    const iconColors = [
        'url(Resources/Ninroot-g.png)',
        'url(Resources/Soul-Gem-g.png)',
        'url(Resources/Sweetroll-g.png)',
        'url(Resources/Icon-g.png)',
        'url(Resources/Tome-g.png)',
        'url(Resources/Poison-g.png)',
        'url(Resources/ChickenBorn-g.png)',
        'url(Resources/Chest-g.png)'
    ]

    //BUTTON EMPOWERMENT :D
    function disableBtn(button) {
        button.disabled = true;
        button.style.color = '#3a3b3d96';
    }
    function enableBtn(button) {
        button.disabled = false;
        button.style.color = 'black';

    }

    //SOUND TOGGLE
    function toggleSound() {
        if (soundToggle.checked) {
            soundOn = true;
        }
        else {
            soundOn = false;
        }
    }
    soundToggle.addEventListener('click', () => {
        toggleSound();
    })

    //HIGHEST SCORES STORAGE
    const getHighestTimedScore = localStorage.getItem("playerHighestTimedScore");
    if (getHighestTimedScore) {
        highestTimedScore.innerText = getHighestTimedScore;
    }

    const getHighestFreeScore = localStorage.getItem("playerHighestFreeScore");
    if (getHighestFreeScore) {
        highestFreeScore.innerText = getHighestFreeScore;
    }

    function recordIfHighestScore(score, getHighestScore, highestScore, scoreStorage) {
        if (score > getHighestScore) {
            localStorage.setItem(scoreStorage, score);
            highestScore.innerText = score;
        };
    }
    //BOARD SET-UP
    function createBoard() {
        for (let i = 0; i < boardWidth * boardWidth; i++) {
            const tile = document.createElement('div');
            tile.setAttribute('draggable', true);
            tile.setAttribute('id', i);
            let randomColor = Math.floor(Math.random() * iconColors.length);
            tile.style.backgroundImage = iconColors[randomColor];
            boardGrid.appendChild(tile);
            tiles.push(tile);
        }
    }
    createBoard()

    //BOARD RE-SHUFFLE
    function shuffleBoard() {
        for (var i = 0; i < tiles.length; i++) {
            tiles[i].backgroundImage = '';
            let randomColor = Math.floor(Math.random() * iconColors.length);
            tiles[i].style.backgroundImage = iconColors[randomColor];
        };
    }
    shuffleBtn.addEventListener('click', () => {
        shuffleBoard();
    })

    //ICON MANIPULATION
    let tileBeingDragged;
    let tileBeingReplaced;
    let tileIdBeingDragged;
    let tileIdBeingReplaced;

    tiles.forEach(tile =>
        tile.addEventListener('dragstart', dragStart) &
        tile.addEventListener('dragend', dragEnd) &
        tile.addEventListener('dragover', dragOver) &
        tile.addEventListener('dragenter', dragEnter) &
        tile.addEventListener('drageleave', dragLeave) &
        tile.addEventListener('drop', dragDrop)
    );

    function dragStart() {
        tileBeingDragged = this.style.backgroundImage;
        tileIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {
        this.style.backgroundImage = '';
    }

    function dragDrop() {
        soundOn ? slideAudio.play() : slideAudio.pause();
        tileBeingReplaced = this.style.backgroundImage;
        tileIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = tileBeingDragged;
        tiles[tileIdBeingDragged].style.backgroundImage = tileBeingReplaced;
    }

    //CHECK MOVE VALIDITY ON DRAG END
    function dragEnd() {

        let validMoves = [
            tileIdBeingDragged - boardWidth,
            tileIdBeingDragged + boardWidth,
        ]
        if (tileIdBeingDragged % boardWidth != 0) {
            validMoves.push(tileIdBeingDragged - 1);
        }
        if (tileIdBeingDragged % boardWidth != boardWidth - 1) {
            validMoves.push(tileIdBeingDragged + 1);
        }

        let isValidMove = validMoves.includes(tileIdBeingReplaced);

        if (tileIdBeingReplaced && isValidMove) {
            tileIdBeingReplaced = null;
        } else if (tileIdBeingReplaced && !isValidMove) {
            tiles[tileIdBeingReplaced].style.backgroundImage = tileBeingReplaced;
            tiles[tileIdBeingDragged].style.backgroundImage = tileBeingDragged;
        } else if (tileIdBeingReplaced === 0 && !isValidMove) {
            tiles[tileIdBeingReplaced].style.backgroundImage = tileBeingReplaced;
            tiles[tileIdBeingDragged].style.backgroundImage = tileBeingDragged;
        } else if (tileIdBeingReplaced === 0 && isValidMove) {
            tileIdBeingReplaced = null;
        } else {
            tiles[tileIdBeingDragged].style.backgroundImage = tileBeingDragged;
        }
    }


    //CHECKING FOR MATCHES
    //->ROWS x3
    function checkRowForThree() {
        for (let i = 0; i < (boardWidth * boardWidth) - 1; i++) {
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (i % boardWidth > boardWidth - 3) continue
            if (rowOfThree.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                rowOfThree.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point);
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }

    //->ROWS x4
    function checkRowForFour() {
        for (i = 0; i < (boardWidth * boardWidth) - 2; i++) {
            let rowOfFour = [i, i + 1, i + 2, i + 3];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (i % boardWidth > boardWidth - 4) continue
            if (rowOfFour.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                rowOfFour.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point);
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->ROWS x5
    function checkRowForFive() {
        for (i = 0; i < (boardWidth * boardWidth) - 2; i++) {
            let rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (i % boardWidth > boardWidth - 5) continue
            if (rowOfFive.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 5;
                scoreDisplay.innerHTML = score;
                rowOfFive.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point);
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->COLUMNS x3
    function checkColumnForThree() {
        for (i = 0; i < (boardWidth * (boardWidth - 2)); i++) {
            let columnOfThree = [i, i + boardWidth, i + boardWidth * 2];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (columnOfThree.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                columnOfThree.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point);
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->COLUMNS x4
    function checkColumnForFour() {
        for (i = 0; i < (boardWidth * (boardWidth - 3)); i++) {
            let columnOfFour = [i, i + boardWidth, i + boardWidth * 2, i + boardWidth * 3];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (columnOfFour.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                columnOfFour.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point)
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->COLUMNS x5
    function checkColumnForFive() {
        for (i = 0; i < (boardWidth * (boardWidth - 5)); i++) {
            let columnOfFive = [i, i + boardWidth, i + boardWidth * 2, i + boardWidth * 3, i + boardWidth * 4];
            let decidedColor = tiles[i].style.backgroundImage;
            const isBlank = tiles[i].style.backgroundImage === '';
            if (columnOfFive.every(index => tiles[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 5;
                scoreDisplay.innerHTML = score
                columnOfFive.forEach(index => {
                    const point = document.createElement('img');
                    point.src = 'Resources/Point.png';
                    tiles[index].appendChild(point);
                    setTimeout(() => { tiles[index].removeChild(point) }, 100);
                    tiles[index].style.backgroundImage = '';
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }

    //MOVE ICONS DOWN & GENERATE NEW ICONS
    function moveDownGenerateNewTiles() {
        for (i = 0; i < (boardWidth * boardWidth) - boardWidth; i++) {
            if (tiles[i + boardWidth].style.backgroundImage === '') {
                tiles[i + boardWidth].style.backgroundImage = tiles[i].style.backgroundImage
                tiles[i].style.backgroundImage = ''
            }
            const isFirstRow = ([...Array(12).keys(0)].slice(0)).includes(i);
            if (isFirstRow && tiles[i].style.backgroundImage === '') {
                let randomColor = Math.floor(Math.random() * iconColors.length)
                tiles[i].style.backgroundImage = iconColors[randomColor]
            }
        }
    }

    //START AND PAUSE THE FREE MODE GAME
    function clearScore() {
        score = 0;
        scoreDisplay.innerHTML = score;
    }

    function startFreeGameToggle() {
        if (gameIsOnInterval) {
            clearInterval(gameIsOnInterval);
            gameIsOnInterval = null;
            startFreeGameBtn.innerText = 'START FREE MODE';
            startFreeGameBtn.style.color = 'inherit';
            enableBtn(startTimerBtn);
            enableBtn(shuffleBtn);
            recordIfHighestScore(score, getHighestFreeScore, highestFreeScore, 'playerHighestFreeScore');
            shuffleBoard();
            clearScore();
        } else {
            soundOn ? endAudio.play() : endAudio.pause();
            gameIsOnInterval = window.setInterval(function () {
                moveDownGenerateNewTiles();
                checkRowForFive();
                checkRowForFour();
                checkRowForThree();
                checkColumnForFive();
                checkColumnForFour();
                checkColumnForThree();
            }, 150);
            startFreeGameBtn.innerText = 'END FREE MODE';
            startFreeGameBtn.style.color = '#831907';
            disableBtn(startTimerBtn);
            disableBtn(shuffleBtn);
        }
    }
    startFreeGameBtn.onclick = function () {
        startFreeGameToggle();
    }

    //START AND PAUSE THE TIMER GAME MODE 
    var timeLeft = timeLimit;

    function resetTimer() {
        timeLeft = timeLimit;
        timeLeftDisplay.innerHTML = timeLeft;
    }

    var cancelGame = false;
    function endTimer() {
        cancelGame = true;
    }

    function startTimedGame() {
        var timerDisplay = document.querySelector("#timer-display");

        const gameOn = setInterval(function () {
            moveDownGenerateNewTiles();
            checkRowForFive();
            checkRowForFour();
            checkRowForThree();
            checkColumnForFive();
            checkColumnForFour();
            checkColumnForThree();
        }, 150)

        const timerInterval = setInterval(function () {
            if (timeLeft < 1) {
                clearInterval(gameOn);
                soundOn ? endAudio.play() : endAudio.pause();
                recordIfHighestScore(score, getHighestTimedScore, highestTimedScore, 'playerHighestTimedScore')
                alert('Time is up!\nYour score is: ' + score);
                clearInterval(timerInterval);
                clearScore();
                resetTimer();
                shuffleBoard();
                enableBtn(startFreeGameBtn);
                enableBtn(shuffleBtn);
                enableBtn(startTimerBtn);
                startTimerBtn.innerText = 'START TIMER MODE';
                endTimerBtn.style.display = 'none';
                startTimerBtn.style.color = 'inherit';
            }
            else if (cancelGame) {
                clearInterval(gameOn);
                clearInterval(timerInterval);
                clearScore();
                resetTimer();
                shuffleBoard();
                enableBtn(startFreeGameBtn);
                enableBtn(shuffleBtn);
                enableBtn(startTimerBtn);
                startTimerBtn.innerText = 'START TIMER MODE';
                startTimerBtn.style.color = 'inherit';
                endTimerBtn.style.display = 'none';
                cancelGame = false;
            }
            else {
                timeLeft -= 1;
                timerDisplay.style.display = 'flex';
                timeLeftDisplay.innerText = timeLeft;
                startTimerBtn.innerText = 'THE GAME IS ON!';
                disableBtn(startFreeGameBtn);
                disableBtn(startTimerBtn);
                disableBtn(shuffleBtn);
                endTimerBtn.style.display = 'flex';
            }
        }, 1000);
    }

    startTimerBtn.onclick = function () {
        startTimedGame();
    }
    endTimerBtn.onclick = function () {
        endTimer();
    }
})