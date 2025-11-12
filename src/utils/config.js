import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadConfig() {
  const configPath = path.join(__dirname, '../../config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configData);
}

export function saveResults(results) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `results-${timestamp}.json`;
  const resultsPath = path.join(__dirname, '../../results', filename);
  
  if (!fs.existsSync(path.join(__dirname, '../../results'))) {
    fs.mkdirSync(path.join(__dirname, '../../results'));
  }
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  return filename;
}
