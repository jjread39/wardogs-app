// Physics model: single muzzle velocity, variable elevation angle.
// Calibrated so max range (700 m) occurs at 45 degrees, per standard
// projectile motion: R = v^2 * sin(2*theta) / g.
const GRAVITY = 9.8; // m/s^2
const MAX_RANGE = 700; // m
const MUZZLE_VELOCITY = Math.sqrt(MAX_RANGE * GRAVITY); // m/s

const els = {
  firerX: document.getElementById('firer-x'),
  firerY: document.getElementById('firer-y'),
  targetX: document.getElementById('target-x'),
  targetY: document.getElementById('target-y'),
  calcBtn: document.getElementById('calc-btn'),
  errorBox: document.getElementById('error-box'),
  results: document.getElementById('results'),
  distance: document.getElementById('result-distance'),
  highElevation: document.getElementById('high-elevation'),
  highHeight: document.getElementById('high-height'),
  highTof: document.getElementById('high-tof'),
  lowElevation: document.getElementById('low-elevation'),
  lowHeight: document.getElementById('low-height'),
  lowTof: document.getElementById('low-tof'),
};

function showError(message) {
  els.errorBox.textContent = message;
  els.errorBox.hidden = false;
  els.results.hidden = true;
}

function clearError() {
  els.errorBox.hidden = true;
}

function solveForAngle(thetaRad) {
  const height = Math.pow(MUZZLE_VELOCITY * Math.sin(thetaRad), 2) / (2 * GRAVITY);
  const timeOfFlight = (2 * MUZZLE_VELOCITY * Math.sin(thetaRad)) / GRAVITY;
  return {
    elevationDeg: thetaRad * (180 / Math.PI),
    height,
    timeOfFlight,
  };
}

function calculate() {
  const fx = parseFloat(els.firerX.value);
  const fy = parseFloat(els.firerY.value);
  const tx = parseFloat(els.targetX.value);
  const ty = parseFloat(els.targetY.value);

  if ([fx, fy, tx, ty].some((v) => Number.isNaN(v))) {
    showError('Enter numeric X/Y coordinates for both the firing position and the target.');
    return;
  }

  const dx = tx - fx;
  const dy = ty - fy;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    showError('Target is on top of the firing position — there is no distance to solve for.');
    return;
  }

  if (distance > MAX_RANGE) {
    showError(`Target is ${distance.toFixed(1)} m away, which exceeds the mortar's ${MAX_RANGE} m max range.`);
    return;
  }

  clearError();

  const ratio = distance / MAX_RANGE; // sin(2 * theta)
  const thetaLowRad = Math.asin(ratio) / 2;
  const thetaHighRad = Math.PI / 2 - thetaLowRad;

  const low = solveForAngle(thetaLowRad);
  const high = solveForAngle(thetaHighRad);

  els.distance.textContent = `${distance.toFixed(1)} m`;

  els.highElevation.textContent = `${high.elevationDeg.toFixed(1)}°`;
  els.highHeight.textContent = `${high.height.toFixed(1)} m`;
  els.highTof.textContent = `${high.timeOfFlight.toFixed(1)} s`;

  els.lowElevation.textContent = `${low.elevationDeg.toFixed(1)}°`;
  els.lowHeight.textContent = `${low.height.toFixed(1)} m`;
  els.lowTof.textContent = `${low.timeOfFlight.toFixed(1)} s`;

  els.results.hidden = false;
}

els.calcBtn.addEventListener('click', calculate);

[els.firerX, els.firerY, els.targetX, els.targetY].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
  });
});
