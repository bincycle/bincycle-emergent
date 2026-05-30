import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    UploadCloud,
    X,
    Check,
    QrCode,
    Banknote,
    Loader2,
    Sparkles,
    Receipt,
    Scale,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    findPickup,
    advanceStatus,
    updatePickup,
    ITEM_CATEGORIES,
    computePricing,
} from "@/lib/executiveMock";
import { fileToDataUrl } from "@/lib/bookingPersistence";

const STEPS = [
    { id: "items", label: "Items" },
    { id: "photos", label: "Photos" },
    { id: "pricing", label: "Pricing" },
    { id: "payment", label: "Payment" },
    { id: "done", label: "Done" },
];

const newItem = () => ({
    id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: "",
    weight: "",
    qty: "",
    notes: "",
});

const ExecutiveCompletePickup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pickup, setPickup] = useState(() => findPickup(id));

    const [items, setItems] = useState(() =>
        pickup?.items?.length ? pickup.items : [newItem()]
    );
    const [photos, setPhotos] = useState(() => pickup?.photos || []);
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [cashReceived, setCashReceived] = useState("");
    const [step, setStep] = useState("items");
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const pricing = useMemo(
        () =>
            computePricing(
                items.map((it) => ({
                    category: it.category,
                    weight: parseFloat(it.weight) || 0,
                    qty: it.qty,
                    notes: it.notes,
                }))
            ),
        [items]
    );

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

    const updateItem = (idx, patch) =>
        setItems((prev) =>
            prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
        );
    const addItem = () => setItems((prev) => [...prev, newItem()]);
    const removeItem = (idx) =>
        setItems((prev) =>
            prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
        );

    const pickPhotos = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const room = 6 - photos.length;
        const accepted = files.slice(0, Math.max(0, room));
        const next = [];
        for (const file of accepted) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is over 5 MB — skipped.`);
                continue;
            }
            try {
                const url = await fileToDataUrl(file);
                next.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url,
                });
            } catch {}
        }
        setPhotos((prev) => [...prev, ...next]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const removePhoto = (i) =>
        setPhotos((prev) => prev.filter((_, idx) => idx !== i));

    const validItems = items.filter(
        (it) => it.category && parseFloat(it.weight) > 0
    );

    const goNext = () => {
        if (step === "items") {
            if (!validItems.length) {
                toast.error("Add at least one item with category and weight.");
                return;
            }
            setItems(validItems); // drop empty drafts
            setStep("photos");
        } else if (step === "photos") {
            setStep("pricing");
        } else if (step === "pricing") {
            setStep("payment");
            advanceStatus(id, "payment_pending", {
                items: pricing.rows.map(({ subtotal, label, rate, ...rest }) => rest),
            });
        } else if (step === "payment") {
            confirm();
        }
    };
    const goBack = () => {
        const idx = STEPS.findIndex((s) => s.id === step);
        if (idx > 0) setStep(STEPS[idx - 1].id);
    };

    const confirm = () => {
        if (paymentMethod === "cash") {
            const got = parseFloat(cashReceived);
            if (!got || got < pricing.total) {
                toast.error(`Collect at least ₹${pricing.total} in cash.`);
                return;
            }
        }
        setSubmitting(true);
        setTimeout(() => {
            const updated = advanceStatus(id, "completed", {
                payment: {
                    method: paymentMethod,
                    amount: pricing.total,
                    cashReceived:
                        paymentMethod === "cash"
                            ? parseFloat(cashReceived)
                            : null,
                    collectedAt: new Date().toISOString(),
                },
                photos,
            });
            updatePickup(id, { items: validItems });
            setPickup(updated);
            setSubmitting(false);
            setStep("done");
        }, 700);
    };

    const stepIdx = STEPS.findIndex((s) => s.id === step);

    return (
        <div data-testid="exec-complete-page" className="px-5 pt-6 pb-32">
            <Link
                to={`/executive/pickups/${id}`}
                data-testid="exec-complete-back"
                className="inline-flex items-center gap-1.5 text-sm text-[#596155]"
            >
                <ArrowLeft size={14} /> Pickup details
            </Link>

            <header className="mt-5">
                <p className="font-mono-label text-[10px] text-[#596155]">
                    [ complete · {pickup.id} ]
                </p>
                <h1 className="mt-2 font-display text-3xl font-black tracking-tighter text-[#121710]">
                    {step === "done" ? "All done." : "Complete pickup"}
                </h1>
                <p className="mt-1 text-sm text-[#596155]">
                    Customer:{" "}
                    <span className="text-[#121710] font-medium">
                        {pickup.customer.name}
                    </span>
                </p>
            </header>

            {/* Stepper */}
            <ol
                data-testid="exec-stepper"
                className="mt-6 grid grid-cols-5 gap-1.5"
            >
                {STEPS.map((s, i) => {
                    const done = i < stepIdx;
                    const current = i === stepIdx;
                    return (
                        <li
                            key={s.id}
                            data-testid={`exec-step-${s.id}`}
                            data-state={
                                done ? "done" : current ? "current" : "upcoming"
                            }
                            className="flex flex-col items-center gap-1"
                        >
                            <span
                                className={`h-1.5 w-full rounded-sm ${
                                    done
                                        ? "bg-[#284226]"
                                        : current
                                          ? "bg-[#C45B38]"
                                          : "bg-[#D1CDBC]"
                                }`}
                            />
                            <span
                                className={`font-mono-label text-[9px] ${
                                    current
                                        ? "text-[#C45B38]"
                                        : done
                                          ? "text-[#284226]"
                                          : "text-[#596155]"
                                }`}
                            >
                                {s.label}
                            </span>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-6 space-y-4">
                {step === "items" && (
                    <section data-testid="exec-step-items-section">
                        <p className="font-mono-label text-[10px] text-[#596155] mb-3">
                            Collected items
                        </p>
                        <ul className="space-y-3">
                            {items.map((it, idx) => (
                                <li
                                    key={it.id}
                                    data-testid={`exec-item-${idx}`}
                                    className="rounded-sm border border-[#D1CDBC] bg-white p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-mono-label text-[10px] text-[#596155]">
                                            Item {idx + 1}
                                        </p>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                data-testid={`exec-item-remove-${idx}`}
                                                aria-label="Remove item"
                                                className="rounded-sm p-1.5 text-[#C45B38] hover:bg-[#C45B38]/10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <Label className="font-mono-label text-[9px] text-[#596155]">
                                        Category
                                    </Label>
                                    <Select
                                        value={it.category}
                                        onValueChange={(v) =>
                                            updateItem(idx, { category: v })
                                        }
                                    >
                                        <SelectTrigger
                                            data-testid={`exec-item-category-${idx}`}
                                            className="mt-1 h-12 rounded-sm border-[#D1CDBC] bg-[#F7F5F0]"
                                        >
                                            <SelectValue placeholder="Choose category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ITEM_CATEGORIES.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id}
                                                >
                                                    {c.label} · ₹{c.rate}/kg
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="font-mono-label text-[9px] text-[#596155]">
                                                Weight (kg)
                                            </Label>
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                step="0.1"
                                                min="0"
                                                value={it.weight}
                                                onChange={(e) =>
                                                    updateItem(idx, {
                                                        weight: e.target.value,
                                                    })
                                                }
                                                data-testid={`exec-item-weight-${idx}`}
                                                placeholder="0.0"
                                                className="mt-1 h-12 rounded-sm border-[#D1CDBC] bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="font-mono-label text-[9px] text-[#596155]">
                                                Qty (optional)
                                            </Label>
                                            <Input
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                value={it.qty}
                                                onChange={(e) =>
                                                    updateItem(idx, {
                                                        qty: e.target.value,
                                                    })
                                                }
                                                data-testid={`exec-item-qty-${idx}`}
                                                placeholder="2"
                                                className="mt-1 h-12 rounded-sm border-[#D1CDBC] bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Label className="font-mono-label text-[9px] text-[#596155]">
                                            Notes (optional)
                                        </Label>
                                        <Input
                                            value={it.notes}
                                            onChange={(e) =>
                                                updateItem(idx, {
                                                    notes: e.target.value,
                                                })
                                            }
                                            data-testid={`exec-item-notes-${idx}`}
                                            placeholder="e.g. mostly cartons"
                                            className="mt-1 h-12 rounded-sm border-[#D1CDBC] bg-white"
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={addItem}
                            data-testid="exec-item-add-btn"
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-[#D1CDBC] bg-white px-4 py-3.5 text-sm font-medium text-[#596155] hover:border-[#284226] hover:text-[#284226] transition-colors"
                        >
                            <Plus size={14} /> Add another item
                        </button>
                    </section>
                )}

                {step === "photos" && (
                    <section data-testid="exec-step-photos-section">
                        <p className="font-mono-label text-[10px] text-[#596155] mb-3">
                            Proof photos
                        </p>
                        {photos.length > 0 && (
                            <div
                                data-testid="exec-photos-grid"
                                className="grid grid-cols-3 gap-2 mb-3"
                            >
                                {photos.map((p, i) => (
                                    <div
                                        key={i}
                                        data-testid={`exec-photo-${i}`}
                                        className="group relative overflow-hidden rounded-sm border border-[#D1CDBC]"
                                    >
                                        <img
                                            src={p.url}
                                            alt={p.name}
                                            className="h-24 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            data-testid={`exec-photo-remove-${i}`}
                                            aria-label="Remove photo"
                                            className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[#171A15]/85 text-[#F7F5F0] hover:bg-[#C45B38]"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {photos.length < 6 && (
                            <label
                                htmlFor="exec-photos"
                                data-testid="exec-photos-upload"
                                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#D1CDBC] bg-white text-center hover:border-[#284226]"
                            >
                                <UploadCloud
                                    size={22}
                                    className="text-[#596155]"
                                />
                                <p className="mt-2 text-sm text-[#121710] font-medium">
                                    {photos.length === 0
                                        ? "Tap to add proof photos"
                                        : "Add more"}
                                </p>
                                <p className="text-xs text-[#596155]">
                                    Up to 6 · 5 MB each
                                </p>
                                <input
                                    id="exec-photos"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={pickPhotos}
                                    className="sr-only"
                                />
                            </label>
                        )}
                    </section>
                )}

                {step === "pricing" && (
                    <section data-testid="exec-step-pricing-section">
                        <p className="font-mono-label text-[10px] text-[#596155] mb-3">
                            Pricing summary
                        </p>
                        <div className="rounded-sm border border-[#D1CDBC] bg-white p-5">
                            <ul className="divide-y divide-[#D1CDBC]">
                                {pricing.rows.map((r, i) => (
                                    <li
                                        key={i}
                                        data-testid={`exec-pricing-row-${i}`}
                                        className="flex items-center justify-between py-3 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[#121710] font-medium">
                                                {r.label}
                                            </p>
                                            <p className="text-xs text-[#596155]">
                                                {r.weight} kg × ₹{r.rate}/kg
                                            </p>
                                        </div>
                                        <p className="text-[#121710] font-semibold">
                                            ₹{r.subtotal}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 border-t border-[#D1CDBC] pt-4 flex items-center justify-between">
                                <div>
                                    <p className="font-mono-label text-[10px] text-[#596155]">
                                        Total weight
                                    </p>
                                    <p className="font-display text-base font-bold text-[#121710] flex items-center gap-1">
                                        <Scale size={14} /> {pricing.totalWeight}{" "}
                                        kg
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono-label text-[10px] text-[#596155]">
                                        Amount to collect
                                    </p>
                                    <p
                                        data-testid="exec-pricing-total"
                                        className="font-display text-3xl font-black tracking-tighter text-[#284226]"
                                    >
                                        ₹{pricing.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {step === "payment" && (
                    <section
                        data-testid="exec-step-payment-section"
                        className="space-y-4"
                    >
                        <p className="font-mono-label text-[10px] text-[#596155]">
                            Collect payment
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: "upi", label: "UPI QR", icon: QrCode },
                                { id: "cash", label: "Cash", icon: Banknote },
                            ].map((m) => {
                                const Icon = m.icon;
                                const active = paymentMethod === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.id)}
                                        data-testid={`exec-payment-method-${m.id}`}
                                        className={`flex flex-col items-center gap-2 rounded-sm border p-4 transition-all ${
                                            active
                                                ? "border-[#284226] bg-[#284226] text-[#F7F5F0]"
                                                : "border-[#D1CDBC] bg-white text-[#121710]"
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <p className="font-display text-sm font-bold tracking-tight">
                                            {m.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "upi" ? (
                            <div
                                data-testid="exec-upi-panel"
                                className="rounded-sm border border-[#D1CDBC] bg-white p-5 text-center"
                            >
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Ask customer to scan
                                </p>
                                <div className="mt-4 mx-auto inline-block rounded-sm border-2 border-[#D1CDBC] p-3 bg-white">
                                    <QrPlaceholder
                                        amount={pricing.total}
                                        bookingId={pickup.id}
                                    />
                                </div>
                                <p className="mt-4 text-sm text-[#596155]">
                                    Amount to collect
                                </p>
                                <p className="font-display text-4xl font-black tracking-tighter text-[#284226]">
                                    ₹{pricing.total}
                                </p>
                            </div>
                        ) : (
                            <div
                                data-testid="exec-cash-panel"
                                className="rounded-sm border border-[#D1CDBC] bg-white p-5"
                            >
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Amount to collect
                                </p>
                                <p className="font-display text-4xl font-black tracking-tighter text-[#284226] mt-1">
                                    ₹{pricing.total}
                                </p>
                                <Label className="mt-5 block font-mono-label text-[10px] text-[#596155]">
                                    Cash received
                                </Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={cashReceived}
                                    onChange={(e) =>
                                        setCashReceived(e.target.value)
                                    }
                                    data-testid="exec-cash-received"
                                    placeholder={`${pricing.total}`}
                                    className="mt-2 h-14 rounded-sm border-[#D1CDBC] bg-[#F7F5F0] text-2xl font-display"
                                />
                                {parseFloat(cashReceived) > pricing.total && (
                                    <p className="mt-2 text-xs text-[#596155]">
                                        Return change:{" "}
                                        <span className="text-[#121710] font-medium">
                                            ₹
                                            {parseFloat(cashReceived) -
                                                pricing.total}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {step === "done" && (
                    <section
                        data-testid="exec-step-done-section"
                        className="space-y-4"
                    >
                        <div className="rounded-sm border border-[#284226] bg-[#284226] text-[#F7F5F0] p-5 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C45B38]">
                                <Check size={20} />
                            </div>
                            <p className="mt-4 font-display text-2xl font-black tracking-tighter">
                                Pickup completed.
                            </p>
                            <p className="mt-1 text-sm text-[#F7F5F0]/80">
                                {pickup.id} ·{" "}
                                {format(new Date(), "d MMM · HH:mm")}
                            </p>
                        </div>

                        <div
                            data-testid="exec-receipt"
                            className="rounded-sm border border-[#D1CDBC] bg-white p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Receipt
                                </p>
                                <Receipt
                                    size={14}
                                    className="text-[#284226]"
                                />
                            </div>
                            <p className="font-display text-lg font-bold tracking-tight text-[#121710]">
                                {pickup.customer.name}
                            </p>
                            <p className="text-xs text-[#596155]">
                                {pickup.address.line1}, {pickup.address.city}
                            </p>
                            <ul className="mt-4 divide-y divide-[#D1CDBC]">
                                {pricing.rows.map((r, i) => (
                                    <li
                                        key={i}
                                        className="flex justify-between py-2 text-sm"
                                    >
                                        <span className="text-[#596155]">
                                            {r.label} · {r.weight}kg
                                        </span>
                                        <span className="text-[#121710]">
                                            ₹{r.subtotal}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 border-t border-[#D1CDBC] pt-4 flex items-center justify-between">
                                <p className="font-mono-label text-[10px] text-[#596155]">
                                    Paid via{" "}
                                    {paymentMethod === "upi" ? "UPI" : "Cash"}
                                </p>
                                <p className="font-display text-2xl font-black tracking-tighter text-[#284226]">
                                    ₹{pricing.total}
                                </p>
                            </div>
                            <p className="mt-3 inline-flex items-center gap-1 font-mono-label text-[10px] text-[#284226]">
                                <Sparkles size={10} /> Thanks for recycling
                                with Bincycle.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to="/executive/pickups"
                                data-testid="exec-receipt-back-list"
                                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#121710] px-4 py-3 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0]"
                            >
                                All pickups
                            </Link>
                            <Link
                                to="/executive"
                                data-testid="exec-receipt-home"
                                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A]"
                            >
                                Dashboard <ArrowRight size={14} />
                            </Link>
                        </div>
                    </section>
                )}
            </div>

            {step !== "done" && (
                <div className="fixed inset-x-0 bottom-20 z-30 px-5">
                    <div className="mx-auto max-w-md flex gap-2">
                        {stepIdx > 0 && (
                            <button
                                type="button"
                                onClick={goBack}
                                data-testid="exec-step-back"
                                className="rounded-sm border border-[#D1CDBC] bg-white px-4 py-3.5 text-sm font-medium text-[#596155] hover:border-[#121710] hover:text-[#121710]"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={submitting}
                            data-testid="exec-step-next"
                            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#C45B38] text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] disabled:opacity-60 shadow-lg shadow-black/20"
                        >
                            {submitting ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Finalising...
                                </>
                            ) : step === "payment" ? (
                                <>
                                    <Check size={14} /> Mark payment received
                                </>
                            ) : (
                                <>
                                    Continue <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Decorative QR (visual placeholder) — a 9x9 noise pattern derived from the
// booking id + amount so it's stable for a given pickup.
const QrPlaceholder = ({ amount, bookingId }) => {
    const seed = `${bookingId}-${amount}`;
    const grid = useMemo(() => {
        const cells = [];
        let h = 0;
        for (let i = 0; i < seed.length; i++)
            h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        const rand = () => {
            h = (h * 1103515245 + 12345) >>> 0;
            return ((h >> 8) & 0x7fffffff) / 0x7fffffff;
        };
        for (let r = 0; r < 25; r++) {
            const row = [];
            for (let c = 0; c < 25; c++) {
                // corner finder boxes
                const isCorner =
                    (r < 7 && (c < 7 || c >= 18)) ||
                    (r >= 18 && c < 7);
                if (isCorner) {
                    const ringR = Math.max(
                        Math.abs(r - (r < 7 ? 3 : 21)),
                        Math.abs(c - (c < 7 ? 3 : 21))
                    );
                    row.push(ringR <= 3 && ringR !== 2 ? 1 : 0);
                } else {
                    row.push(rand() > 0.55 ? 1 : 0);
                }
            }
            cells.push(row);
        }
        return cells;
    }, [seed]);
    return (
        <svg
            data-testid="exec-upi-qr"
            viewBox="0 0 25 25"
            className="h-44 w-44"
            aria-label="UPI QR placeholder"
        >
            <rect width="25" height="25" fill="#F7F5F0" />
            {grid.map((row, r) =>
                row.map((v, c) =>
                    v ? (
                        <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#171A15"
                        />
                    ) : null
                )
            )}
        </svg>
    );
};

export default ExecutiveCompletePickup;
