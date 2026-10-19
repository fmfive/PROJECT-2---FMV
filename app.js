/* Shadow Shift — three studies become one continuous interaction. No dependencies. */
(() => {
  const $ = (id) => document.getElementById(id);
  const scene = $('scene'), stage = document.querySelector('.stage');
  const lamp = $('lamp'), hint = $('dragHint'), beam = $('beam');
  const castShadow = $('castShadow'), afterimage = $('afterimage');
  const sphere = $('sphere'), ambient = $('ambientPool');
  const bulb = $('bulb'), blur = $('blurNode'), flash = $('flash');
  const action = $('actionButton'), reset = $('resetButton');
  const controls = $('controls'), toggle = $('controlToggle');
  const inputNames = ['brightness', 'shadowLength', 'softness', 'revealSpeed', 'imprint'];
  const factory = { brightness: 74, shadowLength: 94, softness: 13, revealSpeed: 9, imprint: 66 };
  const presets = {
    soft:  { brightness: 48, shadowLength: 70, softness: 26, revealSpeed: 16, imprint: 36 },
    long:  { brightness: 85, shadowLength: 150, softness: 8, revealSpeed: 7, imprint: 60 },
    dense: { brightness: 100, shadowLength: 108, softness: 2, revealSpeed: 4, imprint: 95 }
  };
  const labels = {
    reveal: ['STUDY 01 / 03', 'Give the dark a source.', 'Click the lamp or turn on the light to reveal its shadow.', '01 — REVEAL'],
    shift: ['STUDY 02 / 03', 'Move the light. Watch the trace.', 'Drag the lamp along the rail. The sphere stays still as its shadow moves.', '02 — SHIFT'],
    preserve: ['STUDY 03 / 03', 'Hold onto the shadow.', 'Click CAPTURE SHADOW to freeze a trace of this moment.', '03 — PRESERVE'],
    complete: ['SEQUENCE COMPLETE', 'The light leaves a trace.', 'The lamp has dimmed, but the captured shadow remains.', '03 — PRESERVE']
  };

  let values = { ...factory };
  try {
    const stored = JSON.parse(localStorage.getItem('shadowShiftDefaults') || 'null');
    if (stored && inputNames.every((key) => Number.isFinite(stored[key]))) values = { ...stored };
  } catch (_) { /* Private browsing may disable storage. */ }
  const mode = document.body.dataset.mode || 'sequence';
  let phase = mode === 'sequence' ? 'reveal' : mode;
  let lampX = mode === 'preserve' ? 490 : 260;
  let light = phase === 'reveal' ? 0 : values.brightness / 100;
  let targetLight = light, shadowX = 0, fixedX = null, captured = false;
  let dragging = false, dragStart = 0, furthestDrag = 0, transitionTimer = 0, dimTimer = 0;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFrame = performance.now();

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const targetShadow = () => 590 + (490 - lampX) * 0.72;
  shadowX = targetShadow();

  function announce(message) { $('feedback').textContent = message; }
  function panelMessage(message) { $('panelStatus').textContent = message; }
  function syncInputs() {
    for (const key of inputNames) {
      $(key).value = values[key];
      $(key + 'Value').textContent = key === 'brightness' || key === 'imprint'
        ? values[key] + '%' : key === 'revealSpeed' ? (values[key] / 10).toFixed(1) + 's' : String(values[key]);
    }
  }
  function refreshLabels() {
    const copy = labels[phase];
    $('stageNumber').textContent = copy[0];
    $('stageTitle').textContent = copy[1];
    $('stageInstruction').textContent = copy[2];
    $('sceneLabel').textContent = copy[3];
    stage.dataset.phase = phase;
    for (let i = 1; i <= 3; i++) {
      $('step' + i).className = 'step' + ((phase === 'complete' || i < ['reveal','shift','preserve'].indexOf(phase) + 1) ? ' complete' : '')
        + (i === ['reveal','shift','preserve'].indexOf(phase) + 1 ? ' active' : '');
    }
    action.hidden = phase === 'shift' || phase === 'complete';
    action.disabled = phase === 'reveal' && targetLight > .05;
    action.innerHTML = phase === 'preserve' ? 'CAPTURE SHADOW <span aria-hidden="true">↗</span>'
      : 'TURN ON LIGHT <span aria-hidden="true">↗</span>';
    reset.hidden = phase !== 'complete';
    hint.setAttribute('opacity', phase === 'shift' ? '.9' : '0');
    lamp.setAttribute('aria-label', phase === 'reveal' ? 'Turn on the lamp'
      : phase === 'shift' ? 'Drag the lamp along the rail' : 'Lamp');
  }
  function setPhase(next) {
    clearTimeout(transitionTimer);
    phase = next;
    if (phase === 'shift') announce('LAMP ON · DRAG ALONG THE RAIL');
    if (phase === 'preserve') announce('POSITION SET · CAPTURE THE SHADOW');
    if (phase === 'complete') announce('SHADOW CAPTURED · AFTERIMAGE HELD');
    refreshLabels();
  }
  function turnOn() {
    if (phase !== 'reveal' || targetLight > .05) return;
    targetLight = values.brightness / 100;
    action.disabled = true;
    announce('LIGHT RISING · SHADOW APPEARING');
    transitionTimer = setTimeout(() => {
      if (mode === 'sequence') setPhase('shift');
      else { announce('LIGHT ON · SHADOW REVEALED'); reset.hidden = false; }
    }, values.revealSpeed * 100 + 240);
  }
  function capture() {
    if (phase !== 'preserve' || captured) return;
    captured = true;
    fixedX = shadowX;
    if (!reduceMotion) flash.animate([{opacity:0},{opacity:1,offset:.07},{opacity:1,offset:.22},{opacity:0}], {duration:1500, easing:'ease-out'});
    clearTimeout(dimTimer);
    dimTimer = setTimeout(() => { targetLight = values.brightness / 100 * .13; }, reduceMotion ? 0 : 330);
    action.disabled = true;
    announce('FLASH · CAPTURING THE TRACE');
    transitionTimer = setTimeout(() => {
      setPhase('complete');
    }, reduceMotion ? 350 : 1900);
  }
  function replay() {
    clearTimeout(transitionTimer);
    clearTimeout(dimTimer);
    captured = false; fixedX = null; lampX = mode === 'preserve' ? 490 : 260;
    phase = mode === 'sequence' ? 'reveal' : mode;
    light = phase === 'reveal' ? 0 : values.brightness / 100;
    targetLight = light; shadowX = targetShadow();
    reset.hidden = true; action.disabled = false;
    announce(phase === 'reveal' ? 'LAMP OFF · SHADOW HIDDEN' : phase === 'shift' ? 'LAMP ON · DRAG ALONG THE RAIL' : 'POSITION SET · CAPTURE THE SHADOW');
    refreshLabels();
  }
  function preview(which) {
    clearTimeout(transitionTimer); clearTimeout(dimTimer); dragging = false; stage.classList.remove('is-dragging');
    captured = which === 'preserve'; fixedX = null;
    phase = which;
    lampX = which === 'reveal' ? 260 : which === 'shift' ? 510 : 490;
    shadowX = targetShadow();
    targetLight = values.brightness / 100 * (captured ? .13 : 1);
    light = targetLight;
    fixedX = captured ? shadowX : null;
    if (which === 'reveal') { action.disabled = true; announce('LIGHT ON · SHADOW REVEALED'); }
    else if (which === 'shift') announce('LAMP MOVED · SHADOW SHIFTED');
    else announce('SHADOW CAPTURED · AFTERIMAGE HELD');
    reset.hidden = false;
    refreshLabels();
    if (which === 'reveal') action.disabled = true;
    if (which === 'preserve') action.disabled = true;
    document.querySelectorAll('[data-preview]').forEach((b) => b.classList.toggle('active', b.dataset.preview === which));
  }
  function applySettings(next, source) {
    values = { ...next };
    syncInputs();
    if (phase !== 'reveal' || targetLight > .05) targetLight = values.brightness / 100 * (captured ? .13 : 1);
    if (source) panelMessage(source);
  }
  function svgX(event) {
    const point = scene.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(scene.getScreenCTM().inverse()).x;
  }
  function startDrag(event) {
    if (phase === 'reveal') { turnOn(); return; }
    if (phase !== 'shift') return;
    dragging = true; dragStart = lampX; furthestDrag = 0;
    stage.classList.add('is-dragging');
    if (event.pointerId != null) lamp.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function drag(event) {
    if (!dragging) return;
    lampX = clamp(svgX(event), 180, 720);
    furthestDrag = Math.max(furthestDrag, Math.abs(lampX - dragStart));
    announce('LAMP MOVING · SHADOW FOLLOWING');
    event.preventDefault();
  }
  function endDrag() {
    if (!dragging) return;
    dragging = false; stage.classList.remove('is-dragging');
    if (furthestDrag >= 115) {
      if (mode === 'sequence') setPhase('preserve');
      else { announce('LAMP MOVED · SHADOW SHIFTED'); reset.hidden = false; }
    } else announce('DRAG THE LAMP FARTHER ALONG THE RAIL');
  }

  function draw(now) {
    const dt = clamp((now - lastFrame) / 16.7, 0, 3); lastFrame = now;
    // Preserve's original study lets the lamp die slowly after its flash.
    light += (targetLight - light) * (1 - Math.pow(captured && !reduceMotion ? .982 : .88, dt));
    const goalX = fixedX ?? targetShadow();
    shadowX += (goalX - shadowX) * (1 - Math.pow(.79, dt));
    const bright = clamp(light, 0, 1);
    lamp.setAttribute('transform', `translate(${lampX} 0)`);
    hint.setAttribute('transform', `translate(${lampX} 0)`);
    beam.setAttribute('d', `M${lampX + 21} 210 Q${lampX + 135} 325 415 428 L880 428 Q720 273 ${lampX + 21} 210Z`);
    beam.setAttribute('opacity', (bright * .7).toFixed(3));
    ambient.setAttribute('cx', 520 + (lampX - 260) * .25);
    ambient.setAttribute('opacity', (bright * .32).toFixed(3));
    sphere.setAttribute('opacity', (.18 + bright * .82).toFixed(3));
    bulb.setAttribute('opacity', (.12 + bright * .75).toFixed(3));
    castShadow.setAttribute('cx', shadowX.toFixed(2));
    castShadow.setAttribute('rx', String(values.shadowLength));
    // The original Preserve study keeps the cast shadow when the lamp dies.
    castShadow.setAttribute('opacity', (captured ? .9 : bright * .78).toFixed(3));
    afterimage.setAttribute('cx', (fixedX ?? shadowX).toFixed(2));
    afterimage.setAttribute('rx', String(values.shadowLength));
    afterimage.setAttribute('opacity', captured ? (values.imprint / 100 * .32).toFixed(3) : '0');
    blur.setAttribute('stdDeviation', String(values.softness));
    requestAnimationFrame(draw);
  }

  lamp.addEventListener('pointerdown', startDrag);
  lamp.addEventListener('pointermove', drag);
  lamp.addEventListener('pointerup', endDrag);
  lamp.addEventListener('pointercancel', endDrag);
  lamp.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && phase === 'reveal') { event.preventDefault(); turnOn(); }
    if (phase === 'shift' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      lampX = clamp(lampX + (event.key === 'ArrowRight' ? 38 : -38), 180, 720);
      furthestDrag += 38;
      announce('LAMP MOVING · SHADOW FOLLOWING');
      if (furthestDrag >= 152) { furthestDrag = 0; if (mode === 'sequence') setPhase('preserve'); }
    }
  });
  action.addEventListener('click', () => phase === 'reveal' ? turnOn() : capture());
  reset.addEventListener('click', replay);
  function showControls(open) {
    controls.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? 'HIDE CONTROLS <span aria-hidden="true">×</span>' : 'OPEN CONTROLS <span aria-hidden="true">☷</span>';
  }
  toggle.addEventListener('click', () => showControls(controls.hidden));
  $('closeControls').addEventListener('click', () => showControls(false));
  for (const key of inputNames) $(key).addEventListener('input', (event) => {
    values[key] = Number(event.target.value);
    document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
    applySettings(values, 'Live preview updated.');
  });
  document.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', () => {
    applySettings(presets[button.dataset.preset], button.textContent + ' variation selected.');
    document.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('active', b === button));
  }));
  document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => preview(button.dataset.preview)));
  $('saveDefaults').addEventListener('click', () => {
    try { localStorage.setItem('shadowShiftDefaults', JSON.stringify(values)); panelMessage('Current values saved as defaults.'); }
    catch (_) { panelMessage('Storage is unavailable in this browser.'); }
  });
  $('restoreDefaults').addEventListener('click', () => {
    try { localStorage.removeItem('shadowShiftDefaults'); } catch (_) {}
    applySettings(factory, 'Factory defaults restored.');
    document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
  });
  $('copySettings').addEventListener('click', async () => {
    const text = 'Shadow Shift settings: ' + Object.entries(values).map(([key, value]) => key + '=' + value).join(', ');
    try { await navigator.clipboard.writeText(text); panelMessage('Settings copied: ' + text); }
    catch (_) { panelMessage(text + ' — select this line to copy.'); }
  });

  syncInputs();
  refreshLabels();
  announce(phase === 'reveal' ? 'LAMP OFF · SHADOW HIDDEN' : phase === 'shift' ? 'LAMP ON · DRAG ALONG THE RAIL' : 'POSITION SET · CAPTURE THE SHADOW');
  requestAnimationFrame(draw);

  // Deep links provide reproducible documentation states without changing the normal sequence.
  const query = new URLSearchParams(location.search);
  const preset = query.get('preset'), state = query.get('state');
  if (presets[preset]) {
    applySettings(presets[preset], preset.toUpperCase() + ' variation selected.');
    document.querySelector(`[data-preset="${preset}"]`)?.classList.add('active');
  }
  if (['reveal', 'shift', 'preserve'].includes(state)) preview(state);
  if (query.has('controls')) showControls(true);
})();
