import { create } from "zustand";

let hideTimer = null;

const useToastStore = create((set) => ({
  toast: null,
  // type : "error" | "success" | "info" ; duration en ms
  showToast: (message, type = "error", duration = 3500) => {
    // Un nouveau toast relance le délai (sinon le timer du précédent l'effaçait trop tôt)
    clearTimeout(hideTimer);
    set({ toast: { message, type } });
    hideTimer = setTimeout(() => set({ toast: null }), duration);
  },
  clearToast: () => {
    clearTimeout(hideTimer);
    set({ toast: null });
  },
}));

export default useToastStore;
