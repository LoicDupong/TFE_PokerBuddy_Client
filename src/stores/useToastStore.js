import { create } from "zustand";

const useToastStore = create((set) => ({
  toast: null,
  showToast: (message, type = "error") => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),
}));

export default useToastStore;
