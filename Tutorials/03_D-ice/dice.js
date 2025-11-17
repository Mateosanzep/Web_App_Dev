function rollDice() {
  const randomNumber1 = Math.floor(Math.random() * 6) + 1;
  const randomNumber2 = Math.floor(Math.random() * 6) + 1;

  const img1 = document.querySelector('.img1');
  const img2 = document.querySelector('.img2');
  if (img1) img1.src = `images/dice${randomNumber1}.png`;
  if (img2) img2.src = `images/dice${randomNumber2}.png`;

  const title = document.querySelector('h1');
  if (title) {
    if (randomNumber1 > randomNumber2) {
      title.textContent = '🚩 Player 1 Wins!';
    } else if (randomNumber2 > randomNumber1) {
      title.textContent = 'Player 2 Wins! 🚩';
    } else {
      title.textContent = "It's a Draw!";
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('rollBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      rollDice();
      btn.blur();
    });
  }
  rollDice();
});
