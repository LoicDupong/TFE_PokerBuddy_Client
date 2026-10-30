"use client";

import { useEffect, useMemo, useState } from "react";

import adminService from "@/services/admin.service.js";
import { LoadError } from "@/components/admin/admin-ui.jsx";
import { ADMIN_TEXT, formatCents } from "@/components/admin/admin.utils.js";

const DASH_TEXT = {
    title: "Dashboard",
    range: "Period",
    presets: [{ days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }],
    from: "From",
    to: "To",
    invalidRange: "Pick a start date that is not after the end date, within one year.",
    loadError: "Could not load the dashboard.",
    tiles: {
        signups: "New members",
        activeUsers: "Active members",
        gamesCreated: "Games created",
        gamesFinished: "Games finished",
        avgPlayersPerGame: "Players per game",
        invitationsSent: "Invitations sent",
        acceptanceRate: "Acceptance rate",
        financeVolume: "Money tracked",
        supportOpen: "Open tickets",
        supportCreated: "Tickets created",
        pageViews: "Page views",
    },
    none: "—",
    chartTitle: "Per day",
    series: { signups: "Sign-ups", gamesCreated: "Games created", pageViews: "Page views" },
    chartLabel: (name, total, from, to) => `${name}: ${total} between ${from} and ${to}`,
    peak: (n) => `Peak: ${n}`,
    topPages: "Top pages",
    topReferrers: "Top referrers",
    noData: "No data for this period.",
    views: (n) => `${n} views`,
};

const isoDay = (date) => date.toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return isoDay(d); };

function BarChart({ data, valueKey, name }) {
    const width = 320;
    const height = 110;
    const max = Math.max(1, ...data.map((d) => d[valueKey] || 0));
    const slot = width / Math.max(1, data.length);
    const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
    const label = DASH_TEXT.chartLabel(name, total, data[0]?.day ?? "", data[data.length - 1]?.day ?? "");
    return (
        <div>
            <p className="admin__chart-title">
                <strong>{name}</strong>
                <span className="admin__chart-legend">{DASH_TEXT.peak(max === 1 && total === 0 ? 0 : max)}</span>
            </p>
            <svg className="admin__chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} preserveAspectRatio="none">
                <title>{label}</title>
                <line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke="currentColor" strokeOpacity="0.3" />
                {data.map((d, i) => {
                    const value = d[valueKey] || 0;
                    const h = (value / max) * (height - 6);
                    return (
                        <rect key={d.day} x={i * slot + slot * 0.1} y={height - h} width={Math.max(1, slot * 0.8)} height={h} fill="var(--primary-color-light)">
                            <title>{`${d.day}: ${value}`}</title>
                        </rect>
                    );
                })}
            </svg>
            <p className="admin__chart-legend">{data[0]?.day} → {data[data.length - 1]?.day}</p>
        </div>
    );
}

function Bars({ title, rows, labelKey, empty }) {
    const max = Math.max(1, ...rows.map((r) => r.views));
    return (
        <div className="admin__section">
            <h3>{title}</h3>
            {rows.length === 0 ? <p className="admin__hint">{empty}</p> : (
                <ul className="admin__bars">
                    {rows.map((r) => (
                        <li key={r[labelKey]} className="admin__bar">
                            <span>{r[labelKey]}</span>
                            <span>{DASH_TEXT.views(r.views)}</span>
                            <span className="admin__bar-track" aria-hidden="true"><i style={{ width: `${(r.views / max) * 100}%` }} /></span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AdminDashboardPage() {
    const [range, setRange] = useState(() => ({ from: daysAgo(29), to: daysAgo(0) }));
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const [seriesKey, setSeriesKey] = useState("signups");

    const rangeValid = useMemo(() => {
        if (!range.from || !range.to || range.from > range.to) return false;
        return (new Date(range.to) - new Date(range.from)) / 86400000 <= 365;
    }, [range]);

    useEffect(() => {
        if (!rangeValid) return;
        let cancelled = false;
        (async () => {
            const res = await adminService.getOverview(range);
            if (cancelled) return;
            if (res.success) { setData(res.data); setError(null); }
            else setError(res.forbidden ? ADMIN_TEXT.forbidden : DASH_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [range, rangeValid, attempt]);

    const t = data?.totals;
    const tiles = t ? [
        [DASH_TEXT.tiles.signups, t.signups],
        [DASH_TEXT.tiles.activeUsers, t.activeUsers],
        [DASH_TEXT.tiles.gamesCreated, t.gamesCreated],
        [DASH_TEXT.tiles.gamesFinished, t.gamesFinished],
        [DASH_TEXT.tiles.avgPlayersPerGame, t.avgPlayersPerGame ?? DASH_TEXT.none],
        [DASH_TEXT.tiles.invitationsSent, t.invitations?.sent],
        [DASH_TEXT.tiles.acceptanceRate, t.invitations?.acceptanceRate == null ? DASH_TEXT.none : `${t.invitations.acceptanceRate}%`],
        [DASH_TEXT.tiles.financeVolume, formatCents(t.financeVolumeCents)],
        [DASH_TEXT.tiles.supportOpen, t.supportTicketsOpen],
        [DASH_TEXT.tiles.supportCreated, t.supportTicketsCreated],
        [DASH_TEXT.tiles.pageViews, t.pageViews],
    ] : [];

    return (
        <section className="admin__section">
            <h2>{DASH_TEXT.title}</h2>

            <div className="admin__range">
                <div className="admin__presets" role="group" aria-label={DASH_TEXT.range}>
                    {DASH_TEXT.presets.map(({ days, label }) => (
                        <button key={days} type="button" className="btn admin__btn" onClick={() => setRange({ from: daysAgo(days - 1), to: daysAgo(0) })}>{label}</button>
                    ))}
                </div>
                <div className="admin__filters">
                    <label>
                        {DASH_TEXT.from}
                        <input type="date" value={range.from} max={range.to} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
                    </label>
                    <label>
                        {DASH_TEXT.to}
                        <input type="date" value={range.to} min={range.from} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
                    </label>
                </div>
                {!rangeValid && <p className="form__error" role="alert">{DASH_TEXT.invalidRange}</p>}
            </div>

            {error && <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />}
            {!error && rangeValid && data === null && <p>{ADMIN_TEXT.loading}</p>}
            {data && (
                <>
                    <div className="admin__tiles">
                        {tiles.map(([label, value]) => (
                            <div key={label} className="admin__tile">
                                <span className="admin__tile-value">{value ?? DASH_TEXT.none}</span>
                                <span className="admin__tile-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="admin__section">
                        <h3>{DASH_TEXT.chartTitle}</h3>
                        <div className="admin__presets" role="group" aria-label={DASH_TEXT.chartTitle}>
                            {Object.entries(DASH_TEXT.series).map(([key, label]) => (
                                <button key={key} type="button" aria-pressed={seriesKey === key} className={`btn admin__btn${seriesKey === key ? " admin__btn--primary" : ""}`} onClick={() => setSeriesKey(key)}>{label}</button>
                            ))}
                        </div>
                        {data.daily.length === 0
                            ? <p className="admin__hint">{DASH_TEXT.noData}</p>
                            : <BarChart data={data.daily} valueKey={seriesKey} name={DASH_TEXT.series[seriesKey]} />}
                    </div>

                    <Bars title={DASH_TEXT.topPages} rows={data.topPages} labelKey="path" empty={DASH_TEXT.noData} />
                    <Bars title={DASH_TEXT.topReferrers} rows={data.topReferrers} labelKey="host" empty={DASH_TEXT.noData} />
                </>
            )}
        </section>
    );
}
