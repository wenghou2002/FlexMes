/**
 * Gets the current date and time adjusted for Malaysia timezone (UTC+8)
 * @returns Formatted date string for filenames
 */
export const getMalaysiaTime = (): string => {
  // Get the current date and time
  const now = new Date();

  // Malaysia is UTC+8, adjust the time accordingly
  const malaysiaOffset = 8 * 60; // Malaysia is 8 hours ahead of UTC in minutes
  const utcOffset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() + (malaysiaOffset + utcOffset) * 60 * 1000);

  // Format the adjusted date and time for filenames
  return localTime.toISOString()
    .slice(0, 19) // Take the part up to seconds
    .replace('T', ' ') // Replace 'T' separator with a space
    .replace(/:/g, '-'); // Replace colons with dashes for valid file name
}; 