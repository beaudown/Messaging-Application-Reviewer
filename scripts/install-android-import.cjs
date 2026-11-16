const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'android/app/src/main');
const javaDir = path.join(base, 'java/com/beaudown/messagingreviewer');
const main = path.join(javaDir, 'MainActivity.java');
const manifest = path.join(base, 'AndroidManifest.xml');
if (!fs.existsSync(main) || !fs.existsSync(manifest)) throw Error('Capacitor Android project not generated');
const java = fs.readFileSync(main, 'utf8');
if (!java.includes('registerPlugin(DeviceMessagesPlugin.class)')) {
  const updated = java.replace(/public class MainActivity extends BridgeActivity\s*\{/, match =>
    match + '\n  @Override public void onCreate(android.os.Bundle savedInstanceState) {\n' +
    '    registerPlugin(DeviceMessagesPlugin.class);\n' +
    '    super.onCreate(savedInstanceState);\n  }\n');
  if (updated === java) throw Error('Unsupported MainActivity template');
  fs.writeFileSync(main, updated);
}
fs.copyFileSync(path.join(root, 'native/android/DeviceMessagesPlugin.java'), path.join(javaDir, 'DeviceMessagesPlugin.java'));
let xml = fs.readFileSync(manifest, 'utf8');
if (!xml.includes('android.permission.READ_SMS')) {
  xml = xml.replace(/<manifest\b[^>]*>/, match =>
    match + '\n    <uses-permission android:name="android.permission.READ_SMS" />');
  if (!xml.includes('android.permission.READ_SMS')) throw Error('Unsupported Android manifest');
  fs.writeFileSync(manifest, xml);
}
console.log('Installed opt-in native Android SMS import bridge');
