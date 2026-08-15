/**
 * Brand Content OS (BCOS) - Non-intrusive Toast Notification Component
 */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
}

export function showToast(message, type = 'info', duration = 2500) {
  ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    info: 'ri-information-line',
    success: 'ri-checkbox-circle-line',
    warning: 'ri-alert-line',
    error: 'ri-error-warning-line'
  };

  const colorMap = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f43f5e'
  };

  toast.style.cssText = `
    background-color: var(--bg-dark-card);
    border: 1px solid var(--border-dark-strong);
    border-left: 4px solid ${colorMap[type] || colorMap.info};
    color: var(--text-dark-primary);
    padding: 10px 16px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    animation: toastIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  toast.innerHTML = `
    <i class="${iconMap[type] || iconMap.info}" style="color: ${colorMap[type]}; font-size: 16px;"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}
