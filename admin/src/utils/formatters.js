export const formatNumber = (value) => new Intl.NumberFormat().format(Number(value || 0));

export const formatDate = (value, options = {}) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const formatRole = (role = '') =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const formatStatusLabel = (status = '') => {
  if (!status) return 'Draft';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const truncate = (text = '', length = 120) => {
  const value = String(text);
  if (value.length <= length) return value;
  return `${value.slice(0, length).trim()}...`;
};
