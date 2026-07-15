import { writable } from 'svelte/store';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
};

function createToastStore() {
  const { subscribe, set, update } = writable<Toast[]>([]);

  return {
    subscribe,
    add: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, type, duration };
      
      update(toasts => [...toasts, toast]);
      
      if (duration > 0) {
        setTimeout(() => {
          toastStore.remove(id);
        }, duration);
      }
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(toast => toast.id !== id));
    },
    clear: () => {
      set([]);
    }
  };
}

export const toastStore = createToastStore();