import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Leaf,
    Recycle,
    BadgePercent,
} from "lucide-react";
import { loadAllPickups, STATUS_META } from "@/lib/mockPickups";
import { mockCouponHistory } from "@/lib/accountStorage";
import { savedAddresses, timeSlots } from "@/lib/mockData";

const findAddress = (id) => savedAddresses.find((a) => a.id === id);
const findSlot = (id) => timeSlots.find((s) => s.id === id);

const StatusChip = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.scheduled;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-label text-[10px] ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

const PickupRow = ({ p }) => {
    const addr = findAddress(p.addressId);
    const slot = findSlot(p.slotId);
    return (
        <Link
            to={`/dashboard/pickups/${p.id}`}
            data-testid={`activity-pickup-${p.id}`}
            className="group flex items-center justify-between gap-4 rounded-sm border border-[#D1CDBC] bg-white p-4 hover:-translate-y-0.5 hover:border-[#284226] transition-all"
        >
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm font-bold tracking-tight text-[#121710]">
                        {p.id}
                    </p>
                    <StatusChip status={p.status} />
                </div>
                <p className="mt-1 text-xs text-[#596155] truncate">
                    {format(parseISO(p.date), "EEE, d MMM")} ·{" "}
                    {slot?.range || "—"} · {addr?.label || "—"}
                </p>
            </div>
            <ArrowRight
                size={14}
                className="text-[#596155] shrink-0 transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
};

export const ActivityTab = () => {
    const all = useMemo(() => loadAllPickups(), []);
    const upcoming = all
        .filter((p) => p.status === "scheduled" || p.status === "in_progress")
        .slice(0, 4);
    const completed = all
        .filter((p) => p.status === "completed")
        .slice(0, 4);

    const stats = useMemo(() => {
        const done = all.filter((p) => p.status === "completed");
        const totalKg = done.reduce((s, p) => s + (p.kgPicked || 0), 0);
        const totalCo2 = done.reduce((s, p) => s + (p.co2Saved || 0), 0);
        const totalSaved = mockCouponHistory.reduce(
            (s, c) => s + (c.savedAmount || 0),
            0
        );
        return {
            totalPickups: all.length,
            completedPickups: done.length,
            totalKg: totalKg.toFixed(1),
            totalCo2: totalCo2.toFixed(1),
            totalSaved,
        };
    }, [all]);

    return (
        <div data-testid="account-tab-activity" className="space-y-5">
            <header className="pb-4 sm:pb-6 mb-1 sm:mb-2 border-b border-[#D1CDBC]">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#121710]">
                    Activity
                </h2>
                <p className="mt-1 text-sm text-[#596155]">
                    A snapshot of what you've recycled and what's still on the
                    calendar.
                </p>
            </header>

            {/* Stats */}
            <section
                data-testid="activity-stats"
                className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-sm border border-[#D1CDBC] bg-[#D1CDBC]"
            >
                <div className="bg-white p-5">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Total pickups
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tracking-tighter text-[#121710]">
                        {stats.totalPickups}
                    </p>
                </div>
                <div className="bg-white p-5">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Completed
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tracking-tighter text-[#284226]">
                        {stats.completedPickups}
                    </p>
                </div>
                <div className="bg-white p-5">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Diverted
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tracking-tighter text-[#121710]">
                        {stats.totalKg}
                        <span className="text-sm text-[#596155] font-normal ml-1">
                            kg
                        </span>
                    </p>
                </div>
                <div className="bg-white p-5">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Saved via coupons
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tracking-tighter text-[#C45B38]">
                        ₹{stats.totalSaved}
                    </p>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Upcoming */}
                <section
                    data-testid="activity-section-upcoming"
                    className="rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar
                                size={14}
                                className="text-[#284226]"
                            />
                            <h3 className="font-display text-base font-bold tracking-tight text-[#121710]">
                                Upcoming pickups
                            </h3>
                        </div>
                        <Link
                            to="/dashboard/pickups"
                            data-testid="activity-view-all-upcoming"
                            className="text-xs text-[#C45B38] hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-5 text-sm text-[#596155] text-center">
                            Nothing scheduled.{" "}
                            <Link
                                to="/dashboard/book-pickup"
                                className="text-[#C45B38] hover:underline"
                            >
                                Book one →
                            </Link>
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {upcoming.map((p) => (
                                <li key={p.id}>
                                    <PickupRow p={p} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Completed */}
                <section
                    data-testid="activity-section-completed"
                    className="rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2
                                size={14}
                                className="text-[#284226]"
                            />
                            <h3 className="font-display text-base font-bold tracking-tight text-[#121710]">
                                Recently completed
                            </h3>
                        </div>
                        <Link
                            to="/dashboard/pickups"
                            data-testid="activity-view-all-completed"
                            className="text-xs text-[#C45B38] hover:underline"
                        >
                            View all →
                        </Link>
                    </div>
                    {completed.length === 0 ? (
                        <p className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-5 text-sm text-[#596155] text-center">
                            No completed pickups yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {completed.map((p) => (
                                <li key={p.id}>
                                    <PickupRow p={p} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {/* Coupons used */}
            <section
                data-testid="activity-section-coupons"
                className="rounded-sm border border-[#D1CDBC] bg-white p-5 sm:p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <BadgePercent
                        size={14}
                        className="text-[#C45B38]"
                    />
                    <h3 className="font-display text-base font-bold tracking-tight text-[#121710]">
                        Recently used promo codes
                    </h3>
                </div>
                {mockCouponHistory.length === 0 ? (
                    <p className="rounded-sm border border-dashed border-[#D1CDBC] bg-[#F7F5F0] p-5 text-sm text-[#596155] text-center">
                        No coupons redeemed yet — try{" "}
                        <span className="font-mono-label text-[#C45B38]">
                            WELCOME50
                        </span>{" "}
                        on your next pickup.
                    </p>
                ) : (
                    <ul className="grid sm:grid-cols-2 gap-2">
                        {mockCouponHistory.map((c) => (
                            <li
                                key={c.bookingId}
                                data-testid={`activity-coupon-${c.code}`}
                                className="flex items-center justify-between rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-sm bg-[#284226] text-[#F7F5F0] px-2 py-0.5 font-mono-label text-[10px]">
                                        {c.code}
                                    </span>
                                    <p className="text-xs text-[#596155]">
                                        {c.bookingId}
                                    </p>
                                </div>
                                <p className="font-display text-sm font-bold tracking-tight text-[#C45B38]">
                                    − ₹{c.savedAmount}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default ActivityTab;
