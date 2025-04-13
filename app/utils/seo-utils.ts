/**
 * Utility functions for SEO-friendly URL handling
 */

/**
 * Generates a random string of specified length
 */
function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}

/**
 * Extracts domain name from a URL and removes common TLDs
 */
function extractDomainName(url: string): string {
  try {
    // Normalize URL by adding protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }
    
    // Extract hostname
    const hostname = new URL(url).hostname;
    
    // Remove www. prefix if it exists
    let domain = hostname.replace(/^www\./, '');
    
    // Remove common TLDs
    domain = domain.replace(/\.(com|org|net|io|co|ca|us|uk|edu|gov|app|dev|shop|store|blog|me|info)$/, '');
    
    // Replace any remaining dots with hyphens
    domain = domain.replace(/\./g, '-');
    
    return domain;
  } catch (error) {
    // If URL parsing fails, return a sanitized version of the input
    return url
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\.[^/.]+$/, '')
      .replace(/\./g, '-');
  }
}

/**
 * Creates an SEO-friendly ID from a URL by extracting the domain name
 * and appending a random string
 */
export function createSeoId(url: string): string {
  const domain = extractDomainName(url);
  const randomString = generateRandomString(6);
  
  return `${domain}-${randomString}`;
}

/**
 * Validates that a string follows the SEO ID pattern
 */
export function isValidSeoId(id: string): boolean {
  // Basic pattern matching: word characters, separated by hyphens, with the last segment being 6 characters
  const pattern = /^[a-zA-Z0-9-]+-[a-zA-Z0-9]{6}$/;
  return pattern.test(id);
} 