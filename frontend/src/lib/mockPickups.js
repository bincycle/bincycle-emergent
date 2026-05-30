// Mock pickup history + helpers + coupons.

const STORE_KEY = "bincycle:pickups";

// status: "scheduled" | "in_progress" | "completed" | "cancelled"
export const seedPickups = [
    {
        id: "BC-8431",
        date: nextDayISO(2),
        slotId: "ts3",
        addressId: "addr_1",
        notes: "Two bags + a small e-waste box. Gate code 4-5-2-1.",
        images: [],
        status: "scheduled",
        createdAt: hoursAgoISO(36),
        fee: 149,
        discount: 0,
        couponCode: null,
    },
    {
        id: "BC-8307",
        date: nextDayISO(0),
        slotId: "ts2",
        addressId: "addr_2",
        notes: "Cardboard only. Lots of it — Diwali aftermath.",
        images: [],
        status: "in_progress",
        createdAt: hoursAgoISO(48),
        fee: 149,
        discount: 20,
        couponCode: "GREEN20",
    },
    {
        id: "BC-7984",
        date: pastDayISO(4),
        slotId: "ts4",
        addressId: "addr_3",
        notes: "Mostly kitchen waste this week.",
        images: [],
        status: "completed",
        createdAt: pastDayISO(5),
        fee: 149,
        discount: 0,
        couponCode: null,
        kgPicked: 6.4,
        co2Saved: 1.8,
    },
    {
        id: "BC-7712",
        date: pastDayISO(11),
        slotId: "ts5",
        addressId: "addr_1",
        notes: "",
        images: [],
        status: "completed",
        createdAt: pastDayISO(12),
        fee: 149,
        discount: 50,
        couponCode: "WELCOME50",
        kgPicked: 9.2,
        co2Saved: 2.7,
    },
    {
        id: "BC-7508",
        date: pastDayISO(18),
        slotId: "ts2",
        addressId: "addr_4",
        notes: "Two large jute bags by main door.",
        images: [],
        status: "completed",
        createdAt: pastDayISO(19),
        fee: 149,
        discount: 0,
        couponCode: null,
        kgPicked: 4.1,
        co2Saved: 1.2,
    },
    {
        id: "BC-7321",
        date: pastDayISO(26),
        slotId: "ts1",
        addressId: "addr_2",
        notes: "",
        images: [],
        status: "cancelled",
        createdAt: pastDayISO(27),
        fee: 149,
        discount: 0,
        couponCode: null,
    },
];

function nextDayISO(daysAhead) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString();
}
function pastDayISO(daysAgo) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
}
function hoursAgoISO(hrs) {
    const d = new Date();
    d.setHours(d.getHours() - hrs);
    return d.toISOString();
}

export const loadUserPickups = () => {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveUserPickup = (pickup) => {
    try {
        const existing = loadUserPickups();
        const next = [pickup, ...existing];
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch (e) {
        console.warn("Could not save pickup:", e?.message);
    }
};

export const loadAllPickups = () => {
    // Newest first by createdAt
    const all = [...loadUserPickups(), ...seedPickups];
    return all.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const findPickupById = (id) =>
    loadAllPickups().find((p) => p.id === id) || null;

// --- Status helpers ---
export const STATUS_META = {
    scheduled: {
        label: "Scheduled",
        dot: "bg-[#284226]",
        chip: "bg-[#284226]/10 text-[#284226] border-[#284226]/30",
    },
    in_progress: {
        label: "In progress",
        dot: "bg-[#C45B38]",
        chip: "bg-[#C45B38]/10 text-[#C45B38] border-[#C45B38]/30",
    },
    completed: {
        label: "Completed",
        dot: "bg-[#596155]",
        chip: "bg-[#596155]/10 text-[#596155] border-[#596155]/40",
    },
    cancelled: {
        label: "Cancelled",
        dot: "bg-[#171A15]",
        chip: "bg-[#171A15]/10 text-[#171A15] border-[#171A15]/30",
    },
};

export const isUpcoming = (p) =>
    p.status === "scheduled" || p.status === "in_progress";
export const isFinished = (p) =>
    p.status === "completed" || p.status === "cancelled";

// --- Coupons ---
export const coupons = [
    {
        code: "WELCOME50",
        description: "50% off your first pickup",
        type: "percent",
        value: 50,
    },
    {
        code: "GREEN20",
        description: "Flat ₹20 off",
        type: "flat",
        value: 20,
    },
    {
        code: "NEWYEAR10",
        description: "10% off your booking",
        type: "percent",
        value: 10,
    },
    {
        code: "FIRSTPICKUP",
        description: "Your first pickup is on us",
        type: "flat",
        value: 149,
    },
];

export const findCoupon = (code) => {
    if (!code) return null;
    return (
        coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ||
        null
    );
};

// ----- Pickup tracking timeline -----
export const computeDiscount = (coupon, baseFee) => {
    if (!coupon) return 0;
    if (coupon.type === "percent") {
        // Math.floor so e.g. 50% off ₹149 → ₹74 discount → clean ₹75 total
        return Math.min(Math.floor((baseFee * coupon.value) / 100), baseFee);
    }
    return Math.min(coupon.value, baseFee);
};

// Returns an ordered list of timeline steps for a given pickup.
// Each step: { key, label, description, at (ISO or null), state: 'done'|'current'|'upcoming'|'cancelled' }
export const getPickupTimeline = (pickup) => {
    if (!pickup) return [];
    const created = pickup.createdAt;
    const scheduled = pickup.date;

    const minutes = (iso, m) => {
        const d = new Date(iso);
        d.setMinutes(d.getMinutes() + m);
        return d.toISOString();
    };
    const hours = (iso, h) => minutes(iso, h * 60);

    if (pickup.status === "cancelled") {
        return [
            {
                key: "scheduled",
                label: "Booking received",
                description: "We received your pickup request.",
                at: created,
                state: "done",
            },
            {
                key: "cancelled",
                label: "Pickup cancelled",
                description:
                    "This pickup was cancelled. No charges were applied.",
                at: hours(created, 2),
                state: "cancelled",
            },
        ];
    }

    const all = [
        {
            key: "scheduled",
            label: "Booking received",
            description: "We received your pickup request.",
            at: created,
        },
        {
            key: "confirmed",
            label: "Booking confirmed",
            description: "Slot locked in and assigned to a route.",
            at: minutes(created, 5),
        },
        {
            key: "driver_assigned",
            label: "Driver assigned",
            description:
                "A Bincycle partner is dispatched to your address window.",
            at: hours(scheduled, -1),
        },
        {
            key: "in_progress",
            label: "Pickup in progress",
            description: "Your partner is on the way / collecting bags.",
            at: scheduled,
        },
        {
            key: "completed",
            label: "Recycled",
            description:
                "Bags weighed at depot and routed to verified recyclers.",
            at: hours(scheduled, 2),
        },
    ];

    // Mark state based on pickup.status
    const idxByStatus = {
        scheduled: 1, // arrived through 'confirmed'
        in_progress: 3, // partner en route
        completed: 4,
    };
    const currentIdx = idxByStatus[pickup.status] ?? 1;

    return all.map((s, i) => {
        if (i < currentIdx) return { ...s, state: "done" };
        if (i === currentIdx) return { ...s, state: "current" };
        return { ...s, state: "upcoming", at: null };
    });
};

// ----- Referral mock -----
export const referralInfo = {
    code: "AANYA100",
    perFriend: 100,
    friendsJoined: 3,
    earnedTotal: 300,
};
