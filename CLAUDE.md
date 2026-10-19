# Shadow Shift project notes

This repository holds a plain HTML/CSS/JavaScript mid-fidelity prototype for GitHub Pages. Keep `index.html` at the root. Preserve the three gestures and their immediate feedback when refining:

- Reveal: click lamp or button; brightness and shadow animate in.
- Shift: drag lamp on the rail; stationary sphere and delayed opposite shadow.
- Preserve: click capture; flash, dim lamp, persistent trace.

The control panel is an authoring tool. Its selected values preview live, can be saved in localStorage, copied as text, and hidden. Do not require a framework or a server backend for this prototype.

The supplied standalone Claude Artifact HTML files are preserved byte for byte in `studies/01-reveal/`, `studies/02-shift/`, and `studies/03-preserve/`. The root prototype adapts their interactions into a new sequence with authoring controls.
