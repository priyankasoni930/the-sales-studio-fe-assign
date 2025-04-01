
// Format time remaining in a human-readable format
export const formatTimeLeft = (timeLeftMs: number): string => {
  if (timeLeftMs <= 0) return "0 minutes";
  
  const hours = Math.floor(timeLeftMs / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeftMs % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

// Format date in a readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
