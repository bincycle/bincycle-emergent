import { useMemo, useState } from "react";
import {
    User,
    Bell,
    ShieldCheck,
    Settings,
    Pencil,
    Save,
    X,
    Eye,
    EyeOff,
    Smartphone,
    MapPin,
    Trash2,
    LogOut as LogOutIcon,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AdminPageHeader,
    SectionCard,
} from "@/components/admin/AdminUI";
import AdminLogoutDialog from "@/components/admin/AdminLogoutDialog";
import {
    getAdminProfile,
    saveAdminProfile,
    getAdminSessions,
    saveAdminSessions,
    adminLoginHistory,
} from "@/lib/adminMock";

const TABS = [
    { id: "profile", label: "Profile", description: "Identity & contact", icon: User },
    {
        id: "notifications",
        label: "Notifications",
        description: "Email · SMS · digests",
        icon: Bell,
    },
    {
        id: "security",
        label: "Security",
        description: "Password · sessions · log",
        icon: ShieldCheck,
    },
    {
        id: "preferences",
        label: "Preferences",
        description: "Defaults & display",
        icon: Settings,
    },
];

// ---------- Profile tab ----------
const ProfileSection = ({ profile, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(profile);
    const [errors, setErrors] = useState({});

    const change = (k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    };
    const save = () => {
        const er = {};
        if (!form.name?.trim()) er.name = "Required.";
        if (!form.email?.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
            er.email = "Invalid email.";
        setErrors(er);
        if (Object.keys(er).length) return;
        onSave(form);
        setEditing(false);
        toast.success("Profile updated.");
    };

    return (
        <SectionCard
            testid="admin-profile-section"
            title="Profile"
            action={
                editing ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setForm(profile);
                            }}
                            data-testid="admin-profile-cancel"
                            className="inline-flex items-center gap-1.5 rounded-sm border border-[#D1CDBC] px-3 py-1.5 text-xs text-[#596155] hover:text-[#121710] hover:bg-[#F7F5F0]"
                        >
                            <X size={12} /> Cancel
                        </button>
                        <button
                            type="button"
                            onClick={save}
                            data-testid="admin-profile-save"
                            className="inline-flex items-center gap-1.5 rounded-sm bg-[#171A15] px-3 py-1.5 text-xs text-[#F7F5F0] hover:bg-[#C45B38]"
                        >
                            <Save size={12} /> Save
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        data-testid="admin-profile-edit"
                        className="inline-flex items-center gap-1.5 rounded-sm border border-[#121710] px-3 py-1.5 text-xs text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0]"
                    >
                        <Pencil size={11} /> Edit
                    </button>
                )
            }
        >
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-[#D1CDBC]">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <div>
                    <p
                        data-testid="admin-profile-display-name"
                        className="font-display text-xl font-bold tracking-tight"
                    >
                        {profile.name}
                    </p>
                    <p className="text-sm text-[#596155]">
                        {profile.role} · {profile.employeeId}
                    </p>
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                {[
                    ["name", "Full name", "text"],
                    ["email", "Email", "email"],
                    ["phone", "Phone", "tel"],
                    ["role", "Role", "text"],
                ].map(([k, label, type]) => (
                    <div key={k}>
                        <Label className="font-mono-label text-[10px] text-[#596155]">
                            {label}
                        </Label>
                        <Input
                            value={form[k] || ""}
                            type={type}
                            readOnly={!editing}
                            onChange={(e) => change(k, e.target.value)}
                            data-testid={`admin-profile-${k}`}
                            aria-invalid={!!errors[k]}
                            className={`mt-1 h-10 rounded-sm border-[#D1CDBC] bg-white focus-visible:ring-[#284226] ${
                                !editing ? "bg-[#F7F5F0]" : ""
                            } ${errors[k] ? "border-[#C45B38]" : ""}`}
                        />
                        {errors[k] && (
                            <p className="mt-1 text-xs text-[#C45B38]">
                                {errors[k]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};

// ---------- Notifications tab ----------
const NotificationsSection = ({ profile, onSave }) => {
    const [n, setN] = useState(profile.notifications || {});
    const [savedFlash, setSavedFlash] = useState(false);

    const toggle = (key) => {
        const next = { ...n, [key]: !n[key] };
        setN(next);
        onSave({ ...profile, notifications: next });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
    };

    const items = [
        ["emailAlerts", "Email alerts", "Get notified on pickup events"],
        [
            "smsAlerts",
            "SMS alerts",
            "Critical events sent to your phone",
        ],
        [
            "weeklyDigest",
            "Weekly digest",
            "Monday morning ops digest in your inbox",
        ],
        [
            "cancellationAlerts",
            "Cancellation alerts",
            "Real-time pings when a customer cancels",
        ],
    ];

    return (
        <SectionCard
            testid="admin-notifications-section"
            title="Notifications"
            action={
                savedFlash && (
                    <span
                        data-testid="admin-notifications-saved"
                        className="font-mono-label text-[10px] text-[#284226]"
                    >
                        SAVED
                    </span>
                )
            }
        >
            <ul className="divide-y divide-[#D1CDBC]">
                {items.map(([k, label, desc]) => (
                    <li
                        key={k}
                        className="flex items-center justify-between py-3.5"
                    >
                        <div>
                            <p className="text-sm font-medium text-[#121710]">
                                {label}
                            </p>
                            <p className="text-xs text-[#596155]">{desc}</p>
                        </div>
                        <Switch
                            checked={!!n[k]}
                            onCheckedChange={() => toggle(k)}
                            data-testid={`admin-notif-${k}`}
                        />
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
};

// ---------- Security tab ----------
const SecuritySection = ({ onSignOutAll }) => {
    const [form, setForm] = useState({
        current: "",
        next: "",
        confirm: "",
    });
    const [errors, setErrors] = useState({});
    const [show, setShow] = useState(false);
    const [sessions, setSessions] = useState(() => getAdminSessions());
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handlePwd = (e) => {
        e.preventDefault();
        const er = {};
        if (!form.current) er.current = "Required.";
        if (!form.next || form.next.length < 8)
            er.next = "Min 8 characters.";
        if (form.next !== form.confirm) er.confirm = "Passwords don't match.";
        setErrors(er);
        if (Object.keys(er).length) return;
        toast.success("Password updated.");
        setForm({ current: "", next: "", confirm: "" });
    };

    const revoke = (id) => {
        const next = sessions.filter((s) => s.id !== id);
        setSessions(next);
        saveAdminSessions(next);
        toast.success("Session revoked.");
    };
    const revokeOthers = () => {
        const next = sessions.filter((s) => s.current);
        setSessions(next);
        saveAdminSessions(next);
        toast.success("All other sessions signed out.");
    };

    return (
        <div className="space-y-4">
            <SectionCard
                testid="admin-password-section"
                title="Change password"
            >
                <form
                    onSubmit={handlePwd}
                    data-testid="admin-password-form"
                    noValidate
                    className="grid gap-3 sm:grid-cols-3"
                >
                    {[
                        ["current", "Current password"],
                        ["next", "New password"],
                        ["confirm", "Confirm new"],
                    ].map(([k, label]) => (
                        <div key={k}>
                            <Label className="font-mono-label text-[10px] text-[#596155]">
                                {label}
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    type={show ? "text" : "password"}
                                    value={form[k]}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            [k]: e.target.value,
                                        }))
                                    }
                                    data-testid={`admin-pwd-${k}`}
                                    aria-invalid={!!errors[k]}
                                    className={`h-10 rounded-sm pr-9 border-[#D1CDBC] bg-white focus-visible:ring-[#284226] ${
                                        errors[k] ? "border-[#C45B38]" : ""
                                    }`}
                                />
                                {k === "current" && (
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        data-testid="admin-pwd-show"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#596155] hover:text-[#121710]"
                                        aria-label="Toggle visibility"
                                    >
                                        {show ? (
                                            <EyeOff size={13} />
                                        ) : (
                                            <Eye size={13} />
                                        )}
                                    </button>
                                )}
                            </div>
                            {errors[k] && (
                                <p className="mt-1 text-xs text-[#C45B38]">
                                    {errors[k]}
                                </p>
                            )}
                        </div>
                    ))}
                    <div className="sm:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            data-testid="admin-pwd-submit"
                            className="rounded-sm bg-[#171A15] px-4 py-2.5 text-sm text-[#F7F5F0] hover:bg-[#C45B38] transition-colors"
                        >
                            Update password
                        </button>
                    </div>
                </form>
            </SectionCard>

            <SectionCard
                testid="admin-sessions-section"
                title="Active sessions"
                action={
                    sessions.length > 1 && (
                        <button
                            type="button"
                            onClick={revokeOthers}
                            data-testid="admin-revoke-others"
                            className="text-xs text-[#C45B38] hover:underline"
                        >
                            Sign out everywhere else
                        </button>
                    )
                }
            >
                <ul className="space-y-2">
                    {sessions.map((s) => (
                        <li
                            key={s.id}
                            data-testid={`admin-session-${s.id}`}
                            className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <Smartphone
                                    size={14}
                                    className="text-[#596155] mt-0.5"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#121710] truncate">
                                        {s.device} · {s.browser}{" "}
                                        {s.current && (
                                            <span className="ml-1 font-mono-label text-[9px] text-[#284226] border border-[#284226]/30 bg-[#284226]/10 px-1.5 py-0.5 rounded-sm">
                                                THIS DEVICE
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-[#596155]">
                                        {s.platform} · {s.location} ·{" "}
                                        {formatDistanceToNow(
                                            parseISO(s.lastActiveAt),
                                            { addSuffix: true }
                                        )}
                                    </p>
                                </div>
                            </div>
                            {!s.current && (
                                <button
                                    type="button"
                                    onClick={() => revoke(s.id)}
                                    data-testid={`admin-revoke-${s.id}`}
                                    className="rounded-sm p-1.5 text-[#596155] hover:text-[#C45B38]"
                                    aria-label="Revoke session"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </SectionCard>

            <SectionCard
                testid="admin-login-history"
                title="Login history"
            >
                <ul className="space-y-2">
                    {adminLoginHistory.map((l) => (
                        <li
                            key={l.id}
                            className="flex items-center justify-between gap-3 rounded-sm border border-[#D1CDBC] bg-[#F7F5F0] p-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm text-[#121710] truncate">
                                    {l.device} · {l.browser}
                                </p>
                                <p className="text-xs text-[#596155]">
                                    {l.location} ·{" "}
                                    {format(
                                        parseISO(l.at),
                                        "d MMM yy · HH:mm"
                                    )}
                                </p>
                            </div>
                            <span
                                className={`font-mono-label text-[10px] px-2 py-0.5 rounded-sm border ${
                                    l.status === "success"
                                        ? "border-[#284226]/40 bg-[#284226]/10 text-[#284226]"
                                        : "border-[#C45B38]/40 bg-[#C45B38]/10 text-[#C45B38]"
                                }`}
                            >
                                {l.status.toUpperCase()}
                            </span>
                        </li>
                    ))}
                </ul>
            </SectionCard>

            <SectionCard
                testid="admin-danger-zone"
                title="Danger zone"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-sm border border-[#C45B38]/40 bg-[#C45B38]/5 p-4">
                    <div>
                        <p className="text-sm font-semibold text-[#121710]">
                            Sign out of the console
                        </p>
                        <p className="text-xs text-[#596155]">
                            You'll need your admin credentials to return.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setLogoutOpen(true)}
                        data-testid="admin-danger-signout"
                        className="inline-flex items-center gap-2 rounded-sm bg-[#C45B38] px-4 py-2.5 text-sm text-[#F7F5F0] hover:bg-[#A64A2B]"
                    >
                        <LogOutIcon size={13} />
                        Sign out
                    </button>
                </div>
            </SectionCard>

            <AdminLogoutDialog
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
            />
        </div>
    );
};

// ---------- Preferences tab ----------
const PreferencesSection = ({ profile, onSave }) => {
    const [prefs, setPrefs] = useState(profile.preferences || {});

    const update = (k, v) => {
        const next = { ...prefs, [k]: v };
        setPrefs(next);
        onSave({ ...profile, preferences: next });
        toast.success("Preference saved.");
    };

    return (
        <SectionCard testid="admin-prefs-section" title="Preferences">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label className="font-mono-label text-[10px] text-[#596155]">
                        Default landing
                    </Label>
                    <Select
                        value={prefs.defaultLanding || "overview"}
                        onValueChange={(v) => update("defaultLanding", v)}
                    >
                        <SelectTrigger
                            data-testid="admin-pref-landing"
                            className="mt-1 h-10 rounded-sm border-[#D1CDBC] bg-white focus:ring-[#284226]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="overview">Overview</SelectItem>
                            <SelectItem value="pickups">Pickups</SelectItem>
                            <SelectItem value="executives">
                                Executives
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="font-mono-label text-[10px] text-[#596155]">
                        Rows per page
                    </Label>
                    <Select
                        value={String(prefs.rowsPerPage || 25)}
                        onValueChange={(v) =>
                            update("rowsPerPage", Number(v))
                        }
                    >
                        <SelectTrigger
                            data-testid="admin-pref-rows"
                            className="mt-1 h-10 rounded-sm border-[#D1CDBC] bg-white focus:ring-[#284226]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="font-mono-label text-[10px] text-[#596155]">
                        Density
                    </Label>
                    <Select
                        value={prefs.density || "comfortable"}
                        onValueChange={(v) => update("density", v)}
                    >
                        <SelectTrigger
                            data-testid="admin-pref-density"
                            className="mt-1 h-10 rounded-sm border-[#D1CDBC] bg-white focus:ring-[#284226]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">
                                Comfortable
                            </SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="font-mono-label text-[10px] text-[#596155]">
                        Timezone
                    </Label>
                    <Input
                        readOnly
                        value={profile.timezone || "Asia/Kolkata"}
                        data-testid="admin-pref-tz"
                        className="mt-1 h-10 rounded-sm border-[#D1CDBC] bg-[#F7F5F0]"
                    />
                </div>
            </div>
        </SectionCard>
    );
};

// ---------- Main ----------
const AdminProfile = () => {
    const [profile, setProfile] = useState(() => getAdminProfile());
    const [active, setActive] = useState("profile");

    const handleSave = (next) => {
        setProfile(next);
        saveAdminProfile(next);
    };

    const Active = useMemo(() => {
        const map = {
            profile: <ProfileSection profile={profile} onSave={handleSave} />,
            notifications: (
                <NotificationsSection profile={profile} onSave={handleSave} />
            ),
            security: <SecuritySection />,
            preferences: (
                <PreferencesSection profile={profile} onSave={handleSave} />
            ),
        };
        return map[active] || map.profile;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, profile]);

    return (
        <div
            data-testid="admin-profile-page"
            className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10"
        >
            <AdminPageHeader
                eyebrow="[ admin · profile ]"
                title="Your console"
                description="Manage your identity, alerts, sessions and operational defaults."
            />

            <div className="grid gap-6 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                    {/* Mobile horizontal pill bar */}
                    <div className="lg:hidden -mx-1 overflow-x-auto no-scrollbar">
                        <div
                            role="tablist"
                            className="flex gap-2 pb-2 px-1"
                        >
                            {TABS.map((t) => {
                                const Icon = t.icon;
                                const isActive = t.id === active;
                                return (
                                    <button
                                        key={t.id}
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActive(t.id)}
                                        data-testid={`admin-tab-${t.id}-mobile`}
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors ${
                                            isActive
                                                ? "bg-[#171A15] text-[#F7F5F0] border-[#171A15]"
                                                : "border-[#D1CDBC] bg-white text-[#596155] hover:text-[#121710]"
                                        }`}
                                    >
                                        <Icon size={14} />
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <nav
                        role="tablist"
                        className="hidden lg:flex lg:flex-col lg:sticky lg:top-8 gap-1 rounded-sm border border-[#D1CDBC] bg-white p-2"
                    >
                        {TABS.map((t) => {
                            const Icon = t.icon;
                            const isActive = t.id === active;
                            return (
                                <button
                                    key={t.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActive(t.id)}
                                    data-testid={`admin-tab-${t.id}`}
                                    className={`flex items-center gap-3 rounded-sm px-3 py-3 text-left transition-colors ${
                                        isActive
                                            ? "bg-[#171A15] text-[#F7F5F0]"
                                            : "text-[#121710] hover:bg-[#EDE9DC]"
                                    }`}
                                >
                                    <span
                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${
                                            isActive
                                                ? "bg-[#C45B38] text-[#F7F5F0]"
                                                : "bg-[#EDE9DC] text-[#284226]"
                                        }`}
                                    >
                                        <Icon size={14} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold">
                                            {t.label}
                                        </p>
                                        <p
                                            className={`text-xs truncate ${
                                                isActive
                                                    ? "text-[#F7F5F0]/60"
                                                    : "text-[#596155]"
                                            }`}
                                        >
                                            {t.description}
                                        </p>
                                    </span>
                                    <ChevronRight
                                        size={14}
                                        className={
                                            isActive
                                                ? "text-[#F7F5F0]/60"
                                                : "text-[#596155]"
                                        }
                                    />
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <section className="lg:col-span-9 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            {Active}
                        </motion.div>
                    </AnimatePresence>
                </section>
            </div>
        </div>
    );
};

export default AdminProfile;
