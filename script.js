const state = {
  place: '',
  date: '',
  time: '',
  noAttempts: 0
};

const screens = [...document.querySelectorAll('.screen')];
const progress = [...document.querySelectorAll('.progress span')];
const noButton = document.querySelector('#no-button');
const yesButton = document.querySelector('#yes-button');
const choiceStage = document.querySelector('#choice-stage');
const choiceRow = document.querySelector('#choice-row');
const noHint = document.querySelector('#no-hint');
const heartField = document.querySelector('#heart-field');
const loveButton = document.querySelector('#love-button');
const reasonReveal = document.querySelector('#reason-reveal');
const musicPlayer = document.querySelector('#music-player');
const audibleSongUrl = 'https://www.youtube-nocookie.com/embed/IeqxLuwDx2c?autoplay=1&loop=1&playlist=IeqxLuwDx2c&controls=0&modestbranding=1&rel=0';
let musicStarted = false;

async function copyMessage(message) {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = message;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    return copied;
  }
}

function createHeart() {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = '♥';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty('--heart-size', `${12 + Math.random() * 22}px`);
  heart.style.setProperty('--heart-duration', `${10 + Math.random() * 9}s`);
  heart.style.setProperty('--heart-delay', `${Math.random() * -16}s`);
  heart.style.setProperty('--heart-drift', `${-80 + Math.random() * 160}px`);
  heart.style.setProperty('--heart-opacity', `${0.35 + Math.random() * 0.45}`);
  heart.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    heart.classList.add('is-loved');
    for (let index = 0; index < 5; index += 1) {
      const spark = document.createElement('span');
      spark.className = 'heart-spark';
      spark.textContent = index % 2 ? '✦' : '♥';
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty('--spark-x', `${-42 + Math.random() * 84}px`);
      spark.style.setProperty('--spark-y', `${-42 + Math.random() * 84}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 750);
    }
    setTimeout(() => heart.remove(), 650);
  });
  heartField.appendChild(heart);
}

for (let index = 0; index < 14; index += 1) createHeart();

function showScreen(number) {
  if (number === 1) {
    choiceRow.appendChild(noButton);
    noButton.hidden = false;
    noButton.style.position = '';
    noButton.style.left = '';
    noButton.style.top = '';
    noButton.style.zIndex = '';
  } else {
    noButton.hidden = true;
  }
  screens.forEach((screen) => {
    const active = screen.dataset.screen === String(number);
    screen.hidden = !active;
    screen.classList.toggle('screen-active', active);
  });
  progress.forEach((bar, index) => bar.classList.toggle('progress-current', index < number));
  window.scrollTo(0, 0);
}

function createFlowerBurst(centerX, centerY) {
  const petals = ['♥', '✿', '♥', '✦', '♥', '✿', '♥', '✦', '♥', '✿', '♥', '✦'];

  petals.forEach((petal, index) => {
    const element = document.createElement('span');
    const angle = (Math.PI * 2 * index) / petals.length;
    const distance = 72 + Math.random() * 55;
    element.className = 'flower-petal';
    element.textContent = petal;
    element.style.left = `${centerX}px`;
    element.style.top = `${centerY}px`;
    element.style.setProperty('--petal-x', `${Math.cos(angle) * distance}px`);
    element.style.setProperty('--petal-y', `${Math.sin(angle) * distance}px`);
    element.style.setProperty('--petal-rotation', `${-40 + Math.random() * 80}deg`);
    element.style.animationDelay = `${index * 18}ms`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 1100);
  });

}

function bloomFlower(button) {
  const bounds = button.getBoundingClientRect();
  createFlowerBurst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
  button.classList.add('love-bloom');
  showScreen(2);
}

document.addEventListener('pointerdown', (event) => {
  if (!musicStarted) {
    musicStarted = true;
    musicPlayer.src = audibleSongUrl;
  }
  if (event.target.closest('.floating-heart, #love-button')) return;
  createFlowerBurst(event.clientX, event.clientY);
});

loveButton.addEventListener('pointerdown', (event) => event.stopPropagation());

function dodgeNo() {
  state.noAttempts += 1;
  if (noButton.parentElement !== document.body) {
    document.body.appendChild(noButton);
    noButton.style.zIndex = '4';
  }
  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;
  const safeGap = 10;
  const safeZones = [yesButton, loveButton].map((button) => {
    const bounds = button.getBoundingClientRect();
    return {
      left: bounds.left - safeGap,
      right: bounds.right + safeGap,
      top: bounds.top - safeGap,
      bottom: bounds.bottom + safeGap
    };
  });
  const viewportWidth = window.visualViewport?.width || document.documentElement.clientWidth;
  const viewportHeight = window.visualViewport?.height || document.documentElement.clientHeight;
  const margin = 12;
  const minX = margin;
  const minY = margin;
  const maxX = Math.max(minX, viewportWidth - buttonWidth - margin);
  const maxY = Math.max(minY, viewportHeight - buttonHeight - margin);
  let nextX = 12;
  let nextY = 12;
  let foundSafePosition = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidateX = minX + Math.random() * (maxX - minX);
    const candidateY = minY + Math.random() * (maxY - minY);
    const overlapsChoice = safeZones.some((zone) => !(candidateX + buttonWidth <= zone.left || candidateX >= zone.right || candidateY + buttonHeight <= zone.top || candidateY >= zone.bottom));
    if (!overlapsChoice) {
      nextX = candidateX;
      nextY = candidateY;
      foundSafePosition = true;
      break;
    }
  }
  if (!foundSafePosition) {
    const cornerPositions = [[minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY]];
    const safeCorner = cornerPositions.find(([candidateX, candidateY]) => safeZones.every((zone) => candidateX + buttonWidth <= zone.left || candidateX >= zone.right || candidateY + buttonHeight <= zone.top || candidateY >= zone.bottom));
    if (safeCorner) [nextX, nextY] = safeCorner;
  }
  noButton.style.position = 'fixed';
  noButton.style.left = `${Math.min(Math.max(minX, nextX), maxX)}px`;
  noButton.style.top = `${Math.min(Math.max(minY, nextY), maxY)}px`;
  noButton.style.transform = 'none';
  noHint.textContent = state.noAttempts > 2 ? 'The answer is getting clearer.' : 'That button seems a little shy.';
  if (state.noAttempts >= 6) reasonReveal.hidden = false;
}

const customReasonForm = document.querySelector('#custom-reason-form');
const customReasonInput = document.querySelector('#custom-reason-input');
const sendReasonInstagram = document.querySelector('#send-reason-instagram');

customReasonInput.addEventListener('input', () => {
  sendReasonInstagram.hidden = !customReasonInput.value.trim();
});

customReasonForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const reason = customReasonInput.value.trim();
  if (!reason) return;
  noHint.textContent = `You said: ${reason}.`;
  sendReasonInstagram.dataset.reason = reason;
});

sendReasonInstagram.addEventListener('click', async (event) => {
  const message = `She said: ${customReasonInput.value.trim()}`;
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    // Clipboard access may be unavailable on a local file or restricted browser.
  }
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  window.location.href = isMobileDevice ? 'instagram://app' : 'https://www.instagram.com/';
});

noButton.addEventListener('pointerenter', dodgeNo);
noButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  dodgeNo();
});

document.querySelector('#yes-button').addEventListener('click', () => showScreen(3));
loveButton.addEventListener('click', (event) => bloomFlower(event.currentTarget));

document.querySelector('#celebration-next').addEventListener('click', () => showScreen(3));
document.querySelector('#hangout-next').addEventListener('click', () => showScreen(5));

document.querySelectorAll('.place-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.place-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    state.place = card.dataset.place;
    const next = document.querySelector('#place-next');
    next.disabled = false;
    next.firstChild.textContent = 'Continue ';
    if (state.date && state.time) {
      prepareFinalScreen();
    }
  });
});

document.querySelector('#place-next').addEventListener('click', () => showScreen(6));

const dateInput = document.querySelector('#date-input');
const timeInput = document.querySelector('#time-input');
const dateNext = document.querySelector('#date-next');
dateInput.min = new Date().toISOString().split('T')[0];
function updateDateButton() {
  dateNext.disabled = !(dateInput.value && timeInput.value);
}
dateInput.addEventListener('input', updateDateButton);
timeInput.addEventListener('input', updateDateButton);

function prepareFinalScreen() {
  const date = new Date(`${state.date}T${state.time}`);
  const formattedDate = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  document.querySelector('#summary-place').textContent = state.place;
  document.querySelector('#summary-date').textContent = formattedDate;
  document.querySelector('#summary-time').textContent = formattedTime;
  document.querySelector('#meet-time').textContent = formattedTime;
  const subject = encodeURIComponent("It's a date!");
  const shareMessage = `It's a date!\n\nPlace: ${state.place}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nLet's meet at ${formattedTime}.`;
  const body = encodeURIComponent(shareMessage);
  const mailtoUrl = `mailto:sm828056@gmail.com?subject=${subject}&body=${body}`;
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const textLink = document.querySelector('#send-text');
  const instagramLink = document.querySelector('#send-instagram');
  document.querySelector('#send-email').href = mailtoUrl;
  textLink.href = isMobileDevice ? `sms:${isIphone ? '&' : '?'}body=${body}` : '#';
  textLink.onclick = async (event) => {
    if (isMobileDevice) return;
    event.preventDefault();
    try { await navigator.clipboard.writeText(shareMessage); document.querySelector('#share-note').textContent = 'Message copied. Paste it into your messaging app.'; }
    catch { document.querySelector('#share-note').textContent = 'Copy the plan and send it from your computer.'; }
  };
  instagramLink.onclick = async (event) => {
    event.preventDefault();
    const copied = await copyMessage(shareMessage);
    document.querySelector('#share-note').textContent = copied
      ? 'Message copied. Open Instagram, choose the person, paste the message, and press Send.'
      : 'Copy failed. Select and copy the plan text manually before opening Instagram.';
  };
  showScreen(6);
}

dateNext.addEventListener('click', () => {
  state.date = dateInput.value;
  state.time = timeInput.value;
  showScreen(4);
});
