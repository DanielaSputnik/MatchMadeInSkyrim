
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    const width = 12
    const squares = []
    const timeLimit = 60
    const startFreeGameBtn = document.querySelector('#startFreeBtn')
    const startTimerBtn = document.querySelector('#startTimerBtn')
    const endTimerBtn = document.querySelector('#EndTimerBtn')
    let gameIsOnInterval
    const timeLeftDisplay = document.querySelector('#timeLeft');
    const scoreDisplay = document.querySelector('#score')
    let score = 0
    const highestTimedScore = document.querySelector('#highestTimedScore')
    const highestFreeScore = document.querySelector('#highestFreeScore')

    const soundToggle = document.getElementById('sound-toggle')
    const slideAudio = new Audio('Icons/DwarvenChest.mp3')
    const matchAudio = new Audio('Icons/Match.mp3')
    const endAudio = new Audio('Icons/TimerEnd.mp3')
    let soundOn = false

    const shuffleBtn = document.querySelector('#shuffleBtn')

    const iconColors = [
        'url(Icons/Ninroot-g.png)',
        'url(Icons/Soul-Gem-g.png)',
        'url(Icons/Sweetroll-g.png)',
        'url(Icons/Icon-g.png)',
        'url(Icons/Tome-g.png)',
        'url(Icons/Poison-g.png)',
        'url(Icons/ChickenBorn-g.png)',
        'url(Icons/Chest-g.png)'
    ]

//BUTTON EMPOWERMENT :D
    function disableBtn(button) {
        button.disabled = true
        button.style.color  = '#3a3b3d96'
    }
    function enableBtn(button) {
        button.disabled = false
        button.style.color  = 'black'

    }

//SOUND TOGGLE
    function toggleSound() {
        if (soundToggle.checked) {
            soundOn = true
        }
        else {
            soundOn = false
        }
    }
    soundToggle.addEventListener('click', () => {
        toggleSound()
    })

//HIGHEST SCORES STORAGE
    const getHighestTimedScore = localStorage.getItem("playerHighestTimedScore");
    if (getHighestTimedScore) {
        highestTimedScore.innerText = getHighestTimedScore
    }

    const getHighestFreeScore = localStorage.getItem("playerHighestFreeScore");
    if (getHighestFreeScore) {
        highestFreeScore.innerText = getHighestFreeScore
    }

    function recordIfHighestScore(score, getHighestScore, highestScore, scoreStorage){
        if (score > getHighestScore) {
                    localStorage.setItem(scoreStorage, score);
                    highestScore.innerText = score;
        };
    }
//BOARD SET-UP
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div')
            square.setAttribute('draggable', true)
            square.setAttribute('id', i)
            let randomColor = Math.floor(Math.random() * iconColors.length)
            square.style.backgroundImage = iconColors[randomColor]
            grid.appendChild(square)
            squares.push(square)
        }
    }
    createBoard()

//BOARD RE-SHUFFLE
    function shuffleBoard() {
        for (var i = 0; i < squares.length; i++) {
            squares[i].backgroundImage = '';
            let randomColor = Math.floor(Math.random() * iconColors.length)
            squares[i].style.backgroundImage = iconColors[randomColor]
        };
    }
    shuffleBtn.addEventListener('click', () => {
        shuffleBoard()
    })

//ICON MANIPULATION
    let iconBeingDragged
    let iconBeingReplaced
    let squareIdBeingDragged
    let squareIdBeingReplaced

    squares.forEach(square => 
        square.addEventListener('dragstart', dragStart) &
        square.addEventListener('dragend', dragEnd) &
        square.addEventListener('dragover', dragOver) &
        square.addEventListener('dragenter', dragEnter) &
        square.addEventListener('drageleave', dragLeave) &
        square.addEventListener('drop', dragDrop)
    );
    
    function dragStart() {
        iconBeingDragged = this.style.backgroundImage
        squareIdBeingDragged = parseInt(this.id)
    }

    function dragOver(e) {
        e.preventDefault()
    }

    function dragEnter(e) {
        e.preventDefault()
    }

    function dragLeave() {
        this.style.backgroundImage = ''
    }

    function dragDrop() {
        soundOn ? slideAudio.play() : slideAudio.pause();
        iconBeingReplaced = this.style.backgroundImage
        squareIdBeingReplaced = parseInt(this.id)
        this.style.backgroundImage = iconBeingDragged
        squares[squareIdBeingDragged].style.backgroundImage = iconBeingReplaced
    }

    //CHECK MOVE VALIDITY ON DRAG END
    function dragEnd() {
    
        let validMoves = [
            squareIdBeingDragged - width,
            squareIdBeingDragged + width,
        ]
        if (squareIdBeingDragged % width != 0) {
            validMoves.push(squareIdBeingDragged - 1)
        }
        if (squareIdBeingDragged % width != width-1) {
            validMoves.push(squareIdBeingDragged + 1)
        }
        
        let isValidMove = validMoves.includes(squareIdBeingReplaced)

        if (squareIdBeingReplaced && isValidMove) {
            squareIdBeingReplaced = null            
        } else if (squareIdBeingReplaced && !isValidMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = iconBeingReplaced
            squares[squareIdBeingDragged].style.backgroundImage = iconBeingDragged
        } else if (squareIdBeingReplaced === 0 && !isValidMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = iconBeingReplaced
            squares[squareIdBeingDragged].style.backgroundImage = iconBeingDragged
        } else if (squareIdBeingReplaced === 0 && isValidMove) {
            squareIdBeingReplaced = null
        }else {
            squares[squareIdBeingDragged].style.backgroundImage = iconBeingDragged
        }
    }


    //CHECKING FOR MATCHES
    //->ROWS x3
    function checkRowForThree() {
        for (let i = 0; i < (width * width) - 1; i++) {
            let rowOfThree = [i, i+1, i+2]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (i % width > width - 3) continue
            if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3
                scoreDisplay.innerHTML = score
                rowOfThree.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }

    //->ROWS x4
    function checkRowForFour() {
        for (i = 0; i < (width * width) - 2; i++) {
            let rowOfFour = [i, i+1, i+2, i+3]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (i % width > width - 4) continue               
            if (rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4
                scoreDisplay.innerHTML = score
                rowOfFour.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->ROWS x5
    function checkRowForFive() {
        for (i = 0; i < (width * width) - 2; i++) {
            let rowOfFive = [i, i + 1, i + 2, i + 3, i + 4]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (i % width > width - 5) continue
            if (rowOfFive.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank )) {
                score += 5
                scoreDisplay.innerHTML = score
                rowOfFive.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->COLUMNS x3
    function checkColumnForThree() {
        for (i = 0; i < (width*(width-2)); i++) {
            let columnOfThree = [i, i+width, i+width*2]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3
                scoreDisplay.innerHTML = score
                columnOfThree.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            } 
        }
    }
    //->COLUMNS x4
    function checkColumnForFour() {
        for (i = 0; i < (width*(width-3)); i++) {
            let columnOfFour = [i, i+width, i+width*2, i+width*3]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4
                scoreDisplay.innerHTML = score
                columnOfFour.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }
    //->COLUMNS x5
    function checkColumnForFive() {
        for (i = 0; i < (width*(width-5)); i++) {
            let columnOfFive = [i, i+width, i+width*2, i+width*3, i+width*4]
            let decidedColor = squares[i].style.backgroundImage
            const isBlank = squares[i].style.backgroundImage === ''
            if (columnOfFive.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 5
                scoreDisplay.innerHTML = score
                columnOfFive.forEach(index => {
                    const point = document.createElement('img')
                    point.src = 'Icons/Point.png'
                    squares[index].appendChild(point)
                    setTimeout(() => {squares[index].removeChild(point)}, 100)
                    squares[index].style.backgroundImage = ''
                    soundOn ? matchAudio.play() : matchAudio.pause();
                })
            }
        }
    }

    //MOVE ICONS DOWN & GENERATE NEW ICONS
    function moveDownFillGaps() {
        for (i = 0; i < (width * width) - width; i++) {
            if (squares[i + width].style.backgroundImage === '') {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage
                squares[i].style.backgroundImage = ''
            }
            const isFirstRow = ([...Array(12).keys(0)].slice(0)).includes(i);
            if (isFirstRow && squares[i].style.backgroundImage === '') {
                    let randomColor = Math.floor(Math.random() * iconColors.length)
                    squares[i].style.backgroundImage = iconColors[randomColor]
                }
        }
    }

//START AND PAUSE THE FREE MODE GAME
    function clearScore() {
        score = 0
        scoreDisplay.innerHTML = score
    }
    function startFreeGameToggle () {
        if (gameIsOnInterval) {
            clearInterval(gameIsOnInterval)
            gameIsOnInterval = null
            startFreeGameBtn.innerText = 'START FREE MODE'
            startFreeGameBtn.style.color = 'inherit'
            enableBtn(startTimerBtn)
            enableBtn(shuffleBtn)
            recordIfHighestScore(score, getHighestFreeScore, highestFreeScore, 'playerHighestFreeScore')
            shuffleBoard();
            clearScore()
        } else {
            soundOn ? endAudio.play() : endAudio.pause();
            gameIsOnInterval = window.setInterval(function () {
                moveDownFillGaps()
                checkRowForFive() 
                checkRowForFour()                
                checkRowForThree()
                checkColumnForFive()
                checkColumnForFour()
                checkColumnForThree()
            }, 150)            
            startFreeGameBtn.innerText = 'END FREE MODE'
            startFreeGameBtn.style.color = '#831907'
            disableBtn(startTimerBtn)
            disableBtn(shuffleBtn)
        }
    }
    startFreeGameBtn.onclick = function () {
        startFreeGameToggle()
    }  

//START AND PAUSE THE TIMER GAME MODE 
    var timeLeft = timeLimit

    function resetTimer() {
        timeLeft = timeLimit
        timeLeftDisplay.innerHTML = timeLeft
    }
    var cancelGame = false
    function endTimer() {
        cancelGame = true
    }

    function startTimedGame() {
        var timerDisplay = document.querySelector("#timer-display");

        const gameOn = setInterval(function () {
            moveDownFillGaps();
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
                enableBtn(startFreeGameBtn)
                enableBtn(shuffleBtn)
                enableBtn(startTimerBtn)
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
                enableBtn(startFreeGameBtn)
                enableBtn(shuffleBtn)
                enableBtn(startTimerBtn)
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
        startTimedGame()
    }
    endTimerBtn.onclick = function () {
        endTimer()
    }
})