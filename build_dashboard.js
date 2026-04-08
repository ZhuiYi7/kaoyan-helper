import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { main } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, 'site');
const sourceHtml = path.join(__dirname, 'dashboard.html');
const targetHtml = path.join(siteDir, 'index.html');
const noJekyllPath = path.join(siteDir, '.nojekyll');

await main({ skipSend: true });

fs.mkdirSync(siteDir, { recursive: true });
fs.copyFileSync(sourceHtml, targetHtml);
fs.writeFileSync(noJekyllPath, '', 'utf-8');

console.log(`Static site generated at: ${targetHtml}`);
