import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    ArrowRight,
    Calendar,
    PackageCheck,
    Truck,
    Wallet,
    Scale,
    Plus,
    CheckCircle2,
    Clock,
} from "lucide-react";
import {
    loadPickups,
    computeStats,
    execProfile,
} from "@/lib/executiveMock";
import ExecStatusBadge from "@/components/executive/ExecStatusBadge";

const greetingFor = (h) => {
    if (h < 5) return "Up late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
};

const StatCard = ({ label, value, sub, icon: Icon, tone = "default", testId }) => (
    <div
        data-testid={testId}
        className={`rounded-sm border p-4 ${
            tone === "dark"
                ? "bg-[#171A15] text-[#F7F5F0] border-[#171A15]"
                : "bg-white border-[#D1CDBC]"
        }`}
    >
        <div className="flex items-center justify-between gap-2">
            <p
                className={`font-mono-label text-[10px] ${
                    tone === "dark"
                        ? "text-[#F7F5F0]/60"
                        : "text-[#596155]"
                }`}
            >
                {label}
            </p>
            {Icon && (
                <Icon
                    size={14}
                    className={
                        tone === "dark"
                            ? "text-[#F7F5F0]/60"
                            : "text-[#596155]"
                    }
                />
            )}
        </div>
        <p
            className={`mt-2 font-display text-3xl font-black tracking-tighter ${
                tone === "dark" ? "text-[#F7F5F0]" : "text-[#121710]"
            }`}
        >
            {value}
        </p>
        {sub && (
            <p
                className={`mt-0.5 text-[11px] ${
                    tone === "dark"
                        ? "text-[#F7F5F0]/60"
                        : "text-[#596155]"
                }`}
            >
                {sub}
            </p>
        )}
    </div>
);

const ExecutiveDashboard = () => {
    const pickups = useMemo(() => loadPickups(), []);
    const stats = useMemo(() => computeStats(pickups), [pickups]);

    const next = pickups.find(
        (p) =>
            p.status === "on_the_way" ||
            p.status === "arrived" ||
            p.status === "collecting" ||
            p.status === "payment_pending"
    ) || pickups.find((p) => p.status === "assigned" || p.status === "accepted");

    const firstName = execProfile.name.split(" ")[0];

    return (
        <div data-testid="exec-dashboard-page" className="px-5 pt-8 pb-6 space-y-6">
            {/* Welcome */}
            <header data-testid="exec-welcome">
                <p className="font-mono-label text-[10px] text-[#596155]">
                    [ partner · today {format(new Date(), "EEE d MMM")} ]
                </p>
                <h1 className="mt-2 font-display font-black tracking-tighter text-3xl text-[#121710]">
                    {greetingFor(new Date().getHours())},{" "}
                    <span className="italic font-medium text-[#284226]">
                        {firstName}.
                    </span>
                </h1>
                <p className="mt-2 text-sm text-[#596155]">
                    Zone{" "}
                    <span className="text-[#121710] font-medium">
                        {execProfile.zone}
                    </span>
                    {" · "}vehicle{" "}
                    <span className="text-[#121710] font-medium">
                        {execProfile.vehicle}
                    </span>
                </p>
            </header>

            {/* Stat grid */}
            <section
                data-testid="exec-stats"
                className="grid grid-cols-2 gap-3"
            >
                <StatCard
                    testId="exec-stat-todays"
                    label="Today's pickups"
                    value={stats.todaysCount}
                    sub="Across all statuses"
                    icon={Calendar}
                    tone="dark"
                />
                <StatCard
                    testId="exec-stat-pending"
                    label="Pending"
                    value={stats.pendingCount}
                    sub="Not yet completed"
                    icon={Clock}
                />
                <StatCard
                    testId="exec-stat-completed"
                    label="Completed"
                    value={stats.completedCount}
                    sub="Bags routed to depot"
                    icon={CheckCircle2}
                />
                <StatCard
                    testId="exec-stat-kg"
                    label="Collected"
                    value={`${stats.totalKg}`}
                    sub="kg of recyclables"
                    icon={Scale}
                />
            </section>
            <section data-testid="exec-stat-earn-row" className="rounded-sm border border-[#284226] bg-[#284226] text-[#F7F5F0] p-5 flex items-center justify-between">
                <div className="min-w-0">
                    <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                        Earnings collected today
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tracking-tighter">
                        ₹{stats.totalEarn}
                    </p>
                    <p className="mt-1 text-xs text-[#F7F5F0]/70">
                        UPI + cash combined
                    </p>
                </div>
                <Wallet size={28} className="text-[#C45B38] shrink-0" />
            </section>

            {/* Next pickup CTA */}
            {next && (
                <Link
                    to={`/executive/pickups/${next.id}`}
                    data-testid="exec-next-pickup-cta"
                    className="block rounded-sm border border-[#D1CDBC] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#284226]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-mono-label text-[10px] text-[#596155]">
                            Up next
                        </p>
                        <ExecStatusBadge status={next.status} />
                    </div>
                    <p className="font-display text-xl font-bold tracking-tight text-[#121710]">
                        {next.customer.name}
                    </p>
                    <p className="mt-1 text-sm text-[#596155] line-clamp-2">
                        {next.address.line1}, {next.address.city}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-[#596155]">
                            {format(parseISO(next.scheduledFor), "HH:mm")} ·{" "}
                            {next.slot}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm text-[#C45B38] font-medium">
                            Open
                            <ArrowRight size={14} />
                        </span>
                    </div>
                </Link>
            )}

            {/* Quick actions */}
            <section data-testid="exec-quick-actions">
                <p className="font-mono-label text-[10px] text-[#596155] mb-3">
                    Quick actions
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        to="/executive/pickups"
                        data-testid="exec-quick-pickups"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-4 hover:-translate-y-0.5 transition-all"
                    >
                        <PackageCheck
                            size={18}
                            className="text-[#284226]"
                        />
                        <p className="mt-3 font-display text-sm font-bold text-[#121710]">
                            All pickups
                        </p>
                        <p className="text-[11px] text-[#596155] mt-0.5">
                            Filter assigned, in progress, done
                        </p>
                    </Link>
                    <Link
                        to="/executive/me"
                        data-testid="exec-quick-profile"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-4 hover:-translate-y-0.5 transition-all"
                    >
                        <Truck
                            size={18}
                            className="text-[#284226]"
                        />
                        <p className="mt-3 font-display text-sm font-bold text-[#121710]">
                            My profile
                        </p>
                        <p className="text-[11px] text-[#596155] mt-0.5">
                            Stats, zone, sign out
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ExecutiveDashboard;
