import { create } from "zustand";

const usePresetStore = create((set) => ({
    preset: {
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
    },
    setPreset: (data) => set((state) => ({
        preset: { ...state.preset, ...data }
    })),
    resetPreset: () => set({
        preset: {
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
        }
    })
}));

export default usePresetStore;
