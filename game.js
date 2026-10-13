const viewport = document.querySelector('#viewport');
const world = document.querySelector('#world');
const player = document.querySelector('#player');
const card = document.querySelector('#info-card');
const helpDialog = document.querySelector('#help-dialog');
const summaryDialog = document.querySelector('#summary-dialog');
const mapStops = [...document.querySelectorAll('.map-stop')];
const destinations = { start: 72, about: 180, experience: 565, projects: 1020, skills: 1400, contact: 1770 };
const stopNames = { start: 'START · YOUR JOURNEY', about: 'ABOUT · THE BEGINNING', experience: 'EXPERIENCE · THE PATH SO FAR', projects: 'PROJECTS · THINGS I HAVE MADE', skills: 'SKILLS · YOUR TOOLKIT', contact: 'CONTACT · FINISH GATE' };
const content = {
  about: { kicker: 'A LITTLE ABOUT ME', title: 'From Delhi to Brisbane: software, AI, and new experiences.', text: 'Born and brought up in Delhi, I spent my first 18 years here before moving to Brisbane for my education. Now 22 and back in Delhi, I have spent four years in Australia, completing a Bachelor of Science in Computer Science at Queensland University of Technology while working part-time as a bartender throughout my time there. I am looking for job opportunities throughout India, preferably in Bengaluru, Mumbai, Hyderabad, and then Delhi.', bullets: ['Schooling: St. Paul’s School, Hauz Khas, Delhi · High School Diploma (10+2, PCM), Jun 2017 – Jun 2021.', 'Professional experience building Python/Django REST APIs; project experience integrating OpenAI and NVIDIA Nemotron LLM APIs.', 'At OreFOX AI, production API integrations and database improvements reduced endpoint latency by 35%.', 'AI/ML foundation: PyTorch and TensorFlow; interested in building useful, reliable software.'], icon: '01' },
  experience: { kicker: 'THE PATH SO FAR', title: 'Software Developer · OreFOX AI', text: 'February 2025 – November 2025', bullets: ['Architected Django REST APIs, scalable data models, and optimized database queries, reducing endpoint latency by 35%.', 'Integrated OAuth 2.0 and Google Calendar APIs for real-time scheduling; secure token management and error recovery supported 99.2% uptime across 50,000+ monthly API calls.', 'Led the requirements-to-deployment cycle for 5+ feature releases, translating stakeholder requests into technical specifications and validating results through Git-based code review.', 'Resolved N+1 query patterns and memory leaks to improve production API reliability.', 'Alongside my education in Australia, worked part-time as a bartender throughout my four years there.', 'Leadership: Head of Marketing, ThatBenzeneRing (student-run organization), Feb–Jun 2022.'], icon: '02' },
  projects: { kicker: 'THINGS I HAVE MADE', title: 'Selected projects', text: 'Application development, responsive web design, systems programming, and AI integrations.', bullets: ['Mood Tracking Application · Java — records and tracks mood data with modular, reusable object-oriented design.', 'WebsiteIAB Event Management Website · HTML / CSS / Bootstrap — responsive site with reusable interface components.', 'Shared Memory IPC System · C — POSIX shared-memory IPC with a custom dynamic double-vector and a test driver for operations and behavior.', 'LLM API integration experience includes OpenAI and NVIDIA Nemotron.'], icon: '03' },
  skills: { kicker: 'MY TOOLKIT', title: 'Technical skills', text: 'A categorized snapshot of my engineering toolkit.', bullets: ['Programming & web: Python, Java, C#, C, C++, Go, JavaScript, PHP, SQL, HTML, CSS.', 'Frameworks & runtime: Django, Django REST Framework, FastAPI, React, Node.js, Bootstrap.', 'Data: PostgreSQL, MongoDB, SQL / NoSQL, database design, query optimization.', 'APIs & AI: REST API development and integration, OAuth 2.0, Google Calendar API, OpenAI API, NVIDIA Nemotron API, PyTorch, TensorFlow.', 'Cloud & engineering: AWS, Azure, GCP, OCI, Git, GitHub, data structures, algorithms, OOP.', 'Quality & collaboration: test drivers, behavior validation, API error handling, debugging, defect investigation, root-cause analysis, documentation, requirements, teamwork, stakeholder communication.'], icon: '04' },
  contact: { kicker: 'OPEN TO OPPORTUNITIES', title: 'Let’s make something good.', text: 'Back in Delhi and looking for roles throughout India. Preferred locations: Bengaluru, Mumbai, Hyderabad, then Delhi.', bullets: ['Email: Shivamsejwal123@gmail.com', 'Phone: +91 8076041328', 'LinkedIn: linkedin.com/in/shivam-sejwal-ab0aa7207', 'GitHub: github.com/ShivamSejwal'], icon: '05' }
};
let x = 72;
let y = 0;
let velocityY = 0;
let grounded = true;
let cameraX = 0;
let collected = new Set();
let previousX = x;
let previousY = 0;
let standingOn = null;
let lastHitAt = 0;
let defeated = 0;
let messageTimer;
const speed = 4;
const keys = new Set();
const enemies = [
  { el: document.querySelector('[data-enemy="one"]'), x: 360, min: 305, max: 420, speed: 1.25, alive: true },
  { el: document.querySelector('[data-enemy="two"]'), x: 800, min: 745, max: 855, speed: 1.55, alive: true },
  { el: document.querySelector('[data-enemy="three"]'), x: 1225, min: 1170, max: 1285, speed: 1.35, alive: true },
  { el: document.querySelector('[data-enemy="four"]'), x: 1570, min: 1510, max: 1635, speed: 1.6, alive: true }
];
const platforms = [
  { el: document.querySelector('[data-platform="one"]'), left: 395, width: 100, height: 76 },
  { el: document.querySelector('[data-platform="two"]'), left: 1040, width: 130, height: 81 }
];

function showSection(name) {
  const item = content[name];
  if (!item) return;
  document.querySelector('#card-kicker').textContent = item.kicker;
  document.querySelector('#card-title').textContent = item.title;
  document.querySelector('#card-text').textContent = item.text;
  document.querySelector('#card-icon').textContent = item.icon;
  const bulletList = document.querySelector('#card-bullets');
  bulletList.replaceChildren(...item.bullets.map(text => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
  bulletList.hidden = false;
  card.dataset.section = name;
}
function announce(message) {
  const box = document.querySelector('#game-message');
  box.textContent = message;
  box.classList.add('visible');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => box.classList.remove('visible'), 1500);
}
function render() {
  const maxX = world.offsetWidth - 70;
  previousX = x;
  previousY = y;
  if (grounded && standingOn !== null) {
    const support = platforms[standingOn];
    if (x + 30 < support.left || x > support.left + support.width) {
      grounded = false;
      standingOn = null;
    }
  }
  if (!grounded) {
    velocityY -= 0.55;
    y += velocityY;
    if (y <= 0) { y = 0; velocityY = 0; grounded = true; standingOn = null; }
  }
  if (keys.has('ArrowLeft') || keys.has('a')) x -= speed;
  if (keys.has('ArrowRight') || keys.has('d')) x += speed;
  x = Math.max(0, Math.min(maxX, x));
  platforms.forEach((platform, index) => {
    const overlaps = x + 30 > platform.left && x < platform.left + platform.width;
    if (!grounded && velocityY < 0 && previousY >= platform.height && y <= platform.height && overlaps) {
      y = platform.height;
      velocityY = 0;
      grounded = true;
      standingOn = index;
    }
  });

  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    enemy.x += enemy.speed;
    if (enemy.x >= enemy.max || enemy.x <= enemy.min) enemy.speed *= -1;
    enemy.el.style.left = `${enemy.x}px`;
    enemy.el.classList.toggle('facing-left', enemy.speed < 0);
    if (Math.abs(enemy.x - x) < 31 && y < 34) {
      const stompedFromAbove = velocityY < 0 && previousY > 32 && y <= 36;
      if (stompedFromAbove) {
        enemy.alive = false;
        enemy.el.classList.add('squashed');
        defeated += 1;
        document.querySelector('#critters-defeated').textContent = defeated;
        y = 34;
        velocityY = 10;
        grounded = false;
        standingOn = null;
        announce('Critter defeated! Nice jump.');
      } else if (performance.now() - lastHitAt > 950) {
        lastHitAt = performance.now();
        x = Math.max(72, x - 92);
        y = 0;
        velocityY = 0;
        grounded = true;
        player.classList.add('hit');
        setTimeout(() => player.classList.remove('hit'), 420);
        announce('Bumped by a critter—try landing on top!');
      }
    }
  });

  const viewWidth = viewport.clientWidth;
  cameraX = Math.max(0, Math.min(world.offsetWidth - viewWidth, x - viewWidth * 0.38));
  world.style.transform = `translateX(${-cameraX}px)`;
  player.style.left = `${x}px`;
  player.style.bottom = `${66 + y}px`;
  const nearestStop = Object.entries(destinations).reduce((nearest, [name, position]) =>
    Math.abs(position - x) < Math.abs(destinations[nearest] - x) ? name : nearest, 'start');
  mapStops.forEach(stop => stop.classList.toggle('active', stop.dataset.jump === nearestStop));
  document.querySelector('#map-location').textContent = stopNames[nearestStop];
  Object.entries(destinations).forEach(([name, position]) => {
    if (!content[name]) return;
    const forwardCross = previousX < position - 28 && x >= position - 28;
    const backwardCross = previousX > position + 28 && x <= position + 28;
    if (forwardCross || backwardCross) showSection(name);
  });
  document.querySelectorAll('.star').forEach((star, index) => {
    const starX = parseInt(getComputedStyle(star).left, 10);
    if (!collected.has(index) && Math.abs(starX - x) < 27 && y > 20) {
      collected.add(index);
      star.style.visibility = 'hidden';
      document.querySelector('#star-count').textContent = collected.size;
    }
  });
  requestAnimationFrame(render);
}
function jump() { if (grounded) { velocityY = 12; grounded = false; standingOn = null; } }
window.addEventListener('keydown', event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(event.key)) event.preventDefault();
  keys.add(key);
  if (event.key === 'ArrowUp' || event.key === ' ') jump();
});
window.addEventListener('keyup', event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener('blur', () => keys.clear());
document.querySelectorAll('.sign').forEach(sign => sign.addEventListener('click', () => showSection(sign.dataset.card)));
function jumpTo(name) {
  if (!(name in destinations)) return;
  previousX = x;
  x = destinations[name];
  y = 0;
  velocityY = 0;
  grounded = true;
  standingOn = null;
  if (content[name]) showSection(name);
  viewport.focus({ preventScroll: true });
}
document.querySelectorAll('[data-jump]').forEach(control => control.addEventListener('click', event => {
  event.preventDefault();
  jumpTo(control.dataset.jump);
}));
function bindHold(buttonId, key) {
  const button = document.querySelector(buttonId);
  const down = event => { event.preventDefault(); keys.add(key); };
  const up = () => keys.delete(key);
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointerleave', up);
  button.addEventListener('pointercancel', up);
}
bindHold('#left-button', 'ArrowLeft');
bindHold('#right-button', 'ArrowRight');
document.querySelector('#jump-button').addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
document.querySelector('#help-button').addEventListener('click', () => helpDialog.showModal());
document.querySelector('#close-help').addEventListener('click', () => helpDialog.close());
document.querySelector('#got-it').addEventListener('click', () => helpDialog.close());
document.querySelector('#summary-button').addEventListener('click', () => summaryDialog.showModal());
document.querySelector('#close-summary').addEventListener('click', () => summaryDialog.close());
document.querySelector('#summary-explore').addEventListener('click', () => { summaryDialog.close(); jumpTo('about'); });
showSection('about');
render();
