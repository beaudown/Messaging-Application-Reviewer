# Development and validation roadmap

## Implemented prototypes
- Browser-side Apple Messages SQLite import adapter (`apple-sqlite.js`), using sql.js 1.13.0 from CDN. **Requires network for first load; not yet offline-complete.**
- Android SMS/MMS XML import (limited MMS handling) and SMS-only XML export.
- Conversation Workspace XML export/reimport.
- Capacitor Android scaffolding in `package.json` and `capacitor.config.json`. **No APK has been built.**

## Local Android build
Requires Node.js, JDK, Android SDK and Android Studio.

```sh
npm install
npm run android:add
npm run android:sync
npm run android:open
```

Build a debug APK from Android Studio. Do not commit Android signing keys or private conversation archives.

## Blockers before release
1. Vendor and integrity-pin SQLite WASM and JavaScript assets for true offline use.
2. Implement a SQLite-backed persistent workspace (IndexedDB/OPFS, with migration and eviction handling).
3. Test Apple `sms.db` schema variations, dates, attributed text, attachments and chat grouping against authorized fixtures.
4. Preserve source provenance, stable IDs, attachments, metadata and unsupported fields.
5. Implement complete Android SMS/MMS XML serialization and validate against an independent restore tool.
6. RCS-specific source extraction, reactions, edits, read states and attachment metadata: availability varies by platform. **No generic third-party native RCS restore API is assumed.**
7. Add structured round-trip tests and a per-record loss/compatibility report.
8. Verify APK behavior and Android permissions. Capacitor packaging does not grant native SMS/RCS access.
9. Review privacy, accessibility, browser CSP, large files, and offline behavior.

## Restoration policy
A PWA cannot insert messages into Apple Messages or Google Messages. SQLite exports are not automatically valid Apple device backups. Android SMS/MMS restoration requires compatible apps or authorized native workflows. Never claim native RCS restoration without an end-to-end tested path.
