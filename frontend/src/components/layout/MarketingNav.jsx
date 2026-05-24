import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";

const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pricing", label: "Pricing" },
    { to: "/help", label: "Help" },
    { to: "/contact", label: "Contact" },
];

export const MarketingNav = () => {
    const [open, setOpen] = useState(false);
    return (
        <header
            data-testid="marketing-nav"
            className="sticky top-0 z-50 backdrop-blur-xl bg-[#F7F5F0]/75 border-b border-[#D1CDBC]/60"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                <Logo />

                <nav className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === "/"}
                            data-testid={`nav-link-${l.label.toLowerCase()}`}
                            className={({ isActive }) =>
                                `px-3 py-2 text-sm transition-colors ${
                                    isActive
                                        ? "text-[#121710] font-semibold"
                                        : "text-[#596155] hover:text-[#121710]"
                                }`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden md:block">
                    <Link
                        to="/dashboard/book-pickup"
                        data-testid="nav-book-pickup-cta"
                        className="group inline-flex items-center gap-2 rounded-sm bg-[#284226] px-5 py-2.5 text-sm font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A]"
                    >
                        Book a pickup
                        <ArrowUpRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </Link>
                </div>

                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Toggle menu"
                    data-testid="nav-mobile-toggle"
                    className="md:hidden rounded-sm border border-[#D1CDBC] p-2 text-[#121710]"
                >
                    {open ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {open && (
                <div
                    className="md:hidden border-t border-[#D1CDBC]/60 bg-[#F7F5F0]"
                    data-testid="nav-mobile-panel"
                >
                    <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.to === "/"}
                                onClick={() => setOpen(false)}
                                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `rounded-sm px-3 py-3 text-base ${
                                        isActive
                                            ? "bg-[#284226] text-[#F7F5F0]"
                                            : "text-[#121710] hover:bg-[#EDE9DC]"
                                    }`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                        <Link
                            to="/dashboard/book-pickup"
                            onClick={() => setOpen(false)}
                            data-testid="nav-mobile-cta"
                            className="mt-2 inline-flex items-center justify-between rounded-sm bg-[#C45B38] px-4 py-3 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B]"
                        >
                            Book a pickup
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default MarketingNav;
