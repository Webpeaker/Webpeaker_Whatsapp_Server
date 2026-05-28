export const statuses = ['new', 'contacted', 'in_discussion', 'converted', 'rejected', 'completed', 'pending'];

export function statusLabel(status) {
  return String(status || 'new')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
