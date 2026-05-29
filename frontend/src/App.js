import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import MarketingLayout from "@/components/layout/MarketingLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import CookieConsent from "@/components/CookieConsent";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import Help from "@/pages/Help";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import BookPickup from "@/pages/BookPickup";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route element={<MarketingLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route
                            path="/privacy-policy"
                            element={<PrivacyPolicy />}
                        />
                        <Route
                            path="/terms-of-service"
                            element={<TermsOfService />}
                        />
                    </Route>
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/dashboard/book-pickup"
                            element={<BookPickup />}
                        />
                    </Route>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                        />
                    </Route>
                </Routes>
                <CookieConsent />
            </BrowserRouter>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#171A15",
                        color: "#F7F5F0",
                        border: "1px solid #284226",
                        borderRadius: "4px",
                    },
                }}
            />
        </div>
    );
}

export default App;
