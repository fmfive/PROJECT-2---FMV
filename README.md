# Shadow Shift — Week 5 sequential prototype

Open `index.html` in a browser, or publish the repository root with GitHub Pages. The project uses plain HTML, CSS, JavaScript, and inline SVG. There is no build step or paid Claude dependency.

## Three actions, one sequence

1. **Reveal:** Click the lamp or **TURN ON LIGHT**. The lamp brightens and the fixed sphere gains a cast shadow.
2. **Shift:** Drag the lamp along its rail. The shadow follows with a small delay in the opposite direction. A substantial drag unlocks the final action. Keyboard users can focus the lamp and press the arrow keys.
3. **Preserve:** Click **CAPTURE SHADOW**. A flash acknowledges the click, the lamp dims, and the dark shadow remains in place. **REPLAY SEQUENCE** starts again.

The **OPEN CONTROLS** button reveals sliders for brightness, shadow length, edge softness, reveal time, and afterimage strength. Values update the scene immediately. **SAVE AS DEFAULTS** stores them in the browser; **RESTORE DEFAULTS** clears that local preference; **COPY SETTINGS** copies a readable record. Hide the panel for the final viewer experience.

Three preset variations and a state preview are available in the authoring panel. These reproducible URLs help capture the required process images:

- `index.html?preset=soft&state=reveal&controls`
- `index.html?preset=long&state=shift&controls`
- `index.html?preset=dense&state=preserve&controls`

The preview buttons are authoring aids. The default URL starts the actual sequential interaction. To document each variation, open its URL, wait for any transition to settle, take a browser screenshot with both the scene and controls visible, and add it to the Week 5 process table.

## GitHub Pages

Upload this folder's contents to the root of a public GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)**. Once published, the live URL has the form `https://USERNAME.github.io/REPOSITORY/`. The README is informational; `index.html` is the site entry point.

## Original Claude studies

The three supplied Claude HTML files are preserved byte for byte as standalone pages:

- [01 — Reveal](studies/01-reveal/index.html)
- [02 — Shift](studies/02-shift/index.html)
- [03 — Preserve](studies/03-preserve/index.html)

The root `index.html` is a new sequential adaptation of their three actions. It adds the authoring controls and progress flow for Week 5, so its interface is deliberately different from the originals. The original early p5.js study is retained in `studies/original-p5/`.
