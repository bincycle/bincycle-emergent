import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    PackageCheck,
    CheckCircle2,
    User,
} from "lucide-react";
import { getExecAuth } from "@/lib/executiveMock";

const TABS = [
    { to: "/executive", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/executive/pickups", label: "Pickups", icon: PackageCheck, end: false },
    {
        to: "/executive/pickups/complete",
        label: "Complete",
        icon: CheckCircle2,
        end: false,
        synthetic: true, // navigates by computed next pickup
    },
    { to: "/executive/me", label: "Profile", icon: User, end: true },
];

export const ExecutiveLayout = () => {
    const { pathname } = useLocation();
    const [auth, setAuth] = useState(() => getExecAuth());

    useEffect(() => {
        setAuth(getExecAuth());
    }, [pathname]);

    if (!auth) return <Navigate to="/executive/login" replace />;

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#121710]">
            <div className="mx-auto max-w-md min-h-screen bg-[#F7F5F0] pb-24 relative">
                <Outlet />
                <ExecutiveBottomNav />
            </div>
        </div>
    );
};

const ExecutiveBottomNav = () => {
    // Find a pickup to land on for the synthetic Complete tab.
    const completeHref = (() => {
        try {
            const list = JSON.parse(
                localStorage.getItem("bincycle:executive:pickups") || "[]"
            );
            const active = list.find(
                (p) =>
                    p.status === "arrived" ||
                    p.status === "collecting" ||
                    p.status === "payment_pending"
            );
            if (active) return `/executive/pickups/${active.id}/complete`;
            const onTheWay = list.find((p) => p.status === "on_the_way");
            if (onTheWay)
                return `/executive/pickups/${onTheWay.id}/complete`;
            const next = list.find(
                (p) => p.status !== "completed" && p.status !== "cancelled"
            );
            if (next) return `/executive/pickups/${next.id}/complete`;
            return "/executive/pickups";
        } catch {
            return "/executive/pickups";
        }
    })();

    return (
        <nav
            data-testid="exec-bottom-nav"
            className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-[#D1CDBC] bg-[#F7F5F0]/95 backdrop-blur-xl"
            aria-label="Executive navigation"
        >
            <ul className="grid grid-cols-4">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const to = t.synthetic ? completeHref : t.to;
                    return (
                        <li key={t.label}>
                            <NavLink
                                to={to}
                                end={t.end}
                                data-testid={`exec-tab-${t.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-mono-label transition-colors ${
                                        isActive && !t.synthetic
                                            ? "text-[#284226]"
                                            : "text-[#596155] hover:text-[#121710]"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={`inline-flex h-9 w-9 items-center justify-center rounded-sm ${
                                                isActive && !t.synthetic
                                                    ? "bg-[#284226] text-[#F7F5F0]"
                                                    : "bg-transparent text-[#596155]"
                                            }`}
                                        >
                                            <Icon size={16} />
                                        </span>
                                        <span>{t.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default ExecutiveLayout;
