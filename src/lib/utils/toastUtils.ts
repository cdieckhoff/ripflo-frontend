// Global toast notification utilities
// This maintains a reference to the addToast function from the Notifications component
let toastFunction: ((message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void) | null = null;

// Set the toast function (called by the Notifications component)
export function setToastFunction(fn: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void) {
  toastFunction = fn;
}

// Call the toast function
export function addToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
  if (toastFunction) {
    toastFunction(message, type, duration);
  }
}