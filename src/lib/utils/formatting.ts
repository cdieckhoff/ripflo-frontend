// Utility functions for formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function calculateDuration(beginDate: string, endDate: string): string {
  // Calculate business days between dates
  // Implementation depends on your needs
  return '3 days';
}