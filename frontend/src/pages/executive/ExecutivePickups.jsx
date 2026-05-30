import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    MapPin,
    Phone,
    ArrowRight,
    Clock,
} from "lucide-react";
import { loadPickups } from "@/lib/executiveMock";
import ExecStatusBadge from "@/components/executive/ExecStatusBadge";

const FILTERS = [
    {
        id: "assigned",
        label: "Assigned",
        match: (p) => p.status === "assigned" || p.status === "accepted",
    },
    {
        id: "in_progress",
        label: "In progress",
        match: (p) =>
            p.status === "on_the_way" ||
            p.status === "arrived" ||
            p.status === "collecting" ||
            p.status === "payment_pending",
    },
    {
        id: "completed",
        label: "Completed",
        match: (p) => p.status === "completed",
    },
];

const ExecutivePickups = () => {
    const all = useMemo(() => loadPickups(), []);
    const [filterId, setFilterId] = useState("assigned");
    const filter = FILTERS.find((f) => f.id === filterId);
    const list = useMemo(
        () => all.filter(filter.match),
        [all, filter]
    );
    const counts = useMemo(
        () =>
            FILTERS.reduce(
                (m, f) => ({ ...m, [f.id]: all.filter(f.match).length }),
                {}
            ),
        [all]
    );

    return (
        <div
            data-testid="exec-pickups-page"
            className="px-5 pt-8 pb-6"
        >
            <header className="mb-6">
                <p className="font-mono-label text-[10px] text-[#596155]">
                    [ partner · pickups ]
                </p>
                <h1 className="mt-2 font-display font-black tracking-tighter text-3xl text-[#121710]">
                    Assigned pickups
                </h1>
            </header>

            {/* Filter pills */}
            <div
                role="tablist"
                data-testid="exec-pickups-filters"
                className="flex gap-2 mb-5 overflow-x-auto no-scrollbar"
            >
                {FILTERS.map((f) => {
                    const active = f.id === filterId;
                    return (
                        <button
                            key={f.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setFilterId(f.id)}
                            data-testid={`exec-filter-${f.id}`}
                            className={`inline-flex items-center gap-2 rounded-sm border px-3.5 py-2.5 text-sm transition-colors shrink-0 ${
                                active
                                    ? "bg-[#171A15] text-[#F7F5F0] border-[#171A15]"
                                    : "border-[#D1CDBC] bg-white text-[#596155]"
                            }`}
                        >
                            {f.label}
                            <span
                                className={`font-mono-label text-[10px] ${
                                    active
                                        ? "text-[#F7F5F0]/70"
                                        : "text-[#596155]"
                                }`}
                            >
                                {counts[f.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {list.length === 0 ? (
                <div
                    data-testid="exec-pickups-empty"
                    className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center"
                >
                    <p className="font-display text-lg text-[#121710]">
                        Nothing here yet.
                    </p>
                    <p className="mt-1 text-sm text-[#596155]">
                        {filterId === "assigned"
                            ? "All caught up — sit tight for the next dispatch."
                            : "Items in this state will show up here."}
                    </p>
                </div>
            ) : (
                <ul className="space-y-3" data-testid="exec-pickups-list">
                    {list.map((p) => (
                        <li
                            key={p.id}
                            data-testid={`exec-pickup-card-${p.id}`}
                            className="rounded-sm border border-[#D1CDBC] bg-white p-4"
                        >
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="min-w-0">
                                    <p className="font-mono-label text-[10px] text-[#596155]">
                                        {p.id}
                                    </p>
                                    <p className="mt-1 font-display text-lg font-bold tracking-tight text-[#121710] truncate">
                                        {p.customer.name}
                                    </p>
                                </div>
                                <ExecStatusBadge status={p.status} />
                            </div>
                            <div className="space-y-2 text-sm text-[#596155] mb-4">
                                <p className="flex items-start gap-2">
                                    <MapPin
                                        size={14}
                                        className="text-[#284226] mt-0.5 shrink-0"
                                    />
                                    <span>
                                        {p.address.line1}, {p.address.city}
                                    </span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Clock
                                        size={14}
                                        className="text-[#284226]"
                                    />
                                    <span>
                                        {format(
                                            parseISO(p.scheduledFor),
                                            "HH:mm"
                                        )}{" "}
                                        · {p.slot}
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`tel:${p.customer.phone}`}
                                    data-testid={`exec-pickup-call-${p.id}`}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[#284226] bg-white px-3 py-3 text-sm font-medium text-[#284226] hover:bg-[#284226] hover:text-[#F7F5F0]"
                                >
                                    <Phone size={14} /> Call
                                </a>
                                <Link
                                    to={`/executive/pickups/${p.id}`}
                                    data-testid={`exec-pickup-view-${p.id}`}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#284226] px-3 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A]"
                                >
                                    View
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ExecutivePickups;
