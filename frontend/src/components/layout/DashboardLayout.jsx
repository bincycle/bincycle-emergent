import { Outlet, NavLink, Link } from "react-router-dom";
import { useState } from "react";
import {
    Calendar,
    Home as HomeIcon,
    LayoutDashboard,
    Package,
    Receipt,
    Settings,
    LifeBuoy,
    LogOut,
    User,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUser } from "@/lib/mockData";
import LogoutDialog from "@/components/account/LogoutDialog";
import { getProfile } from "@/lib/accountStorage";

const navItems = [
    {
        to: "/dashboard/overview",
        label: "Overview",
        icon: LayoutDashboard,
        end: false,
        disabled: false,
    },
    {
        to: "/dashboard/book-pickup",
        label: "Book Pickup",
        icon: Calendar,
        end: true,
        disabled: false,
    },
    {
        to: "/dashboard/pickups",
        label: "My Pickups",
        icon: Package,
        end: false,
        disabled: false,
    },
    {
        to: "/dashboard/me",
        label: "Profile",
        icon: User,
        end: false,
        disabled: false,
    },
    { to: "#", label: "Invoices", icon: Receipt, disabled: true },
    { to: "#", label: "Settings", icon: Settings, disabled: true },
];

export const DashboardLayout = () => {
    const [logoutOpen, setLogoutOpen] = useState(false);
    const profile = getProfile();
    const initials = (profile.name || "U")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#121710]">
            <div className="mx-auto flex max-w-[1480px] flex-col lg:flex-row">
                {/* Sidebar - desktop */}
                <aside
                    data-testid="dashboard-sidebar"
                    className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-[#D1CDBC] lg:min-h-screen lg:sticky lg:top-0"
                >
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#D1CDBC]">
                        <Logo />
                    </div>

                    <nav className="flex-1 px-4 py-6">
                        <p className="font-mono-label text-[10px] text-[#596155] px-3 mb-3">
                            Workspace
                        </p>
                        <ul className="space-y-1">
                            {navItems.map((it) => {
                                const Icon = it.icon;
                                if (it.disabled) {
                                    return (
                                        <li key={it.label}>
                                            <span
                                                data-testid={`sidebar-link-${it.label
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}`}
                                                className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#596155]/60 cursor-not-allowed"
                                            >
                                                <Icon size={16} />
                                                {it.label}
                                                <span className="ml-auto font-mono-label text-[9px] text-[#596155]/60">
                                                    soon
                                                </span>
                                            </span>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={it.label}>
                                        <NavLink
                                            to={it.to}
                                            end={it.end}
                                            data-testid={`sidebar-link-${it.label
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                                                    isActive
                                                        ? "bg-[#284226] text-[#F7F5F0]"
                                                        : "text-[#121710] hover:bg-[#EDE9DC]"
                                                }`
                                            }
                                        >
                                            <Icon size={16} />
                                            {it.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="font-mono-label text-[10px] text-[#596155] px-3 mt-8 mb-3">
                            Support
                        </p>
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to="/help"
                                    data-testid="sidebar-link-help"
                                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#121710] hover:bg-[#EDE9DC]"
                                >
                                    <LifeBuoy size={16} /> Help center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/"
                                    data-testid="sidebar-link-home"
                                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-[#121710] hover:bg-[#EDE9DC]"
                                >
                                    <HomeIcon size={16} /> Back to site
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="m-4 rounded-sm border border-[#D1CDBC] bg-white p-3 flex items-center gap-3">
                        <Link
                            to="/dashboard/me"
                            data-testid="sidebar-profile-link"
                            className="flex items-center gap-3 min-w-0 flex-1 rounded-sm"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-sm font-semibold truncate text-[#121710]"
                                    data-testid="sidebar-user-name"
                                >
                                    {profile.name}
                                </p>
                                <p className="text-xs text-[#596155] truncate">
                                    {mockUser.plan} plan
                                </p>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setLogoutOpen(true)}
                            aria-label="Sign out"
                            data-testid="sidebar-signout"
                            className="rounded-sm p-2 text-[#596155] hover:text-[#C45B38]"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </aside>

                {/* Mobile topbar */}
                <header
                    data-testid="dashboard-topbar"
                    className="flex lg:hidden items-center justify-between border-b border-[#D1CDBC] bg-[#F7F5F0] px-5 py-4 sticky top-0 z-40 backdrop-blur-xl"
                >
                    <Logo />
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dashboard/me"
                            data-testid="topbar-profile-link"
                            aria-label="Account"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setLogoutOpen(true)}
                            aria-label="Sign out"
                            data-testid="topbar-signout"
                            className="rounded-sm p-2 text-[#596155] hover:text-[#C45B38]"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </div>
    );
};

export default DashboardLayout;
