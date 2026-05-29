import { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    UploadCloud,
    X,
    Check,
    ArrowRight,
    Image as ImageIcon,
    StickyNote,
    Sparkles,
    RotateCcw,
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
import {
    loadDraft,
    saveDraft,
    clearDraft,
    fileToDataUrl,
} from "@/lib/bookingPersistence";

const today = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const maxDate = () => {
    const d = today();
    d.setDate(d.getDate() + 6); // 7-day window inclusive of today
    return d;
};

const BookPickup = () => {
    const [date, setDate] = useState(undefined);
    const [slotId, setSlotId] = useState(null);
    const [addressId, setAddressId] = useState("");
    const [notes, setNotes] = useState("");
    const [image, setImage] = useState(null); // { name, type, size, url(dataURL) }
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [dialogStep, setDialogStep] = useState("review"); // 'review' | 'success'
    const [bookingId, setBookingId] = useState(null);
    const [hydrated, setHydrated] = useState(false);

    const min = useMemo(() => today(), []);
    const max = useMemo(() => maxDate(), []);

    const selectedAddress = savedAddresses.find((a) => a.id === addressId);
    const selectedSlot = timeSlots.find((s) => s.id === slotId);

    // --- Hydrate from localStorage on first mount ---
    useEffect(() => {
        const draft = loadDraft();
        if (draft) {
            if (draft.date) {
                const parsed = parseISO(draft.date);
                if (isValid(parsed) && parsed >= min && parsed <= max)
                    setDate(parsed);
            }
            if (draft.slotId) setSlotId(draft.slotId);
            if (draft.addressId) setAddressId(draft.addressId);
            if (typeof draft.notes === "string") setNotes(draft.notes);
            if (draft.image && draft.image.url) setImage(draft.image);
        }
        setHydrated(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Persist on every change (after hydration) ---
    useEffect(() => {
        if (!hydrated) return;
        const empty =
            !date && !slotId && !addressId && !notes && !image;
        if (empty) {
            clearDraft();
            return;
        }
        saveDraft({
            date: date ? date.toISOString() : null,
            slotId,
            addressId,
            notes,
            image,
        });
    }, [date, slotId, addressId, notes, image, hydrated]);

    const fileInputRef = useRef(null);

    const onImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large — please keep it under 5 MB.");
            return;
        }
        try {
            const url = await fileToDataUrl(file);
            setImage({
                name: file.name,
                type: file.type,
                size: file.size,
                url,
            });
        } catch {
            toast.error("Could not read that image. Please try another.");
        }
    };

    const clearImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        setDialogStep("review");
        setConfirmOpen(true);
    };

    const confirmBooking = () => {
        const id = `BC-${Math.floor(Math.random() * 9000) + 1000}`;
        setBookingId(id);
        setDialogStep("success");
        toast.success(
            `Pickup confirmed for ${format(date, "EEE, d MMM")} · ${selectedSlot.range}`
        );
        clearDraft();
    };

    const closeAndReset = () => {
        setConfirmOpen(false);
        // small delay so dialog can animate out before form resets visually
        setTimeout(() => {
            setDate(undefined);
            setSlotId(null);
            setAddressId("");
            setNotes("");
            clearImage();
            setBookingId(null);
            setDialogStep("review");
            clearDraft();
        }, 220);
    };

    const handleDialogChange = (open) => {
        // After successful booking, closing the dialog should also reset.
        if (!open && dialogStep === "success") {
            closeAndReset();
            return;
        }
        setConfirmOpen(open);
    };

    const resetDraft = () => {
        setDate(undefined);
        setSlotId(null);
        setAddressId("");
        setNotes("");
        clearImage();
        clearDraft();
        toast("Draft cleared.");
    };

    return (
        <div
            data-testid="book-pickup-page"
            className="px-5 sm:px-10 lg:px-14 py-8 lg:py-12"
        >
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
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
                        rest. Your progress is saved automatically.
                    </p>
                </div>
                {(date || slotId || addressId || notes || image) && (
                    <button
                        type="button"
                        onClick={resetDraft}
                        data-testid="book-clear-draft-btn"
                        className="self-start inline-flex items-center gap-2 rounded-sm border border-[#D1CDBC] px-3 py-2 text-xs font-medium text-[#596155] hover:border-[#121710] hover:text-[#121710] transition-colors"
                    >
                        <RotateCcw size={14} /> Clear draft
                    </button>
                )}
            </header>

            <form
                onSubmit={onSubmit}
                className="grid gap-8 lg:grid-cols-12 lg:gap-10"
            >
                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 01 · Date */}
                    <section
                        data-testid="section-date"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <CalendarIcon size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                01 · Pickup date
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

                    {/* 02 · Time Slot */}
                    <section
                        data-testid="section-timeslot"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <Clock size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                02 · Time slot
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

                    {/* 03 · Address */}
                    <section
                        data-testid="section-address"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                <MapPin size={14} />
                            </span>
                            <p className="font-mono-label text-xs text-[#596155]">
                                03 · Pickup address
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

                    {/* 04 · Notes (separated from pictures) */}
                    <section
                        data-testid="section-notes"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                    <StickyNote size={14} />
                                </span>
                                <p className="font-mono-label text-xs text-[#596155]">
                                    04 · Additional notes
                                </p>
                            </div>
                            <p className="font-mono-label text-[10px] text-[#596155]">
                                Optional
                            </p>
                        </div>
                        <Label htmlFor="notes" className="sr-only">
                            Additional notes
                        </Label>
                        <Textarea
                            id="notes"
                            data-testid="notes-textarea"
                            rows={4}
                            maxLength={500}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Gate code, e-waste mixed in, leave bags by the side gate..."
                            className="rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                        />
                        <p className="mt-2 text-right text-xs text-[#596155]">
                            {notes.length}/500
                        </p>
                    </section>

                    {/* 05 · Pictures (separated from notes) */}
                    <section
                        data-testid="section-pictures"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-8"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                                    <ImageIcon size={14} />
                                </span>
                                <p className="font-mono-label text-xs text-[#596155]">
                                    05 · Pictures
                                </p>
                            </div>
                            <p className="font-mono-label text-[10px] text-[#596155]">
                                Optional · helps our partner spot the load
                            </p>
                        </div>

                        {image ? (
                            <div
                                className="relative rounded-sm border border-[#D1CDBC] overflow-hidden"
                                data-testid="image-preview"
                            >
                                <img
                                    src={image.url}
                                    alt={image.name || "Upload preview"}
                                    className="h-56 w-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-[#171A15]/85 backdrop-blur-md px-4 py-3 text-[#F7F5F0]">
                                    <p
                                        className="text-xs truncate"
                                        data-testid="image-name"
                                    >
                                        {image.name || "Attached image"}
                                    </p>
                                    <button
                                        type="button"
                                        data-testid="image-clear-btn"
                                        onClick={clearImage}
                                        className="inline-flex items-center gap-1.5 rounded-sm bg-[#C45B38] px-2.5 py-1.5 text-[11px] font-medium hover:bg-[#A64A2B]"
                                    >
                                        <X size={12} /> Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                data-testid="image-upload-label"
                                className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D1CDBC] bg-[#F7F5F0] text-center transition-colors hover:border-[#284226] hover:bg-[#EDE9DC]"
                            >
                                <UploadCloud
                                    size={26}
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
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onImage}
                                    data-testid="image-input"
                                    className="sr-only"
                                />
                            </label>
                        )}
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

            {/* Confirmation / Success dialog */}
            <Dialog open={confirmOpen} onOpenChange={handleDialogChange}>
                <DialogContent
                    data-testid={
                        dialogStep === "success"
                            ? "booking-success-dialog"
                            : "booking-confirm-dialog"
                    }
                    className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] max-w-md p-0 overflow-hidden"
                >
                    {dialogStep === "review" ? (
                        <div className="p-6">
                            <DialogHeader>
                                <p className="font-mono-label text-xs text-[#596155]">
                                    Confirm booking
                                </p>
                                <DialogTitle className="font-display text-2xl font-black tracking-tight text-[#121710]">
                                    Ready to lock this in?
                                </DialogTitle>
                                <DialogDescription className="text-[#596155]">
                                    Please review the details before we
                                    dispatch a partner.
                                </DialogDescription>
                            </DialogHeader>

                            <dl className="mt-5 space-y-3 text-sm border-y border-[#D1CDBC] py-4">
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
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[#596155]">Address</dt>
                                    <dd className="text-right text-[#121710] max-w-[60%]">
                                        {selectedAddress?.label} ·{" "}
                                        {selectedAddress?.line1}
                                    </dd>
                                </div>
                                {notes && (
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-[#596155]">
                                            Notes
                                        </dt>
                                        <dd className="text-right text-[#121710] max-w-[60%] truncate">
                                            {notes}
                                        </dd>
                                    </div>
                                )}
                                {image && (
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-[#596155]">
                                            Photo
                                        </dt>
                                        <dd className="text-right text-[#121710] max-w-[60%] truncate">
                                            {image.name || "Attached"}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            <DialogFooter className="flex-row gap-2 mt-5">
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
                        </div>
                    ) : (
                        // SUCCESS STATE — in same modal
                        <div
                            data-testid="booking-success"
                            className="bg-[#284226] text-[#F7F5F0] p-6 sm:p-8"
                        >
                            <DialogHeader>
                                <DialogDescription className="sr-only">
                                    Your pickup booking has been confirmed.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#C45B38]">
                                <Check size={26} />
                            </div>
                            <p
                                className="mt-6 font-mono-label text-xs text-[#F7F5F0]/70"
                                data-testid="booking-success-id"
                            >
                                Booking #{bookingId}
                            </p>
                            <DialogTitle className="mt-3 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#F7F5F0]">
                                Pickup confirmed.
                            </DialogTitle>
                            <p className="mt-4 text-[#F7F5F0]/80 leading-relaxed">
                                Our partner will arrive on{" "}
                                <span className="text-[#F7F5F0] font-medium">
                                    {date && format(date, "EEEE, d MMMM")}
                                </span>{" "}
                                between{" "}
                                <span className="text-[#F7F5F0] font-medium">
                                    {selectedSlot?.range}
                                </span>{" "}
                                at{" "}
                                <span className="text-[#F7F5F0] font-medium">
                                    {selectedAddress?.label}
                                </span>
                                .
                            </p>

                            <div className="mt-6 rounded-sm bg-[#171A15]/50 border border-[#F7F5F0]/10 p-4">
                                <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                    What happens next
                                </p>
                                <ol className="mt-3 space-y-2 text-sm text-[#F7F5F0]/80">
                                    <li className="flex gap-2">
                                        <Sparkles
                                            size={14}
                                            className="text-[#C45B38] mt-0.5 shrink-0"
                                        />
                                        SMS confirmation sent to your phone now.
                                    </li>
                                    <li className="flex gap-2">
                                        <Sparkles
                                            size={14}
                                            className="text-[#C45B38] mt-0.5 shrink-0"
                                        />
                                        Partner name &amp; live location 30 min
                                        before pickup.
                                    </li>
                                    <li className="flex gap-2">
                                        <Sparkles
                                            size={14}
                                            className="text-[#C45B38] mt-0.5 shrink-0"
                                        />
                                        Receipt with weight &amp; recycling
                                        impact, post-pickup.
                                    </li>
                                </ol>
                            </div>

                            <button
                                type="button"
                                onClick={closeAndReset}
                                data-testid="booking-success-done-btn"
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#C45B38] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                            >
                                Done · book another later
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookPickup;
