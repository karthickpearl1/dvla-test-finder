import fs from 'fs';
import path from 'path';

/**
 * CSV Management Module
 * Handles CSV file operations for test centre data persistence
 */

const CSV_HEADERS = 'name,address,postcode,availability,dateCollected\n';

/**
 * Initialize CSV file with headers if it doesn't exist
 * @param {string} filePath - Path to the CSV file
 */
export function initializeCsv(filePath) {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create file with headers if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, CSV_HEADERS, 'utf8');
      console.log(`✓ CSV file initialized: ${filePath}`);
    } else {
      console.log(`✓ CSV file already exists: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error initializing CSV file: ${error.message}`);
    throw error;
  }
}

/**
 * Read existing centres from CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Array} Array of centre objects
 */
export function readCentresFromCsv(filePath) {
  try {
    // Return empty array if file doesn't exist
    if (!fs.existsSync(filePath)) {
      console.log(`CSV file not found: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    // Skip header row and parse data rows
    const centres = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV line (handle quoted fields)
      const fields = parseCsvLine(line);
      
      if (fields.length >= 5) {
        centres.push({
          name: fields[0],
          address: fields[1],
          postcode: fields[2],
          availability: fields[3],
          dateCollected: fields[4]
        });
      }
    }

    console.log(`✓ Loaded ${centres.length} centres from CSV`);
    return centres;
  } catch (error) {
    console.error(`Error reading CSV file: ${error.message}`);
    throw error;
  }
}

/**
 * Append a new centre to the CSV file
 * @param {string} filePath - Path to the CSV file
 * @param {Object} centre - Centre object to append
 */
export function appendCentreToCsv(filePath, centre) {
  try {
    // Ensure file exists
    if (!fs.existsSync(filePath)) {
      initializeCsv(filePath);
    }

    // Format centre data as CSV row
    const row = formatCsvRow([
      centre.name || '',
      centre.address || '',
      centre.postcode || '',
      centre.availability || 'unknown',
      centre.dateCollected || new Date().toISOString()
    ]);

    // Append to file
    fs.appendFileSync(filePath, row + '\n', 'utf8');
  } catch (error) {
    console.error(`Error appending to CSV file: ${error.message}`);
    throw error;
  }
}

/**
 * Parse a CSV line handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
function parseCsvLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        currentField += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add last field
  fields.push(currentField);

  return fields;
}

/**
 * Format an array of values as a CSV row
 * @param {Array} values - Array of values to format
 * @returns {string} Formatted CSV row
 */
function formatCsvRow(values) {
  return values.map(value => {
    const str = String(value);
    // Quote field if it contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
}

/**
 * Normalize a string for comparison (lowercase, trim, remove special characters)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if a centre is a duplicate of any existing centres
 * @param {Object} centre - Centre to check
 * @param {Array} existingCentres - Array of existing centres
 * @returns {boolean} True if duplicate found, false otherwise
 */
export function isDuplicateCentre(centre, existingCentres) {
  if (!centre || !existingCentres || existingCentres.length === 0) {
    return false;
  }

  const normalizedName = normalizeString(centre.name);
  const normalizedAddress = normalizeString(centre.address);

  for (const existing of existingCentres) {
    const existingName = normalizeString(existing.name);
    const existingAddress = normalizeString(existing.address);

    // Check if both name and address match
    if (normalizedName === existingName && normalizedAddress === existingAddress) {
      return true;
    }
  }

  return false;
}
