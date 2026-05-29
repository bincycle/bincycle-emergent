import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, MailCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required.");
            return;
        }
        if (!emailRe.test(email)) {
            setError("Please enter a valid email.");
            return;
        }
        setError("");
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setSent(true);
        }, 1000);
    };

    if (sent) {
        return (
            <div data-testid="forgot-password-sent">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                    <MailCheck size={22} />
                </div>
                <h1 className="mt-5 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                    Check your inbox.
                </h1>
                <p className="mt-3 text-[#596155] leading-relaxed">
                    If an account exists for{" "}
                    <span className="text-[#121710] font-medium">{email}</span>,
                    we've sent a password reset link. It expires in 30 minutes.
                </p>
                <div className="mt-8 space-y-3">
                    <button
                        type="button"
                        onClick={() => {
                            setSent(false);
                            setEmail("");
                        }}
                        data-testid="forgot-send-again-btn"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-sm border border-[#121710] px-5 py-3.5 text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
                    >
                        Send to a different email
                    </button>
                    <Link
                        to="/login"
                        data-testid="forgot-back-login-link"
                        className="w-full inline-flex items-center justify-center gap-2 text-sm text-[#596155] hover:text-[#121710]"
                    >
                        <ArrowLeft size={14} /> Back to sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div data-testid="forgot-password-page">
            <p className="font-mono-label text-xs text-[#596155]">
                [ forgot your password? ]
            </p>
            <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                Let's get you back in.
            </h1>
            <p className="mt-3 text-[#596155] leading-relaxed">
                Enter the email you used to register. We'll send a reset link
                that's valid for 30 minutes.
            </p>

            <form
                onSubmit={onSubmit}
                noValidate
                data-testid="forgot-form"
                className="mt-8 space-y-5"
            >
                <div>
                    <Label
                        htmlFor="email"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                        }}
                        data-testid="forgot-input-email"
                        placeholder="you@bincycle.in"
                        aria-invalid={!!error}
                        className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                            error ? "border-[#C45B38]" : "border-[#D1CDBC]"
                        }`}
                    />
                    {error && (
                        <p
                            data-testid="forgot-error-email"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="forgot-submit-btn"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending reset link...
                        </>
                    ) : (
                        <>
                            Send reset link
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>

                <Link
                    to="/login"
                    data-testid="forgot-back-login"
                    className="block text-center text-sm text-[#596155] hover:text-[#121710]"
                >
                    <ArrowLeft size={14} className="inline mr-1" /> Back to sign in
                </Link>
            </form>
        </div>
    );
};

export default ForgotPassword;
