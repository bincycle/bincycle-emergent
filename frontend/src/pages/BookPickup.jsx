import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    UploadCloud,
    X,
    Check,
    ArrowRight,
    Image as ImageIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { savedAddresses, timeSlots, mockUser } from "@/lib/mockData";

const today = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const maxDate = () => {
    const d = today();
    d.setDate(d.getDate() + 6); // 7-day window inclusive
    return d;
};

const BookPickup = () => {
    const [date, setDate] = useState(undefined);
    const [slotId, setSlotId] = useState(null);
    const [addressId, setAddressId] = useState("");
    const [notes, setNotes] = useState("");
    const [image, setImage] = useState(null); // {file, url}
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const min = useMemo(() => today(), []);
    const max = useMemo(() => maxDate(), []);

    const selectedAddress = savedAddresses.find((a) => a.id === addressId);
    const selectedSlot = timeSlots.find((s) => s.id === slotId);

    const onImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large — please keep it under 5 MB.");
            return;
        }
        setImage({ file, url: URL.createObjectURL(file) });
    };

    const clearImage = () => {
        if (image?.url) URL.revokeObjectURL(image.url);
        setImage(null);
    };

    const canSubmit = date && slotId && addressId;

    const onSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) {
            toast.error(
                "Please pick a date, a time slot and a saved address before booking."
            );
            return;
        }
        setConfirmOpen(true);
    };

    const confirmBooking = () => {
        setConfirmOpen(false);
        setSubmitted(true);
        toast.success(
            `Pickup confirmed for ${format(date, "EEE, d MMM")} · ${selectedSlot.range}`
        );
    };

    const resetForm = () => {
        setDate(undefined);
        setSlotId(null);
        setAddressId("");
        setNotes("");
        clearImage();
        setSubmitted(false);
    };

    // Success state
    if (submitted) {
        return (
            <div
                data-testid="booking-success"
                className="px-5 sm:px-10 lg:px-14 py-10 lg:py-16 max-w-3xl"
            >
                <div className="rounded-sm border border-[#284226] bg-[#284226] text-[#F7F5F0] p-8 sm:p-12">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#C45B38]">
                        <Check size={26} />
                    </div>
                    <p className="mt-6 font-mono-label text-xs text-[#F7F5F0]/70">
                        Booking #BC-{Math.floor(Math.random() * 9000) + 1000}
                    </p>
                    <h2 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl">
                        Pickup confirmed.
                    </h2>
                    <p className="mt-5 max-w-md text-[#F7F5F0]/80 leading-relaxed">
                        Our partner will arrive on{" "}
                        <span className="text-[#F7F5F0] font-medium">
                            {format(date, "EEEE, d MMMM")}
                        </span>{" "}
                        between{" "}
                        <span className="text-[#F7F5F0] font-medium">
                            {selectedSlot.range}
                        </span>{" "}
                        at{" "}
                        <span className="text-[#F7F5F0] font-medium">
                            {selectedAddress.label}
                        </span>
                        . You'll get an SMS with the partner's name 30 minutes
                        before arrival.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={resetForm}
                            data-testid="booking-new-btn"
                            className="inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-5 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                        >
                            Book another pickup
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="book-pickup-page"
            className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12"
        >
            {/* Header */}
            <header className="flex items-start justify-between gap-6 mb-10">
                <div>
                    <p className="font-mono-label text-xs text-[#596155]">
                        [ dashboard · new booking ]
                    </p>
                    <h1 className="mt-3 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                        Schedule a pickup
                    </h1>
                    <p className="mt-3 text-[#596155] max-w-2xl">
                        Hi {mockUser.name.split(" ")[0]} — pick a day in the
                        next week, choose a 2-hour slot, and we'll handle the
                        rest.
                    </p>
                </div>
            </header>

            <form
                onSubmit={onSubmit}
                className="grid gap-8 lg:grid-cols-12 lg:gap-10"
            >
                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Address */}
                    <section className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <MapPin size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                01 · Pickup address
                            </p>
                        </div>
                        <Label className="sr-only">Pickup address</Label>
                        <Select
                            value={addressId}
                            onValueChange={setAddressId}
                        >
                            <SelectTrigger
                                data-testid="address-select-trigger"
                                className="h-14 rounded-sm border-[#D1CDBC] bg-[#F7F5F0] focus:ring-[#284226] text-base"
                            >
                                <SelectValue placeholder="Choose a saved address" />
                            </SelectTrigger>
                            <SelectContent className="rounded-sm">
                                {savedAddresses.map((a) => (
                                    <SelectItem
                                        key={a.id}
                                        value={a.id}
                                        data-testid={`address-option-${a.id}`}
                                        className="py-3"
                                    >
                                        <div>
                                            <p className="font-medium text-[#121710]">
                                                {a.label}
                                            </p>
                                            <p className="text-xs text-[#596155]">
                                                {a.line1}, {a.city} —{" "}
                                                {a.pincode}
                                            </p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedAddress && (
                            <p
                                className="mt-3 text-sm text-[#596155]"
                                data-testid="address-selected-preview"
                            >
                                {selectedAddress.line1},{" "}
                                {selectedAddress.city} —{" "}
                                {selectedAddress.pincode}
                            </p>
                        )}
                    </section>

                    {/* Date */}
                    <section className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <CalendarIcon size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                02 · Pickup date
                            </p>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    data-testid="date-picker-trigger"
                                    className="flex h-14 w-full items-center justify-between rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] px-4 text-left text-base text-[#121710] hover:bg-[#EDE9DC] focus:outline-none focus:ring-2 focus:ring-[#284226]"
                                >
                                    {date
                                        ? format(date, "EEEE, d MMMM yyyy")
                                        : "Pick a date in the next 7 days"}
                                    <CalendarIcon
                                        size={18}
                                        className="text-[#596155]"
                                    />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 rounded-sm border-[#D1CDBC]"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    fromDate={min}
                                    toDate={max}
                                    disabled={(d) => d < min || d > max}
                                    initialFocus
                                    data-testid="date-picker-calendar"
                                />
                            </PopoverContent>
                        </Popover>

                        <p className="mt-3 text-xs text-[#596155]">
                            Bookings open for the next 7 days. Need something
                            further out?{" "}
                            <span className="text-[#C45B38]">
                                Switch to a Weekly plan.
                            </span>
                        </p>
                    </section>

                    {/* Time Slot */}
                    <section className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <Clock size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                03 · Time slot
                            </p>
                        </div>
                        <div
                            role="radiogroup"
                            data-testid="timeslot-group"
                            className="grid grid-cols-2 md:grid-cols-3 gap-3"
                        >
                            {timeSlots.map((s) => {
                                const active = s.id === slotId;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        data-testid={`timeslot-${s.id}`}
                                        onClick={() => setSlotId(s.id)}
                                        className={`rounded-sm border p-4 text-left transition-all ${
                                            active
                                                ? "border-[#284226] bg-[#284226] text-[#F7F5F0]"
                                                : "border-[#D1CDBC] bg-[#F7F5F0] text-[#121710] hover:border-[#284226]"
                                        }`}
                                    >
                                        <p className="font-display text-base font-bold tracking-tight">
                                            {s.range}
                                        </p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                active
                                                    ? "text-[#F7F5F0]/70"
                                                    : "text-[#596155]"
                                            }`}
                                        >
                                            {s.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Notes + Image */}
                    <section className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <ImageIcon size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                04 · Notes & photo (optional)
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <Label
                                    htmlFor="notes"
                                    className="text-xs font-mono-label text-[#596155]"
                                >
                                    Additional notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    data-testid="notes-textarea"
                                    rows={5}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Gate code, e-waste mixed in, leave bags by the side gate..."
                                    className="mt-2 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-mono-label text-[#596155]">
                                    Photo of the pickup
                                </Label>
                                {image ? (
                                    <div
                                        className="mt-2 relative rounded-sm border border-[#D1CDBC] overflow-hidden"
                                        data-testid="image-preview"
                                    >
                                        <img
                                            src={image.url}
                                            alt="Upload preview"
                                            className="h-44 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            data-testid="image-clear-btn"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 inline-flex items-center justify-center rounded-sm bg-[#121710]/90 text-[#F7F5F0] p-1.5 hover:bg-[#C45B38]"
                                            aria-label="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="image"
                                        data-testid="image-upload-label"
                                        className="mt-2 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D1CDBC] bg-[#F7F5F0] text-center transition-colors hover:border-[#284226] hover:bg-[#EDE9DC]"
                                    >
                                        <UploadCloud
                                            size={24}
                                            className="text-[#596155]"
                                        />
                                        <p className="mt-2 text-sm text-[#121710] font-medium">
                                            Drop image or click to browse
                                        </p>
                                        <p className="text-xs text-[#596155]">
                                            PNG / JPG, up to 5 MB
                                        </p>
                                        <input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={onImage}
                                            data-testid="image-input"
                                            className="sr-only"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT SUMMARY */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-8 rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-6 sm:p-8">
                        <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                            Booking summary
                        </p>
                        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                            On-demand pickup
                        </h3>

                        <dl className="mt-7 space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-[#F7F5F0]/60">
                                    Address
                                </dt>
                                <dd
                                    className="text-sm text-right max-w-[60%]"
                                    data-testid="summary-address"
                                >
                                    {selectedAddress
                                        ? `${selectedAddress.label} · ${selectedAddress.city}`
                                        : "—"}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-[#F7F5F0]/60">
                                    Date
                                </dt>
                                <dd
                                    className="text-sm text-right"
                                    data-testid="summary-date"
                                >
                                    {date ? format(date, "EEE, d MMM") : "—"}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-[#F7F5F0]/60">
                                    Slot
                                </dt>
                                <dd
                                    className="text-sm text-right"
                                    data-testid="summary-slot"
                                >
                                    {selectedSlot ? selectedSlot.range : "—"}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-[#F7F5F0]/60">
                                    Photo
                                </dt>
                                <dd
                                    className="text-sm text-right"
                                    data-testid="summary-photo"
                                >
                                    {image ? "Attached" : "—"}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-8 border-t border-[#F7F5F0]/15 pt-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                        Pickup fee
                                    </p>
                                    <p className="font-display text-3xl font-black tracking-tight">
                                        ₹149
                                    </p>
                                </div>
                                <p className="text-xs text-[#F7F5F0]/60">
                                    GST included
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            data-testid="book-submit-btn"
                            disabled={!canSubmit}
                            className={`mt-7 w-full inline-flex items-center justify-center gap-2 rounded-sm px-5 py-4 text-sm font-medium transition-colors ${
                                canSubmit
                                    ? "bg-[#C45B38] text-[#F7F5F0] hover:bg-[#A64A2B]"
                                    : "bg-[#F7F5F0]/10 text-[#F7F5F0]/40 cursor-not-allowed"
                            }`}
                        >
                            Review & confirm pickup
                            <ArrowRight size={16} />
                        </button>
                        <p className="mt-3 text-[11px] leading-relaxed text-[#F7F5F0]/50">
                            You won't be charged until our partner arrives.
                            Cancel anytime before the slot opens.
                        </p>
                    </div>
                </aside>
            </form>

            {/* Confirmation dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent
                    data-testid="booking-confirm-dialog"
                    className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md"
                >
                    <DialogHeader>
                        <p className="font-mono-label text-xs text-[#596155]">
                            Confirm booking
                        </p>
                        <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                            Ready to lock this in?
                        </DialogTitle>
                        <DialogDescription className="text-[#596155]">
                            Please review the details before we dispatch a
                            partner.
                        </DialogDescription>
                    </DialogHeader>

                    <dl className="space-y-3 text-sm border-y border-[#D1CDBC] py-4">
                        <div className="flex justify-between gap-4">
                            <dt className="text-[#596155]">Address</dt>
                            <dd className="text-right text-[#121710] max-w-[60%]">
                                {selectedAddress?.label} ·{" "}
                                {selectedAddress?.line1}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#596155]">Date</dt>
                            <dd className="text-[#121710]">
                                {date && format(date, "EEEE, d MMM")}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#596155]">Slot</dt>
                            <dd className="text-[#121710]">
                                {selectedSlot?.range}
                            </dd>
                        </div>
                        {notes && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-[#596155]">Notes</dt>
                                <dd className="text-right text-[#121710] max-w-[60%] truncate">
                                    {notes}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <DialogFooter className="flex-row gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirmOpen(false)}
                            data-testid="confirm-cancel-btn"
                            className="flex-1 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={confirmBooking}
                            data-testid="confirm-book-btn"
                            className="flex-1 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
                        >
                            Confirm pickup
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookPickup;
