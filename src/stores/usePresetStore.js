import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
    // Niveau et temps restant du Game Manager (voir utils/timer.utils.js)
    timer: null,
};

// Persisté dans le localStorage : un rechargement en pleine partie ne fait plus perdre
// les joueurs, la partie liée ni le timer
const usePresetStore = create(
    persist(
        (set) => ({
            preset: { ...initialPreset },

            setPreset: (data) =>
                set((state) => ({
                    preset: { ...state.preset, ...data },
                })),

            resetPreset: () =>
                set({
                    preset: { ...initialPreset },
                }),
        }),
        {
            name: "pokerbuddy-preset",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ preset: state.preset }),
            // Relu côté client par usePresetHydrated() : le HTML serveur ne connaît pas le localStorage
            skipHydration: true,
        }
    )
);

/**
 * Relit le preset sauvegardé et indique quand c'est fait.
 * À appeler en tête de composant, avant tout effet qui modifie le preset
 * (sinon l'écriture écraserait la sauvegarde avant sa relecture).
 */
export function usePresetHydrated() {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const unsubscribe = usePresetStore.persist.onFinishHydration(() => setHydrated(true));
        if (usePresetStore.persist.hasHydrated()) setHydrated(true);
        else usePresetStore.persist.rehydrate();
        return unsubscribe;
    }, []);

    return hydrated;
}

export default usePresetStore;
