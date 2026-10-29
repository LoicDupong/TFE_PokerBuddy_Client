"use client";

import { useCallback, useEffect, useState } from "react";
import gameFinanceService from "@/services/gameFinance.service";

// Vue finance d'une partie liée (null en session libre ou tant qu'elle charge).
// `setFinance` reçoit la vue renvoyée par chaque écriture : pas de second GET.
export default function useGameFinance(gameId) {
    const [state, setState] = useState({ gameId: null, finance: null, error: null });

    const reload = useCallback(async () => {
        if (!gameId) return;
        const res = await gameFinanceService.get(gameId);
        setState({ gameId, finance: res.success ? res.data.finance : null, error: res.success ? null : res.error });
    }, [gameId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const setFinance = useCallback((finance) => setState({ gameId, finance, error: null }), [gameId]);

    const current = state.gameId === gameId ? state : { finance: null, error: null };
    return { finance: gameId ? current.finance : null, error: current.error, setFinance, reload };
}
