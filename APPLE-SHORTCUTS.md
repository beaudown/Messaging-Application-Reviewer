# Apple Shortcuts integration (iOS / iPadOS)

## Current functionality
The PWA offers **Share workspace to Files / Shortcuts**, using the browser's native file Share Sheet where supported, with a download fallback. It exports `conversation-workspace.xml`. It does not read or write Apple Messages databases directly.

## Create a Shortcut: Save Conversation Workspace
On iPhone, open **Shortcuts** → **+** → name it **Save Conversation Workspace**.

1. Open shortcut details and enable **Show in Share Sheet**. Configure it to accept **Files** (or **Any** if Files is not offered).
2. Add **Save File** using **Shortcut Input** as the file. Set destination to a folder in **iCloud Drive / Shortcuts / Conversation Workspaces** (create the folder first), and enable **Ask Where to Save** if preferred.
3. Add **Show Notification** with text: `Conversation Workspace saved. Open Messaging Application Reviewer and choose Import workspace XML.`
4. In Safari or the installed PWA, load the conversation, select **Restore / share to device** → **Share workspace to Files / Shortcuts**, and select the new Shortcut from the Share Sheet.
5. To restore within the PWA, tap **Import workspace XML** and select the saved file in Files.

Shortcuts action labels and file-type filters may differ by iOS version. The user must authorize file access. This is a recipe, not an installed or tested Shortcut.

## Device-to-device migration
To transfer iOS → Android, save the XML to a shared storage location or send the file to the destination device. Open the PWA or APK there and select **Import workspace XML**. The resulting conversation is restored *inside the reviewer*, not inside Google Messages. Use **Android SMS-only compatibility XML** only when explicitly opting into a lossy text-only conversion.

## Native restoration limitations
Apple Shortcuts cannot insert historical SMS, MMS, iMessage or RCS records into Apple Messages. A standalone SQLite file is not an Apple device backup. Android native SMS/MMS import needs a verified format and compatible restore tool. Native RCS import is not established.

## Test checklist
- [ ] iOS Safari Share Sheet accepts XML File
- [ ] Shortcut appears in Share Sheet and saves exact XML bytes
- [ ] PWA reimports XML and retains message counts and annotations
- [ ] Large attachment handling and iCloud storage tested
- [ ] Android import from iCloud-transferred XML verified
