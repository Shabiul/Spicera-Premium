const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const projectRoot = __dirname + '/../';
const srcAssets = path.resolve(projectRoot, 'client', 'src', 'assets');
const distAssets = path.resolve(projectRoot, 'dist', 'src', 'assets');

if (fs.existsSync(srcAssets)) {
  copyDir(srcAssets, distAssets);
  console.log('Assets copied to', distAssets);
} else {
  console.error('Source assets not found at', srcAssets);
  process.exit(1);
}
