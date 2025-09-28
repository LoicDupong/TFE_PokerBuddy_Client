import { create } from "zustand";

const initialPreset = {
    title: "",
    dateTime: "",
    location: "",
    buyIn: 0,
    currency: "EUR",
    smallBlind: 10,
    bigBlind: 20,
    levelDurationMin: 15,
    enableBlindTimer: true,
    maxPlayers: null,
    allowRebuys: false,
    isPrivate: true,
    invitedEmails: "",
    sendInvitesNow: false,
    notes: "",
    players: [],
};

const usePresetStore = create((set) => ({
    preset: { ...initialPreset },

    setPreset: (data) =>
        set((state) => ({
            preset: { ...state.preset, ...data },
        })),

    resetPreset: () =>
        set({
            preset: { ...initialPreset },
        }),
}));

export default usePresetStore;
