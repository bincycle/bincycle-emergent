import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Pickups from "@/pages/Pickups";
import PickupDetails from "@/pages/PickupDetails";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import DashboardOverview from "@/pages/DashboardOverview";
import ExecutiveLayout from "@/components/layout/ExecutiveLayout";
import ExecutiveLogin from "@/pages/executive/ExecutiveLogin";
import ExecutiveDashboard from "@/pages/executive/ExecutiveDashboard";
import ExecutivePickups from "@/pages/executive/ExecutivePickups";
import ExecutivePickupDetails from "@/pages/executive/ExecutivePickupDetails";
import ExecutiveCompletePickup from "@/pages/executive/ExecutiveCompletePickup";
import ExecutiveProfile from "@/pages/executive/ExecutiveProfile";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminPickups from "@/pages/admin/AdminPickups";
import AdminPickupDetails from "@/pages/admin/AdminPickupDetails";
import AdminExecutives from "@/pages/admin/AdminExecutives";
import AdminExecutiveDetails from "@/pages/admin/AdminExecutiveDetails";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCustomerDetails from "@/pages/admin/AdminCustomerDetails";
import AdminProfile from "@/pages/admin/AdminProfile";

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
                            path="/dashboard"
                            element={<Navigate to="/dashboard/overview" replace />}
                        />
                        <Route
                            path="/dashboard/overview"
                            element={<DashboardOverview />}
                        />
                        <Route
                            path="/dashboard/book-pickup"
                            element={<BookPickup />}
                        />
                        <Route
                            path="/dashboard/pickups"
                            element={<Pickups />}
                        />
                        <Route
                            path="/dashboard/pickups/:id"
                            element={<PickupDetails />}
                        />
                        <Route
                            path="/dashboard/me"
                            element={<Account />}
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
                    <Route
                        path="/executive/login"
                        element={<ExecutiveLogin />}
                    />
                    <Route element={<ExecutiveLayout />}>
                        <Route
                            path="/executive"
                            element={<ExecutiveDashboard />}
                        />
                        <Route
                            path="/executive/pickups"
                            element={<ExecutivePickups />}
                        />
                        <Route
                            path="/executive/pickups/:id"
                            element={<ExecutivePickupDetails />}
                        />
                        <Route
                            path="/executive/pickups/:id/complete"
                            element={<ExecutiveCompletePickup />}
                        />
                        <Route
                            path="/executive/me"
                            element={<ExecutiveProfile />}
                        />
                    </Route>
                    <Route
                        path="/admin/login"
                        element={<AdminLogin />}
                    />
                    <Route element={<AdminLayout />}>
                        <Route
                            path="/admin"
                            element={<Navigate to="/admin/overview" replace />}
                        />
                        <Route
                            path="/admin/overview"
                            element={<AdminOverview />}
                        />
                        <Route
                            path="/admin/pickups"
                            element={<AdminPickups />}
                        />
                        <Route
                            path="/admin/pickups/:id"
                            element={<AdminPickupDetails />}
                        />
                        <Route
                            path="/admin/executives"
                            element={<AdminExecutives />}
                        />
                        <Route
                            path="/admin/executives/:id"
                            element={<AdminExecutiveDetails />}
                        />
                        <Route
                            path="/admin/customers"
                            element={<AdminCustomers />}
                        />
                        <Route
                            path="/admin/customers/:id"
                            element={<AdminCustomerDetails />}
                        />
                        <Route
                            path="/admin/me"
                            element={<AdminProfile />}
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
