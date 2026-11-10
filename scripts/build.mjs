import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = path.join(root, 'bundle.js');
const out = path.join(root, 'index.html');

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: scratch,
  logLevel: 'info',
});

const shell = fs.readFileSync(path.join(root, 'src/index.template.html'), 'utf8');
const js = fs.readFileSync(scratch, 'utf8');
if (!shell.includes('<script src="./bundle.js"></script>')) {
  throw new Error('Script placeholder was not found in src/index.template.html');
}
if (js.includes('</script>')) {
  throw new Error('The bundle contains a closing script tag.');
}
const html = shell.replace(
  '<script src="./bundle.js"></script>',
  '<script>\n' + js + '\n</script>'
);
fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', path.relative(root, out), '—', Buffer.byteLength(html), 'bytes');
