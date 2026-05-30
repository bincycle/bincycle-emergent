import { Link, useNavigate } from "react-router-dom";
import {
    Award,
    Briefcase,
    LogOut,
    MapPin,
    Phone,
    Star,
    Truck,
    ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    execProfile,
    signOutExec,
    loadPickups,
    computeStats,
} from "@/lib/executiveMock";
import { toast } from "sonner";

const ExecutiveProfile = () => {
    const navigate = useNavigate();
    const stats = computeStats(loadPickups());

    const logout = () => {
        signOutExec();
        toast.success("Signed out. See you on the next route.");
        navigate("/executive/login");
    };

    return (
        <div data-testid="exec-profile-page" className="px-5 pt-6 pb-6">
            <Link
                to="/executive"
                data-testid="exec-profile-back"
                className="inline-flex items-center gap-1.5 text-sm text-[#596155]"
            >
                <ArrowLeft size={14} /> Dashboard
            </Link>

            {/* Profile header */}
            <header
                data-testid="exec-profile-header"
                className="mt-5 rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-6"
            >
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-[#C45B38]">
                        <AvatarImage src={execProfile.avatar} />
                        <AvatarFallback>VP</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p
                            data-testid="exec-profile-name"
                            className="font-display text-2xl font-black tracking-tighter"
                        >
                            {execProfile.name}
                        </p>
                        <p
                            data-testid="exec-profile-empid"
                            className="font-mono-label text-[10px] text-[#F7F5F0]/60"
                        >
                            {execProfile.empId}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#C45B38]">
                            <Star size={12} className="fill-[#C45B38]" />
                            {execProfile.rating} partner rating
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <a
                        href={`tel:${execProfile.phone}`}
                        data-testid="exec-profile-phone"
                        className="flex items-center gap-2 rounded-sm bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 p-3"
                    >
                        <Phone
                            size={14}
                            className="text-[#C45B38] shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="font-mono-label text-[9px] text-[#F7F5F0]/60">
                                Phone
                            </p>
                            <p className="text-xs text-[#F7F5F0] truncate">
                                {execProfile.phone}
                            </p>
                        </div>
                    </a>
                    <div className="flex items-center gap-2 rounded-sm bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 p-3">
                        <MapPin
                            size={14}
                            className="text-[#C45B38] shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="font-mono-label text-[9px] text-[#F7F5F0]/60">
                                Zone
                            </p>
                            <p
                                data-testid="exec-profile-zone"
                                className="text-xs text-[#F7F5F0] truncate"
                            >
                                {execProfile.zone}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-sm bg-[#F7F5F0]/5 border border-[#F7F5F0]/10 p-3 col-span-2">
                        <Truck
                            size={14}
                            className="text-[#C45B38] shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="font-mono-label text-[9px] text-[#F7F5F0]/60">
                                Assigned vehicle
                            </p>
                            <p className="text-xs text-[#F7F5F0] truncate">
                                {execProfile.vehicle} · Electric pickup van
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Performance */}
            <section
                data-testid="exec-profile-stats"
                className="mt-5"
            >
                <p className="font-mono-label text-[10px] text-[#596155] mb-3">
                    Performance · today
                </p>
                <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-sm border border-[#D1CDBC]">
                    <div className="bg-white p-4">
                        <p className="font-mono-label text-[9px] text-[#596155]">
                            Pickups
                        </p>
                        <p
                            data-testid="exec-stat-pickups"
                            className="mt-1 font-display text-2xl font-black tracking-tighter text-[#121710]"
                        >
                            {stats.todaysCount}
                        </p>
                    </div>
                    <div className="bg-white p-4 border-l border-[#D1CDBC]">
                        <p className="font-mono-label text-[9px] text-[#596155]">
                            Recycled
                        </p>
                        <p
                            data-testid="exec-stat-recycled"
                            className="mt-1 font-display text-2xl font-black tracking-tighter text-[#284226]"
                        >
                            {stats.totalKg}
                            <span className="text-sm font-normal text-[#596155] ml-1">
                                kg
                            </span>
                        </p>
                    </div>
                    <div className="bg-white p-4 border-l border-[#D1CDBC]">
                        <p className="font-mono-label text-[9px] text-[#596155]">
                            Earnings
                        </p>
                        <p
                            data-testid="exec-stat-earnings"
                            className="mt-1 font-display text-2xl font-black tracking-tighter text-[#C45B38]"
                        >
                            ₹{stats.totalEarn}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-sm border border-[#D1CDBC] bg-white p-4 flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                        <Briefcase size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#121710]">
                            Partner since March 2024
                        </p>
                        <p className="text-[11px] text-[#596155]">
                            230+ recycling pickups completed
                        </p>
                    </div>
                </div>
                <div className="rounded-sm border border-[#D1CDBC] bg-white p-4 flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                        <Award size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#121710]">
                            Top partner · BLR-East
                        </p>
                        <p className="text-[11px] text-[#596155]">
                            Highest on-time arrival this month
                        </p>
                    </div>
                </div>
            </section>

            <button
                type="button"
                onClick={logout}
                data-testid="exec-logout-btn"
                className="mt-6 w-full inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-[#C45B38] bg-[#C45B38]/5 text-sm font-medium text-[#C45B38] hover:bg-[#C45B38] hover:text-[#F7F5F0] transition-colors"
            >
                <LogOut size={14} /> Sign out
            </button>
        </div>
    );
};

export default ExecutiveProfile;
