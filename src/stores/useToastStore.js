import { create } from "zustand";

let hideTimer = null;

const useToastStore = create((set) => ({
  toast: null,
  showToast: (message, type = "error") => {
    // Un nouveau toast relance le délai (sinon le timer du précédent l'effaçait trop tôt)
    clearTimeout(hideTimer);
    set({ toast: { message, type } });
    hideTimer = setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => {
    clearTimeout(hideTimer);
    set({ toast: null });
  },
}));

export default useToastStore;
