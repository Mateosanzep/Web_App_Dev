const buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;

const levelTitle = document.getElementById('level-title');

function nextSequence() {
  userClickedPattern = [];
  level++;
  levelTitle.textContent = `Level ${level}`;

  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);
  console.log('Game pattern:', gamePattern);

  const button = document.getElementById(randomChosenColor);
  flashButton(button);
  playSound(randomChosenColor);
}

function flashButton(element) {
  if (!element) return;
  element.classList.add('pressed');
  setTimeout(() => {
    element.classList.remove('pressed');
  }, 200);
}

function playSound(name) {
  const audio = new Audio(`sounds/${name}.mp3`);
  audio.play().catch((e) => {
    console.warn('Sound play prevented:', e);
  });
}

function animatePress(currentColor) {
  const activeButton = document.getElementById(currentColor);
  if (!activeButton) return;
  activeButton.classList.add('pressed');
  setTimeout(() => {
    activeButton.classList.remove('pressed');
  }, 100);
}

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    console.log('success');
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(() => {
        nextSequence();
      }, 1000);
    }
  } else {
    console.log('wrong');
    playSound('wrong');
    document.body.classList.add('game-over');
    setTimeout(() => {
      document.body.classList.remove('game-over');
    }, 200);
    levelTitle.textContent = 'Game over, Press Any Key to Restart';
    startOver();
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
}

const buttons = document.querySelectorAll('.btn');
buttons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const userChosenColor = e.target.id;
    userClickedPattern.push(userChosenColor);
    console.log('User pattern:', userClickedPattern);
    playSound(userChosenColor);
    animatePress(userChosenColor);
    checkAnswer(userClickedPattern.length - 1);
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (!started) {
    levelTitle.textContent = `Level ${level}`;
    nextSequence();
    started = true;
  }
});

levelTitle.addEventListener('click', () => {
  if (!started) {
    nextSequence();
    started = true;
  }
});
