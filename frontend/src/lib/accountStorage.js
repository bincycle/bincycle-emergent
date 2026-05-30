// Account-area localStorage helpers + mock seeds.
import { savedAddresses as seedAddresses, mockUser } from "@/lib/mockData";

const K = {
    profile: "bincycle:profile",
    addresses: "bincycle:addresses",
    notifications: "bincycle:notifications",
    sessions: "bincycle:sessions",
    cookieConsent: "bincycle:cookie-consent",
    bookingDraft: "bincycle:booking:draft",
    pickups: "bincycle:pickups",
};

const safeGet = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
};
const safeSet = (key, val) => {
    try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
    } catch {
        return false;
    }
};

// ----- Profile -----
export const getProfile = () =>
    safeGet(K.profile, {
        name: mockUser.name,
        email: mockUser.email,
        phone: "+91 98765 43210",
        avatar: mockUser.avatar,
    });
export const saveProfile = (p) => safeSet(K.profile, p);

// ----- Addresses -----
export const getAddresses = () => {
    const stored = safeGet(K.addresses, null);
    if (stored && Array.isArray(stored)) return stored;
    // seed from mock once, mark first as default
    const seeded = seedAddresses.map((a, i) => ({
        ...a,
        isDefault: i === 0,
    }));
    safeSet(K.addresses, seeded);
    return seeded;
};
export const saveAddresses = (list) => safeSet(K.addresses, list);

// ----- Notifications -----
export const getNotifications = () =>
    safeGet(K.notifications, {
        email: true,
        sms: true,
        marketing: false,
        reminders: true,
    });
export const saveNotifications = (p) => safeSet(K.notifications, p);

// ----- Mock sessions (seeded once into localStorage so user can sign-out individual ones) -----
const seedSessions = () => {
    const now = Date.now();
    const hour = 1000 * 60 * 60;
    return [
        {
            id: "s_current",
            current: true,
            device: "MacBook Pro",
            browser: "Chrome 128",
            platform: "macOS 14.5",
            location: "Bengaluru, IN",
            lastActiveAt: new Date(now).toISOString(),
        },
        {
            id: "s_iphone",
            current: false,
            device: "iPhone 15",
            browser: "Safari 17",
            platform: "iOS 17.4",
            location: "Bengaluru, IN",
            lastActiveAt: new Date(now - 4 * hour).toISOString(),
        },
        {
            id: "s_android",
            current: false,
            device: "Pixel 8",
            browser: "Chrome Mobile 128",
            platform: "Android 14",
            location: "Mumbai, IN",
            lastActiveAt: new Date(now - 36 * hour).toISOString(),
        },
        {
            id: "s_windows",
            current: false,
            device: "Office PC",
            browser: "Edge 128",
            platform: "Windows 11",
            location: "Gurugram, IN",
            lastActiveAt: new Date(now - 6 * 24 * hour).toISOString(),
        },
    ];
};
export const getSessions = () => {
    const stored = safeGet(K.sessions, null);
    if (stored && Array.isArray(stored) && stored.length) return stored;
    const fresh = seedSessions();
    safeSet(K.sessions, fresh);
    return fresh;
};
export const saveSessions = (list) => safeSet(K.sessions, list);

// ----- Mock login history (in-memory; not stored) -----
export const mockLoginHistory = (() => {
    const now = Date.now();
    const hour = 1000 * 60 * 60;
    return [
        {
            id: "l1",
            at: new Date(now - 0.2 * hour).toISOString(),
            device: "MacBook Pro",
            browser: "Chrome 128",
            location: "Bengaluru, IN",
            status: "success",
        },
        {
            id: "l2",
            at: new Date(now - 4 * hour).toISOString(),
            device: "iPhone 15",
            browser: "Safari 17",
            location: "Bengaluru, IN",
            status: "success",
        },
        {
            id: "l3",
            at: new Date(now - 18 * hour).toISOString(),
            device: "Unknown",
            browser: "Firefox 121",
            location: "Kolkata, IN",
            status: "failed",
        },
        {
            id: "l4",
            at: new Date(now - 2 * 24 * hour).toISOString(),
            device: "Pixel 8",
            browser: "Chrome Mobile 128",
            location: "Mumbai, IN",
            status: "success",
        },
        {
            id: "l5",
            at: new Date(now - 7 * 24 * hour).toISOString(),
            device: "Office PC",
            browser: "Edge 128",
            location: "Gurugram, IN",
            status: "success",
        },
    ];
})();

// ----- Billing mocks -----
export const billingPlan = {
    name: "Weekly",
    price: "₹499",
    cadence: "per month",
    renewsOn: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 12);
        return d.toISOString();
    })(),
    bagsRemaining: 3,
    bagsTotal: 4,
};

export const mockPaymentMethods = [
    {
        id: "pm_card_4242",
        type: "card",
        brand: "Visa",
        last4: "4242",
        expiry: "12/27",
        holder: "Aanya Rao",
        isDefault: true,
    },
    {
        id: "pm_upi_aanya",
        type: "upi",
        upiId: "aanya@okicici",
        isDefault: false,
    },
];

const monthAgo = (n) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
};

export const mockInvoices = [
    {
        id: "INV-2026-0218",
        date: monthAgo(0),
        plan: "Weekly · Feb",
        amount: 499,
        status: "paid",
    },
    {
        id: "INV-2026-0118",
        date: monthAgo(1),
        plan: "Weekly · Jan",
        amount: 499,
        status: "paid",
    },
    {
        id: "INV-2025-1218",
        date: monthAgo(2),
        plan: "Weekly · Dec",
        amount: 499,
        status: "paid",
    },
    {
        id: "INV-2025-1118",
        date: monthAgo(3),
        plan: "Weekly · Nov",
        amount: 449,
        status: "paid",
    },
];

export const mockCouponHistory = [
    {
        code: "WELCOME50",
        appliedOn: monthAgo(3),
        savedAmount: 75,
        bookingId: "BC-6810",
    },
    {
        code: "GREEN20",
        appliedOn: monthAgo(1),
        savedAmount: 20,
        bookingId: "BC-8307",
    },
];

// ----- Clear everything on logout / account-delete -----
// NOTE: We intentionally do NOT clear `bincycle:cookie-consent` so a returning
// visitor isn't prompted again after signing out.
export const clearAllUserData = () => {
    [
        K.profile,
        K.addresses,
        K.notifications,
        K.sessions,
        K.bookingDraft,
        K.pickups,
    ].forEach((k) => {
        try {
            localStorage.removeItem(k);
        } catch {
            /* ignore */
        }
    });
};
