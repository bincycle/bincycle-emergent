import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    ArrowLeft,
    Phone,
    Navigation,
    Play,
    Truck,
    MapPinned,
    StickyNote,
    Image as ImageIcon,
    ArrowRight,
    PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
    findPickup,
    advanceStatus,
    EXEC_STATUS,
    STATUS_ORDER,
    STATUS_DESCRIPTION,
} from "@/lib/executiveMock";
import ExecStatusBadge from "@/components/executive/ExecStatusBadge";
import SwipeToConfirm from "@/components/SwipeToConfirm";

const ExecutivePickupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pickup, setPickup] = useState(() => findPickup(id));

    const directionsHref = useMemo(() => {
        if (!pickup) return "#";
        const q = encodeURIComponent(
            `${pickup.address.line1}, ${pickup.address.city} ${pickup.address.pincode}`
        );
        return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    }, [pickup]);

    if (!pickup) {
        return (
            <div className="px-5 pt-8 pb-6">
                <Link
                    to="/executive/pickups"
                    className="inline-flex items-center gap-1.5 text-sm text-[#596155]"
                >
                    <ArrowLeft size={14} /> All pickups
                </Link>
                <p className="mt-8 font-display text-xl text-[#121710]">
                    Pickup not found.
                </p>
            </div>
        );
    }

    const advance = (next) => {
        const u = advanceStatus(id, next);
        if (u) {
            setPickup(u);
            toast.success(`Marked ${EXEC_STATUS[next]?.label || next}.`);
        }
    };

    const renderAction = () => {
        const s = pickup.status;
        if (s === "completed") return null;
        if (s === "assigned")
            return (
                <ActionBar
                    label="Slide to accept pickup"
                    icon={PackageCheck}
                    onConfirm={() => advance("accepted")}
                    testId="exec-action-accept"
                />
            );
        if (s === "accepted")
            return (
                <ActionBar
                    label="Slide to start the trip"
                    confirmLabel="On the way"
                    icon={Truck}
                    onConfirm={() => advance("on_the_way")}
                    testId="exec-action-on-the-way"
                />
            );
        if (s === "on_the_way")
            return (
                <ActionBar
                    label="Slide to mark arrived"
                    confirmLabel="Arrived"
                    icon={MapPinned}
                    onConfirm={() => advance("arrived")}
                    testId="exec-action-arrived"
                />
            );
        if (s === "arrived")
            return (
                <ActionBar
                    label="Slide to start collecting"
                    confirmLabel="Let's go"
                    icon={Play}
                    tone="success"
                    onConfirm={() => {
                        advanceStatus(id, "collecting");
                        navigate(`/executive/pickups/${id}/complete`);
                    }}
                    testId="exec-action-start-collecting"
                />
            );
        // Mid-flow: collecting / payment_pending → continue completion
        return (
            <ActionBar
                label="Slide to continue completion"
                confirmLabel="Opening..."
                icon={ArrowRight}
                tone="success"
                onConfirm={() =>
                    navigate(`/executive/pickups/${id}/complete`)
                }
                testId="exec-action-continue"
            />
        );
    };

    return (
        <div data-testid="exec-pickup-details-page" className="px-5 pt-6 pb-32">
            <Link
                to="/executive/pickups"
                data-testid="exec-details-back"
                className="inline-flex items-center gap-1.5 text-sm text-[#596155]"
            >
                <ArrowLeft size={14} /> All pickups
            </Link>

            <header className="mt-5 flex items-start justify-between gap-3">
                <div>
                    <p
                        data-testid="exec-details-booking-id"
                        className="font-mono-label text-[10px] text-[#596155]"
                    >
                        [ booking · {pickup.id} ]
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-black tracking-tighter text-[#121710]">
                        {pickup.customer.name}
                    </h1>
                    <p className="mt-1 text-sm text-[#596155]">
                        {format(parseISO(pickup.scheduledFor), "EEE, d MMM")} ·{" "}
                        {pickup.slot}
                    </p>
                </div>
                <ExecStatusBadge status={pickup.status} size="lg" />
            </header>

            {/* Contact + Directions row */}
            <section
                data-testid="exec-details-contact"
                className="mt-6 grid grid-cols-2 gap-3"
            >
                <a
                    href={`tel:${pickup.customer.phone}`}
                    data-testid="exec-details-call-btn"
                    className="rounded-sm border border-[#284226] bg-white p-4 hover:bg-[#284226] hover:text-[#F7F5F0] transition-colors"
                >
                    <Phone size={16} />
                    <p className="mt-2 font-display text-base font-bold tracking-tight">
                        Call customer
                    </p>
                    <p className="mt-0.5 text-[11px] opacity-70">
                        {pickup.customer.phone}
                    </p>
                </a>
                <a
                    href={directionsHref}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="exec-details-directions-btn"
                    className="rounded-sm border border-[#284226] bg-white p-4 hover:bg-[#284226] hover:text-[#F7F5F0] transition-colors"
                >
                    <Navigation size={16} />
                    <p className="mt-2 font-display text-base font-bold tracking-tight">
                        Directions
                    </p>
                    <p className="mt-0.5 text-[11px] opacity-70">
                        Open in Maps
                    </p>
                </a>
            </section>

            {/* Address */}
            <section
                data-testid="exec-details-address"
                className="mt-4 rounded-sm border border-[#D1CDBC] bg-white p-5"
            >
                <p className="font-mono-label text-[10px] text-[#596155]">
                    Pickup address
                </p>
                <p className="mt-2 font-display text-base font-bold tracking-tight text-[#121710]">
                    {pickup.address.label}
                </p>
                <p className="mt-1 text-sm text-[#596155]">
                    {pickup.address.line1}, {pickup.address.city} —{" "}
                    {pickup.address.pincode}
                </p>
            </section>

            {/* Notes */}
            <section
                data-testid="exec-details-notes"
                className="mt-4 rounded-sm border border-[#D1CDBC] bg-white p-5"
            >
                <div className="flex items-center gap-2">
                    <StickyNote size={14} className="text-[#284226]" />
                    <p className="font-mono-label text-[10px] text-[#596155]">
                        Notes from customer
                    </p>
                </div>
                <p className="mt-3 text-sm text-[#121710] leading-relaxed">
                    {pickup.notes || (
                        <span className="italic text-[#596155]">
                            No notes were added.
                        </span>
                    )}
                </p>
            </section>

            {/* Customer images */}
            {pickup.customerImages && pickup.customerImages.length > 0 && (
                <section
                    data-testid="exec-details-customer-images"
                    className="mt-4 rounded-sm border border-[#D1CDBC] bg-white p-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <ImageIcon size={14} className="text-[#284226]" />
                        <p className="font-mono-label text-[10px] text-[#596155]">
                            Customer photos
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {pickup.customerImages.map((img, i) => (
                            <img
                                key={i}
                                src={img.url}
                                alt={img.name || `customer-${i}`}
                                className="h-28 w-full object-cover rounded-sm border border-[#D1CDBC]"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Timeline */}
            <section
                data-testid="exec-details-timeline"
                className="mt-4 rounded-sm border border-[#D1CDBC] bg-white p-5"
            >
                <p className="font-mono-label text-[10px] text-[#596155] mb-4">
                    Status timeline
                </p>
                <ExecTimeline pickup={pickup} />
            </section>

            {renderAction()}
        </div>
    );
};

const ExecTimeline = ({ pickup }) => {
    const eventByKey = (pickup.timeline || []).reduce(
        (m, e) => ({ ...m, [e.key]: e }),
        {}
    );
    const currentIdx = STATUS_ORDER.indexOf(pickup.status);
    return (
        <ol className="space-y-0" data-testid="exec-timeline">
            {STATUS_ORDER.map((key, idx) => {
                const done = idx < currentIdx;
                const current = idx === currentIdx;
                const event = eventByKey[key];
                const meta = EXEC_STATUS[key];
                const last = idx === STATUS_ORDER.length - 1;
                return (
                    <li
                        key={key}
                        data-testid={`exec-timeline-${key}`}
                        data-state={
                            done ? "done" : current ? "current" : "upcoming"
                        }
                        className="relative flex gap-4 pb-5 last:pb-0"
                    >
                        {!last && (
                            <span
                                aria-hidden
                                className={`absolute left-[11px] top-7 bottom-0 w-px ${
                                    done ? "bg-[#284226]" : "bg-[#D1CDBC]"
                                }`}
                            />
                        )}
                        <span
                            className={`relative z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                                done
                                    ? "bg-[#284226] text-[#F7F5F0]"
                                    : current
                                      ? "bg-[#C45B38] text-[#F7F5F0] ring-4 ring-[#C45B38]/30 animate-pulse"
                                      : "bg-[#F7F5F0] text-[#596155] border border-[#D1CDBC]"
                            }`}
                        >
                            {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-baseline justify-between gap-2">
                                <p
                                    className={`text-sm ${
                                        current
                                            ? "font-semibold text-[#121710]"
                                            : done
                                              ? "text-[#121710]"
                                              : "text-[#596155]"
                                    }`}
                                >
                                    {meta.label}
                                </p>
                                {event?.at && (
                                    <p className="font-mono-label text-[10px] text-[#596155]">
                                        {format(
                                            parseISO(event.at),
                                            "d MMM · HH:mm"
                                        )}
                                    </p>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-[#596155]">
                                {STATUS_DESCRIPTION[key]}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

const ActionBar = ({ label, confirmLabel, icon, tone, onConfirm, testId }) => {
    return (
        <div className="fixed inset-x-0 bottom-20 z-30 px-5">
            <div className="mx-auto max-w-md">
                <SwipeToConfirm
                    key={testId}
                    label={label}
                    confirmLabel={confirmLabel}
                    icon={icon}
                    tone={tone || "primary"}
                    onConfirm={onConfirm}
                    testId={testId}
                />
            </div>
        </div>
    );
};

export default ExecutivePickupDetails;
