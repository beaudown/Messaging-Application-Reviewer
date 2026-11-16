# Messaging Application Reviewer

A privacy-first HTML5/PWA proof of concept for reviewing conversations, calculating participant statistics, collecting evidence, and exporting a case report.

## Run

Deploy this repository using GitHub Pages (Settings → Pages → Deploy from branch → main → /root). Open the Pages URL in Safari, then Share → Add to Home Screen. A local HTML file preview in iOS Files is not equivalent to Safari hosting.

## Supported imports

- TXT lines: `YYYY-MM-DD HH:MM:SS | Sender | Message` (multiline messages supported)
- CSV with headers such as `time,sender,message`
- JSON array of objects with `time`, `sender`, `message` (or `messages` array)

## Features

- Participant message counts and share; total and average character counts; word counts
- Links, photo references, attachment markers; per-sender breakdown
- Activity by hour and weekday; approximate cross-sender response intervals
- Search, sender filter, evidence notes and selections
- Export a portable workspace JSON or HTML report; use browser Print to Save as PDF
- Offline app shell through a service worker, when hosted via HTTPS
- Temporary in-memory conversation by default; explicit workspace export for persistence

## Important limitations

- No LLM summarizer yet. Future on-device model support must use feature detection and provide a CPU/WASM fallback where feasible; WebGPU support differs by browser/device.
- Photos and attachments can only be counted when the import includes recognizable references or markers. They are not reconstructed from a plain-text export.
- Reply times are rough heuristics based on consecutive messages from different participants, not verified reply relationships.
- The viewer renders the first 500 matching messages to keep mobile performance predictable.
- The PDF path currently uses Safari's Print / Save as PDF. A dedicated report PDF renderer and pagination are planned.
- Workspace JSON contains conversation contents in plaintext. Store it securely; do not commit private exports to a public GitHub repository.
- File SHA-256 is computed locally where Web Crypto is available. The application does not authenticate message origin or establish legal chain of custody.
- The PWA caches only application assets, not imported conversations.
- PWA install behavior and SVG icon support vary by platform; PNG icons should be added for wider compatibility.

## Roadmap

1. On-device AI summarization with evidence-grounded citations and chunked context
2. IndexedDB opt-in case workspaces, secure backup/export and restore
3. Dedicated PDF generator and evidence cross-references
4. Rich import adapters, media handling and performance virtualization

No external AI API is used. No imported conversation data is transmitted by this app.
