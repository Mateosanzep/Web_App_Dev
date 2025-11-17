document.addEventListener("DOMContentLoaded", function () {
	var drums = document.querySelectorAll('.drum');

	for (var i = 0; i < drums.length; i++) {
		drums[i].addEventListener('click', function () {
				var buttonKey = (this.dataset && this.dataset.key) ? this.dataset.key : (this.querySelector && this.querySelector('.label') ? this.querySelector('.label').textContent : this.textContent);
				if (buttonKey) buttonKey = buttonKey.trim().toLowerCase();
				playSound(buttonKey);
				buttonAnimation(buttonKey);
		});
	}

	document.addEventListener('keydown', function (event) {
		var key = event.key.toLowerCase();
		playSound(key);
		buttonAnimation(key);
	});

	function playSound(key) {
		var audioSrc = null;
		switch (key) {
			case 'w':
				audioSrc = 'sounds/tom-1.mp3';
				break;
			case 'a':
				audioSrc = 'sounds/tom-2.mp3';
				break;
			case 's':
				audioSrc = 'sounds/tom-3.mp3';
				break;
			case 'd':
				audioSrc = 'sounds/tom-4.mp3';
				break;
			case 'j':
				audioSrc = 'sounds/snare.mp3';
				break;
			case 'k':
				audioSrc = 'sounds/crash.mp3';
				break;
			case 'l':
				audioSrc = 'sounds/kick-bass.mp3';
				break;
			default:
				return;
		}

		var audio = new Audio(audioSrc);
		audio.play().catch(function (e) {
			console.warn('Audio play failed:', e);
		});
	}

	function buttonAnimation(currentKey) {
			if (!currentKey) return;
			var selector = '[data-key="' + currentKey + '"]';
			var activeButton = document.querySelector(selector);
			if (!activeButton) return;
			activeButton.classList.add('pressed');
			setTimeout(function () {
				activeButton.classList.remove('pressed');
			}, 100);
	}
});
