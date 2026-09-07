export function formatCurrency(amount, currency = 'INR', options = {}) {
  const allowZero = typeof options === 'boolean' ? options : Boolean(options && options.allowZero);
  const num = Number(amount) || 0;
  if (num === 0 && !allowZero) return 'FREE';

  if (currency === 'USD') {
    // 1 USD ~ 85 INR conversion rate
    const usdAmount = num / 85;
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: usdAmount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }

  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const formatBytes = formatFileSize;

