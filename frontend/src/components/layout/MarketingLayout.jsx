import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MarketingNav from "./MarketingNav";
import Footer from "./Footer";

export const MarketingLayout = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col bg-[#F7F5F0] text-[#121710]">
            <MarketingNav />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MarketingLayout;
