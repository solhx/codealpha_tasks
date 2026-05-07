//frontend/src/utils/helpers.js
/**
 * Format a number to compact notation (e.g. 1200 → 1.2K)
 */
export const formatCount = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

/**
 * Truncate a string to maxLen characters
 */
export const truncate = (str, maxLen = 100) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
};

/**
 * Build a full Cloudinary URL with transformations
 */
export const cloudinaryUrl = (publicId, opts = 'w_400,c_fill,q_auto') =>
  `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD}/image/upload/${opts}/${publicId}`;

/**
 * Validate image file (type + size)
 */
export const validateImage = (file, maxMB = 5) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Only JPG, PNG, GIF, and WEBP images are allowed.';
  if (file.size > maxMB * 1024 * 1024) return `Image must be smaller than ${maxMB}MB.`;
  return null;
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Extract hashtags from text
 */
export const extractHashtags = (text) =>
  (text.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.slice(1));

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};