const Application = require('../models/Application');

/**
 * Extracts a clean 3-letter uppercase prefix from the company name.
 * Handles short company names by padding with 'X'.
 *
 * @param {string} companyName - Name of the company
 * @returns {string} 3-letter uppercase code (e.g., 'INF', 'GOO')
 */
const getCompanyPrefix = (companyName) => {
  if (!companyName || typeof companyName !== 'string') {
    return 'APP';
  }

  // Extract letters first to satisfy "First 3 letters of company converted to uppercase"
  const lettersOnly = companyName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (lettersOnly.length >= 3) {
    return lettersOnly.slice(0, 3);
  }

  // Fallback to alphanumeric if fewer than 3 letters
  const alphanumeric = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  let code = alphanumeric.slice(0, 3);
  while (code.length < 3) {
    code += 'X';
  }

  return code;
};

/**
 * Generates the next unique Application ID for a given company.
 * Format: JA-<FIRST 3 COMPANY LETTERS>-<3 DIGIT SEQUENCE>
 * Examples:
 *   Infosys -> JA-INF-001
 *   Infosys -> JA-INF-002
 *   Google  -> JA-GOO-001
 *
 * Sequence increments separately for each company prefix.
 * Includes conflict protection to guarantee uniqueness.
 *
 * @param {string} companyName - Name of the company
 * @returns {Promise<string>} Next unique Application ID
 */
const generateApplicationId = async (companyName) => {
  const companyCode = getCompanyPrefix(companyName);
  const prefix = `JA-${companyCode}-`;

  // Find all existing application IDs matching this specific company prefix
  const regex = new RegExp(`^${prefix}\\d+$`);
  const matchingApps = await Application.find(
    { applicationId: regex },
    { applicationId: 1 }
  ).lean();

  let maxSequence = 0;

  for (const app of matchingApps) {
    if (app.applicationId) {
      const parts = app.applicationId.split('-');
      if (parts.length === 3) {
        const seqNumber = parseInt(parts[2], 10);
        if (!isNaN(seqNumber) && seqNumber > maxSequence) {
          maxSequence = seqNumber;
        }
      }
    }
  }

  let nextSequence = maxSequence + 1;
  let candidateId = `${prefix}${String(nextSequence).padStart(3, '0')}`;

  // Extra safety check: verify candidateId is not already taken
  while (await Application.exists({ applicationId: candidateId })) {
    nextSequence += 1;
    candidateId = `${prefix}${String(nextSequence).padStart(3, '0')}`;
  }

  return candidateId;
};

module.exports = {
  getCompanyPrefix,
  generateApplicationId
};
