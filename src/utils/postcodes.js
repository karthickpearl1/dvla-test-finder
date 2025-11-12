/**
 * UK Postcode Management Module
 * Provides geographic coverage of UK test centres through strategic postcode selection
 */

/**
 * Comprehensive list of UK postcodes organized by geographic region
 * Covers major cities and regions across England, Scotland, Wales, and Northern Ireland
 */
const UK_POSTCODES = [
  // ENGLAND - Major Cities and Regions (40-50 postcodes)
  
  // London and South East
  'SW1A 1AA', // Central London (Westminster)
  'EC1A 1BB', // City of London
  'E1 6AN',   // East London (Tower Hamlets)
  'W1A 1AA',  // West London (Westminster)
  'N1 9AG',   // North London (Islington)
  'SE1 9SG',  // South East London (Southwark)
  'CR0 1EA',  // Croydon
  'BR1 1JH',  // Bromley
  'KT1 1EU',  // Kingston upon Thames
  'GU1 1AA',  // Guildford
  'RH1 1BA',  // Redhill
  'TN1 1HE',  // Tunbridge Wells
  'ME1 1XX',  // Rochester
  'CT1 1AA',  // Canterbury
  
  // South West
  'BS1 1AA',  // Bristol
  'BA1 1AA',  // Bath
  'EX1 1AA',  // Exeter
  'PL1 1AA',  // Plymouth
  'TQ1 1AA',  // Torquay
  'TR1 1AA',  // Truro
  'BH1 1AA',  // Bournemouth
  'SO14 0AA', // Southampton
  'PO1 1AA',  // Portsmouth
  
  // Midlands
  'B1 1AA',   // Birmingham
  'CV1 1AA',  // Coventry
  'LE1 1AA',  // Leicester
  'NG1 1AA',  // Nottingham
  'DE1 1AA',  // Derby
  'NN1 1AA',  // Northampton
  'MK1 1AA',  // Milton Keynes
  'OX1 1AA',  // Oxford
  'WR1 1AA',  // Worcester
  'ST1 1AA',  // Stoke-on-Trent
  'TF1 1AA',  // Telford
  
  // North West
  'M1 1AA',   // Manchester
  'L1 1AA',   // Liverpool
  'WA1 1AA',  // Warrington
  'CH1 1AA',  // Chester
  'PR1 1AA',  // Preston
  'BB1 1AA',  // Blackburn
  'FY1 1AA',  // Blackpool
  'LA1 1AA',  // Lancaster
  'CA1 1AA',  // Carlisle
  
  // Yorkshire and Humber
  'LS1 1AA',  // Leeds
  'S1 1AA',   // Sheffield
  'BD1 1AA',  // Bradford
  'HX1 1AA',  // Halifax
  'HD1 1AA',  // Huddersfield
  'WF1 1AA',  // Wakefield
  'DN1 1AA',  // Doncaster
  'HU1 1AA',  // Hull
  'YO1 1AA',  // York
  
  // North East
  'NE1 1AA',  // Newcastle upon Tyne
  'SR1 1AA',  // Sunderland
  'DH1 1AA',  // Durham
  'TS1 1AA',  // Middlesbrough
  'DL1 1AA',  // Darlington
  
  // SCOTLAND (10-15 postcodes)
  'EH1 1AA',  // Edinburgh
  'G1 1AA',   // Glasgow
  'AB10 1AA', // Aberdeen
  'DD1 1AA',  // Dundee
  'PA1 1AA',  // Paisley
  'KY1 1AA',  // Kirkcaldy
  'FK1 1AA',  // Falkirk
  'KA1 1AA',  // Kilmarnock
  'IV1 1AA',  // Inverness
  'PH1 1AA',  // Perth
  'TD1 1AA',  // Galashiels
  'DG1 1AA',  // Dumfries
  
  // WALES (8-10 postcodes)
  'CF10 1AA', // Cardiff
  'SA1 1AA',  // Swansea
  'NP20 1AA', // Newport
  'LL11 1AA', // Wrexham
  'LD1 1AA',  // Llandrindod Wells
  'SY23 1AA', // Aberystwyth
  'LL57 1AA', // Bangor
  'CF31 1AA', // Bridgend
  
  // NORTHERN IRELAND (5-8 postcodes)
  'BT1 1AA',  // Belfast
  'BT48 6AA', // Derry/Londonderry
  'BT35 6AA', // Newry
  'BT30 6AA', // Downpatrick
  'BT74 6AA', // Enniskillen
  'BT62 1AA', // Craigavon
  'BT41 1AA', // Antrim
];

/**
 * Approximate geographic coordinates for UK postcode areas
 * Used for distance calculations between postcodes
 * Coordinates are approximate center points for each postcode area
 */
const POSTCODE_COORDINATES = {
  // London and South East
  'SW1A': { lat: 51.5014, lon: -0.1419 },
  'EC1A': { lat: 51.5174, lon: -0.0933 },
  'E1': { lat: 51.5154, lon: -0.0649 },
  'W1A': { lat: 51.5152, lon: -0.1441 },
  'N1': { lat: 51.5389, lon: -0.1025 },
  'SE1': { lat: 51.5045, lon: -0.0865 },
  'CR0': { lat: 51.3727, lon: -0.1099 },
  'BR1': { lat: 51.4060, lon: 0.0140 },
  'KT1': { lat: 51.4123, lon: -0.3006 },
  'GU1': { lat: 51.2362, lon: -0.5704 },
  'RH1': { lat: 51.2407, lon: -0.1680 },
  'TN1': { lat: 51.1320, lon: 0.2630 },
  'ME1': { lat: 51.3889, lon: 0.5050 },
  'CT1': { lat: 51.2802, lon: 1.0789 },
  
  // South West
  'BS1': { lat: 51.4545, lon: -2.5879 },
  'BA1': { lat: 51.3811, lon: -2.3590 },
  'EX1': { lat: 50.7184, lon: -3.5339 },
  'PL1': { lat: 50.3755, lon: -4.1427 },
  'TQ1': { lat: 50.4619, lon: -3.5253 },
  'TR1': { lat: 50.2632, lon: -5.0510 },
  'BH1': { lat: 50.7192, lon: -1.8808 },
  'SO14': { lat: 50.9097, lon: -1.4044 },
  'PO1': { lat: 50.8198, lon: -1.0880 },
  
  // Midlands
  'B1': { lat: 52.4862, lon: -1.8904 },
  'CV1': { lat: 52.4081, lon: -1.5106 },
  'LE1': { lat: 52.6369, lon: -1.1398 },
  'NG1': { lat: 52.9548, lon: -1.1581 },
  'DE1': { lat: 52.9225, lon: -1.4746 },
  'NN1': { lat: 52.2405, lon: -0.9027 },
  'MK1': { lat: 52.0406, lon: -0.7594 },
  'OX1': { lat: 51.7520, lon: -1.2577 },
  'WR1': { lat: 52.1936, lon: -2.2210 },
  'ST1': { lat: 53.0027, lon: -2.1794 },
  'TF1': { lat: 52.6766, lon: -2.4447 },
  
  // North West
  'M1': { lat: 53.4808, lon: -2.2426 },
  'L1': { lat: 53.4084, lon: -2.9916 },
  'WA1': { lat: 53.3900, lon: -2.5970 },
  'CH1': { lat: 53.1905, lon: -2.8910 },
  'PR1': { lat: 53.7632, lon: -2.7031 },
  'BB1': { lat: 53.7480, lon: -2.4821 },
  'FY1': { lat: 53.8175, lon: -3.0536 },
  'LA1': { lat: 54.0465, lon: -2.8010 },
  'CA1': { lat: 54.8951, lon: -2.9382 },
  
  // Yorkshire and Humber
  'LS1': { lat: 53.8008, lon: -1.5491 },
  'S1': { lat: 53.3811, lon: -1.4701 },
  'BD1': { lat: 53.7960, lon: -1.7594 },
  'HX1': { lat: 53.7256, lon: -1.8632 },
  'HD1': { lat: 53.6458, lon: -1.7850 },
  'WF1': { lat: 53.6830, lon: -1.4990 },
  'DN1': { lat: 53.5228, lon: -1.1288 },
  'HU1': { lat: 53.7457, lon: -0.3367 },
  'YO1': { lat: 53.9600, lon: -1.0873 },
  
  // North East
  'NE1': { lat: 54.9783, lon: -1.6178 },
  'SR1': { lat: 54.9069, lon: -1.3838 },
  'DH1': { lat: 54.7761, lon: -1.5733 },
  'TS1': { lat: 54.5742, lon: -1.2350 },
  'DL1': { lat: 54.5253, lon: -1.5510 },
  
  // Scotland
  'EH1': { lat: 55.9533, lon: -3.1883 },
  'G1': { lat: 55.8642, lon: -4.2518 },
  'AB10': { lat: 57.1497, lon: -2.0943 },
  'DD1': { lat: 56.4620, lon: -2.9707 },
  'PA1': { lat: 55.8456, lon: -4.4239 },
  'KY1': { lat: 56.1122, lon: -3.1681 },
  'FK1': { lat: 56.0019, lon: -3.7839 },
  'KA1': { lat: 55.6114, lon: -4.4956 },
  'IV1': { lat: 57.4778, lon: -4.2247 },
  'PH1': { lat: 56.3960, lon: -3.4373 },
  'TD1': { lat: 55.6197, lon: -2.8078 },
  'DG1': { lat: 55.0700, lon: -3.6053 },
  
  // Wales
  'CF10': { lat: 51.4816, lon: -3.1791 },
  'SA1': { lat: 51.6214, lon: -3.9436 },
  'NP20': { lat: 51.5842, lon: -2.9977 },
  'LL11': { lat: 53.0462, lon: -3.0042 },
  'LD1': { lat: 52.2416, lon: -3.3769 },
  'SY23': { lat: 52.4140, lon: -4.0818 },
  'LL57': { lat: 53.2280, lon: -4.1290 },
  'CF31': { lat: 51.5074, lon: -3.5769 },
  
  // Northern Ireland
  'BT1': { lat: 54.5973, lon: -5.9301 },
  'BT48': { lat: 54.9966, lon: -7.3086 },
  'BT35': { lat: 54.1751, lon: -6.3402 },
  'BT30': { lat: 54.3286, lon: -5.7134 },
  'BT74': { lat: 54.3444, lon: -7.6334 },
  'BT62': { lat: 54.4500, lon: -6.3833 },
  'BT41': { lat: 54.7144, lon: -6.2167 },
};

/**
 * Extract postcode area from full postcode
 * @param {string} postcode - Full postcode (e.g., "SW1A 1AA")
 * @returns {string} Postcode area (e.g., "SW1A")
 */
function getPostcodeArea(postcode) {
  // Extract the outward code (area + district)
  const parts = postcode.trim().split(' ');
  if (parts.length === 0) return '';
  
  // For most postcodes, take the first part
  const outward = parts[0];
  
  // Extract letters and first digit(s) for area matching
  const match = outward.match(/^([A-Z]+\d+[A-Z]?)/);
  return match ? match[1] : outward;
}

/**
 * Calculate approximate distance between two postcodes using Haversine formula
 * @param {string} postcode1 - First postcode
 * @param {string} postcode2 - Second postcode
 * @returns {number} Distance in kilometers (approximate)
 */
export function calculateDistance(postcode1, postcode2) {
  const area1 = getPostcodeArea(postcode1);
  const area2 = getPostcodeArea(postcode2);
  
  const coord1 = POSTCODE_COORDINATES[area1];
  const coord2 = POSTCODE_COORDINATES[area2];
  
  // If coordinates not found, return a large default distance
  if (!coord1 || !coord2) {
    return 1000; // Default large distance
  }
  
  // Haversine formula for calculating distance between two points on Earth
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get the next postcode that is geographically distant from all used postcodes
 * Uses maximum minimum distance strategy to ensure broad geographic coverage
 * @param {string[]} usedPostcodes - Array of postcodes already searched
 * @returns {string|null} Next postcode to search, or null if all postcodes used
 */
export function getNextPostcode(usedPostcodes = []) {
  // Filter out already used postcodes
  const availablePostcodes = UK_POSTCODES.filter(
    postcode => !usedPostcodes.includes(postcode)
  );
  
  // If no postcodes available, return null
  if (availablePostcodes.length === 0) {
    return null;
  }
  
  // If no postcodes have been used yet, return the first one (Central London)
  if (usedPostcodes.length === 0) {
    return availablePostcodes[0];
  }
  
  // Find the postcode with maximum minimum distance from all used postcodes
  let maxMinDistance = -1;
  let selectedPostcode = null;
  
  for (const candidate of availablePostcodes) {
    // Calculate minimum distance from this candidate to all used postcodes
    let minDistance = Infinity;
    
    for (const used of usedPostcodes) {
      const distance = calculateDistance(candidate, used);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // If this candidate has a larger minimum distance, select it
    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance;
      selectedPostcode = candidate;
    }
  }
  
  return selectedPostcode;
}

/**
 * Get all UK postcodes
 * @returns {string[]} Array of all UK postcodes
 */
export function getUkPostcodes() {
  return [...UK_POSTCODES];
}

/**
 * Get total number of postcodes
 * @returns {number} Total count of postcodes
 */
export function getPostcodeCount() {
  return UK_POSTCODES.length;
}
