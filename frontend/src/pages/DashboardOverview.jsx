import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
    ArrowRight,
    Calendar,
    Plus,
    Package,
    MapPin,
    UserCog,
    Sparkles,
    CheckCircle2,
    BadgePercent,
    Truck,
    TrendingUp,
} from "lucide-react";
import { loadAllPickups, STATUS_META } from "@/lib/mockPickups";
import {
    getProfile,
    billingPlan,
    mockCouponHistory,
} from "@/lib/accountStorage";
import { savedAddresses, timeSlots } from "@/lib/mockData";
import ReferralCard from "@/components/dashboard/ReferralCard";

const findAddress = (id) => savedAddresses.find((a) => a.id === id);
const findSlot = (id) => timeSlots.find((s) => s.id === id);

const greetingFor = (hr) => {
    if (hr < 5) return "Up late";
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    if (hr < 21) return "Good evening";
    return "Good night";
};

const StatCard = ({ label, value, sub, tone = "default", testId }) => (
    <div
        data-testid={testId}
        className={`rounded-sm border p-5 sm:p-6 ${
            tone === "dark"
                ? "border-[#171A15] bg-[#171A15] text-[#F7F5F0]"
                : "border-[#D1CDBC] bg-white"
        }`}
    >
        <p
            className={`font-mono-label text-[10px] ${
                tone === "dark" ? "text-[#F7F5F0]/60" : "text-[#596155]"
            }`}
        >
            {label}
        </p>
        <p
            className={`mt-3 font-display text-4xl font-black tracking-tighter ${
                tone === "dark" ? "text-[#F7F5F0]" : "text-[#121710]"
            }`}
        >
            {value}
        </p>
        {sub && (
            <p
                className={`mt-1 text-xs ${
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
            data-testid={`overview-upcoming-${p.id}`}
            className="group flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-white p-4 hover:-translate-y-0.5 hover:border-[#284226] transition-all"
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

const QUICK_ACTIONS = [
    {
        to: "/dashboard/book-pickup",
        label: "Schedule pickup",
        desc: "Book a slot in the next 7 days.",
        icon: Plus,
        accent: true,
    },
    {
        to: "/dashboard/pickups",
        label: "View my pickups",
        desc: "Active, upcoming and completed.",
        icon: Package,
    },
    {
        to: "/dashboard/me?tab=addresses",
        label: "Manage addresses",
        desc: "Add, edit, set a default.",
        icon: MapPin,
    },
    {
        to: "/dashboard/me",
        label: "Account settings",
        desc: "Profile, notifications, security.",
        icon: UserCog,
    },
];

const QuickActions = () => (
    <section data-testid="overview-quick-actions">
        <div className="flex items-center justify-between mb-3">
            <p className="font-mono-label text-xs text-[#596155]">
                Quick actions
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                    <Link
                        key={a.label}
                        to={a.to}
                        data-testid={`quick-action-${a.label
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        className={`group flex items-start gap-3 rounded-sm border p-4 transition-all hover:-translate-y-0.5 ${
                            a.accent
                                ? "border-[#284226] bg-[#284226] text-[#F7F5F0] hover:bg-[#1C2E1A]"
                                : "border-[#D1CDBC] bg-white text-[#121710] hover:border-[#121710]"
                        }`}
                    >
                        <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-sm shrink-0 ${
                                a.accent
                                    ? "bg-[#C45B38] text-[#F7F5F0]"
                                    : "bg-[#EDE9DC] text-[#284226]"
                            }`}
                        >
                            <Icon size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-bold tracking-tight">
                                {a.label}
                            </p>
                            <p
                                className={`mt-1 text-xs ${
                                    a.accent
                                        ? "text-[#F7F5F0]/70"
                                        : "text-[#596155]"
                                }`}
                            >
                                {a.desc}
                            </p>
                        </div>
                        <ArrowRight
                            size={14}
                            className={`mt-1 transition-transform group-hover:translate-x-0.5 ${
                                a.accent
                                    ? "text-[#F7F5F0]/70"
                                    : "text-[#596155]"
                            }`}
                        />
                    </Link>
                );
            })}
        </div>
    </section>
);

const activityIcon = (kind) => {
    if (kind === "booking") return Calendar;
    if (kind === "status") return Truck;
    if (kind === "completed") return CheckCircle2;
    if (kind === "coupon") return BadgePercent;
    return Sparkles;
};

const ActivityFeed = ({ items }) => (
    <section data-testid="overview-recent-activity">
        <div className="flex items-center justify-between mb-3">
            <p className="font-mono-label text-xs text-[#596155]">
                Recent activity
            </p>
        </div>
        {items.length === 0 ? (
            <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-6 text-sm text-[#596155] text-center">
                Nothing happening just yet. Book your first pickup to see
                activity here.
            </div>
        ) : (
            <ul className="rounded-sm border border-[#D1CDBC] bg-white divide-y divide-[#D1CDBC]">
                {items.map((it) => {
                    const Icon = activityIcon(it.kind);
                    const Wrap = it.to ? Link : "div";
                    const wrapProps = it.to ? { to: it.to } : {};
                    return (
                        <li
                            key={it.id}
                            data-testid={`activity-row-${it.id}`}
                            className="px-4 py-3"
                        >
                            <Wrap
                                {...wrapProps}
                                className={`flex items-start gap-3 ${
                                    it.to
                                        ? "group hover:text-[#284226]"
                                        : ""
                                }`}
                            >
                                <span
                                    className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-sm shrink-0 ${
                                        it.tone === "accent"
                                            ? "bg-[#C45B38]/10 text-[#C45B38]"
                                            : "bg-[#EDE9DC] text-[#284226]"
                                    }`}
                                >
                                    <Icon size={13} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-[#121710]">
                                        {it.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#596155]">
                                        {it.subtitle}
                                    </p>
                                </div>
                                <p className="font-mono-label text-[10px] text-[#596155] whitespace-nowrap pt-1">
                                    {it.timeLabel}
                                </p>
                            </Wrap>
                        </li>
                    );
                })}
            </ul>
        )}
    </section>
);

const DashboardOverview = () => {
    const profile = getProfile();
    const firstName = (profile.name || "").split(" ")[0] || "there";
    const greeting = greetingFor(new Date().getHours());

    const all = useMemo(() => loadAllPickups(), []);
    const upcoming = all
        .filter((p) => p.status === "scheduled" || p.status === "in_progress")
        .slice(0, 3);
    const completedCount = all.filter((p) => p.status === "completed").length;
    const upcomingCount = all.filter(
        (p) => p.status === "scheduled" || p.status === "in_progress"
    ).length;

    const totalSaved = mockCouponHistory.reduce(
        (s, c) => s + (c.savedAmount || 0),
        0
    );
    const totalKg = all
        .filter((p) => p.status === "completed")
        .reduce((s, p) => s + (p.kgPicked || 0), 0);

    // ----- Build recent activity feed (mock-driven) -----
    const activity = useMemo(() => {
        const items = [];
        all.slice(0, 4).forEach((p) => {
            items.push({
                id: `${p.id}-booking`,
                kind: "booking",
                title: (
                    <>
                        Pickup{" "}
                        <span className="font-medium">{p.id}</span>{" "}
                        scheduled for{" "}
                        {format(parseISO(p.date), "d MMM")}
                    </>
                ),
                subtitle: `${findAddress(p.addressId)?.label || ""} · ${
                    findSlot(p.slotId)?.range || ""
                }`,
                timeLabel: formatDistanceToNow(parseISO(p.createdAt), {
                    addSuffix: true,
                }),
                at: p.createdAt,
                to: `/dashboard/pickups/${p.id}`,
            });
            if (p.status === "completed") {
                items.push({
                    id: `${p.id}-completed`,
                    kind: "completed",
                    title: (
                        <>
                            {p.id} marked completed{" "}
                            {p.kgPicked && (
                                <span className="text-[#596155]">
                                    · {p.kgPicked} kg recycled
                                </span>
                            )}
                        </>
                    ),
                    subtitle: "Receipt available in your dashboard.",
                    timeLabel: formatDistanceToNow(parseISO(p.date), {
                        addSuffix: true,
                    }),
                    at: p.date,
                    to: `/dashboard/pickups/${p.id}`,
                });
            }
            if (p.status === "in_progress") {
                items.push({
                    id: `${p.id}-progress`,
                    kind: "status",
                    title: <>{p.id} is in progress — driver assigned.</>,
                    subtitle: "Track partner on the pickup details page.",
                    timeLabel: "today",
                    at: p.date,
                    to: `/dashboard/pickups/${p.id}`,
                });
            }
        });
        mockCouponHistory.forEach((c) => {
            items.push({
                id: `coupon-${c.bookingId}`,
                kind: "coupon",
                tone: "accent",
                title: (
                    <>
                        Saved ₹{c.savedAmount} with{" "}
                        <span className="font-mono-label text-[#C45B38]">
                            {c.code}
                        </span>{" "}
                        on {c.bookingId}
                    </>
                ),
                subtitle: "Applied at checkout.",
                timeLabel: formatDistanceToNow(parseISO(c.appliedOn), {
                    addSuffix: true,
                }),
                at: c.appliedOn,
                to: `/dashboard/pickups/${c.bookingId}`,
            });
        });
        return items
            .sort(
                (a, b) =>
                    new Date(b.at).getTime() - new Date(a.at).getTime()
            )
            .slice(0, 6);
    }, [all]);

    return (
        <div
            data-testid="dashboard-overview-page"
            className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12 space-y-10"
        >
            {/* WELCOME */}
            <header
                data-testid="overview-welcome"
                className="grid gap-6 lg:grid-cols-12 items-end"
            >
                <div className="lg:col-span-8">
                    <p className="font-mono-label text-xs text-[#596155]">
                        [ dashboard · overview ]
                    </p>
                    <h1 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                        {greeting},{" "}
                        <span className="italic font-medium text-[#284226]">
                            {firstName}.
                        </span>
                    </h1>
                    <p className="mt-3 text-[#596155] max-w-2xl">
                        You're on the{" "}
                        <span className="text-[#121710] font-medium">
                            {billingPlan.name}
                        </span>{" "}
                        plan with{" "}
                        <span className="text-[#121710] font-medium">
                            {billingPlan.bagsRemaining} of{" "}
                            {billingPlan.bagsTotal}
                        </span>{" "}
                        pickups left this month. Renews on{" "}
                        {format(parseISO(billingPlan.renewsOn), "d MMM")}.
                    </p>
                </div>
                <div className="lg:col-span-4 rounded-sm border border-[#D1CDBC] bg-white p-5">
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Quick summary
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                        <TrendingUp
                            size={20}
                            className="text-[#284226] shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="font-display text-2xl font-black tracking-tighter text-[#121710]">
                                {totalKg.toFixed(1)} kg
                            </p>
                            <p className="text-xs text-[#596155]">
                                diverted from landfill via your pickups
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* STATS */}
            <section
                data-testid="overview-stats"
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
                <StatCard
                    testId="stat-total-pickups"
                    label="Total pickups"
                    value={all.length}
                    sub="Across all statuses"
                />
                <StatCard
                    testId="stat-upcoming-pickups"
                    label="Upcoming"
                    value={upcomingCount}
                    sub="Scheduled + in progress"
                    tone="dark"
                />
                <StatCard
                    testId="stat-completed-pickups"
                    label="Completed"
                    value={completedCount}
                    sub="Bags weighed & recycled"
                />
                <StatCard
                    testId="stat-total-savings"
                    label="Savings earned"
                    value={`₹${totalSaved}`}
                    sub="Via coupons & referrals"
                />
            </section>

            {/* MAIN GRID */}
            <div className="grid gap-8 lg:grid-cols-12">
                {/* LEFT: Upcoming + Recent activity */}
                <div className="lg:col-span-7 space-y-8">
                    <section data-testid="overview-section-upcoming">
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-mono-label text-xs text-[#596155]">
                                Upcoming pickups
                            </p>
                            <Link
                                to="/dashboard/pickups"
                                data-testid="overview-view-all-pickups"
                                className="text-xs text-[#C45B38] hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        {upcoming.length === 0 ? (
                            <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-8 text-center">
                                <Calendar
                                    size={20}
                                    className="mx-auto text-[#596155]"
                                />
                                <p className="mt-3 font-display text-lg text-[#121710]">
                                    Nothing on the calendar.
                                </p>
                                <p className="mt-1 text-sm text-[#596155]">
                                    Book a slot in the next 7 days.
                                </p>
                                <Link
                                    to="/dashboard/book-pickup"
                                    data-testid="overview-empty-book"
                                    className="mt-5 inline-flex items-center gap-2 rounded-sm bg-[#284226] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A]"
                                >
                                    Schedule a pickup
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
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

                    <ActivityFeed items={activity} />
                </div>

                {/* RIGHT: Referral + Quick actions */}
                <aside className="lg:col-span-5 space-y-6">
                    <ReferralCard />
                    <QuickActions />
                </aside>
            </div>
        </div>
    );
};

export default DashboardOverview;
