import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const scorePassword = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
};
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = [
    "bg-[#D1CDBC]",
    "bg-[#C45B38]",
    "bg-[#C45B38]",
    "bg-[#284226]",
    "bg-[#284226]",
];

const ResetPassword = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");

    const [form, setForm] = useState({ password: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [show, setShow] = useState(false);
    const [done, setDone] = useState(false);

    const strength = useMemo(
        () => scorePassword(form.password),
        [form.password]
    );

    const validate = () => {
        const e = {};
        if (!form.password) e.password = "Please choose a new password.";
        else if (form.password.length < 8)
            e.password = "Use at least 8 characters.";
        else if (strength < 2)
            e.password = "Make it stronger — add numbers or capitals.";
        if (!form.confirm) e.confirm = "Please confirm your password.";
        else if (form.confirm !== form.password)
            e.confirm = "Passwords do not match.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setDone(true);
            toast.success("Password updated. Please sign in.");
            setTimeout(() => navigate("/login"), 1500);
        }, 1000);
    };

    if (done) {
        return (
            <div data-testid="reset-success">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#EDE9DC] text-[#284226]">
                    <ShieldCheck size={22} />
                </div>
                <h1 className="mt-5 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                    Password updated.
                </h1>
                <p className="mt-3 text-[#596155]">
                    You can now sign in with your new password. Redirecting
                    you...
                </p>
            </div>
        );
    }

    if (!token) {
        return (
            <div data-testid="reset-invalid-token">
                <p className="font-mono-label text-xs text-[#596155]">
                    [ invalid reset link ]
                </p>
                <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                    This link is invalid or expired.
                </h1>
                <p className="mt-3 text-[#596155] leading-relaxed">
                    Reset links expire 30 minutes after they're sent. Request a
                    fresh link to continue.
                </p>
                <Link
                    to="/forgot-password"
                    data-testid="reset-request-new-link"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors w-full"
                >
                    Request a new link
                    <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div data-testid="reset-password-page">
            <p className="font-mono-label text-xs text-[#596155]">
                [ create a new password ]
            </p>
            <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#121710]">
                Set a new password.
            </h1>
            <p className="mt-3 text-[#596155] leading-relaxed">
                Choose something memorable — at least 8 characters, with a
                number or capital letter for good measure.
            </p>

            <form
                onSubmit={onSubmit}
                noValidate
                data-testid="reset-form"
                className="mt-8 space-y-5"
            >
                <div>
                    <Label
                        htmlFor="password"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        New password
                    </Label>
                    <div className="relative mt-2">
                        <Input
                            id="password"
                            name="password"
                            type={show ? "text" : "password"}
                            value={form.password}
                            onChange={onChange}
                            data-testid="reset-input-password"
                            placeholder="At least 8 characters"
                            aria-invalid={!!errors.password}
                            className={`h-12 rounded-sm bg-white pr-12 focus-visible:ring-[#284226] ${
                                errors.password
                                    ? "border-[#C45B38]"
                                    : "border-[#D1CDBC]"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            data-testid="reset-toggle-password"
                            aria-label={
                                show ? "Hide password" : "Show password"
                            }
                            className="absolute inset-y-0 right-0 grid place-items-center w-12 text-[#596155] hover:text-[#121710]"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {form.password && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex flex-1 gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-sm ${
                                            i < strength
                                                ? STRENGTH_COLOR[strength]
                                                : "bg-[#D1CDBC]"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-mono-label text-[10px] text-[#596155]">
                                {STRENGTH_LABEL[strength]}
                            </span>
                        </div>
                    )}
                    {errors.password && (
                        <p
                            data-testid="reset-error-password"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>

                <div>
                    <Label
                        htmlFor="confirm"
                        className="font-mono-label text-xs text-[#596155]"
                    >
                        Confirm password
                    </Label>
                    <Input
                        id="confirm"
                        name="confirm"
                        type={show ? "text" : "password"}
                        value={form.confirm}
                        onChange={onChange}
                        data-testid="reset-input-confirm"
                        placeholder="Re-enter password"
                        aria-invalid={!!errors.confirm}
                        className={`mt-2 h-12 rounded-sm bg-white focus-visible:ring-[#284226] ${
                            errors.confirm
                                ? "border-[#C45B38]"
                                : "border-[#D1CDBC]"
                        }`}
                    />
                    {errors.confirm && (
                        <p
                            data-testid="reset-error-confirm"
                            className="mt-1.5 text-xs text-[#C45B38]"
                        >
                            {errors.confirm}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    data-testid="reset-submit-btn"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-5 py-3.5 text-sm font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving new password...
                        </>
                    ) : (
                        <>
                            Update password
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
