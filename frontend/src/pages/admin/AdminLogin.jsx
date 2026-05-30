import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Shield, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ADMIN_DEMO, signInAdmin } from "@/lib/adminMock";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: ADMIN_DEMO.email,
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const submit = (e) => {
        e.preventDefault();
        const er = {};
        if (!form.email.trim()) er.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(form.email))
            er.email = "Enter a valid email.";
        if (!form.password) er.password = "Password is required.";
        setErrors(er);
        if (Object.keys(er).length) return;

        setPending(true);
        setTimeout(() => {
            // Mock check — accept the demo creds, but also accept any non-empty creds.
            if (
                form.email !== ADMIN_DEMO.email ||
                form.password !== ADMIN_DEMO.password
            ) {
                // Be lenient for the demo, but still flag mismatch as a soft toast.
                toast.info("Demo mode — signing you in.");
            }
            signInAdmin(form.email);
            setPending(false);
            toast.success("Welcome back, Meera.");
            navigate("/admin/overview", { replace: true });
        }, 700);
    };

    return (
        <div
            data-testid="admin-login-page"
            className="min-h-screen bg-[#171A15] text-[#F7F5F0]"
        >
            <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#C45B38] text-[#F7F5F0]">
                            <Shield size={16} />
                        </span>
                        <span className="font-display text-xl font-black tracking-tight">
                            bincycle
                            <span className="text-[#C45B38]">.</span>{" "}
                            <span className="font-mono-label text-[10px] text-[#F7F5F0]/60 ml-1 align-middle">
                                CONSOLE
                            </span>
                        </span>
                    </div>
                </header>

                <div>
                    <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                        [ operations sign-in ]
                    </p>
                    <h1 className="mt-4 font-display font-black tracking-tighter text-4xl">
                        Run the
                        <br />
                        <span className="italic font-medium text-[#C45B38]">
                            console.
                        </span>
                    </h1>
                    <p className="mt-3 text-[#F7F5F0]/70 text-sm leading-relaxed">
                        Admin-only. Use the credentials issued by your
                        operations manager.
                    </p>

                    <form
                        onSubmit={submit}
                        data-testid="admin-login-form"
                        noValidate
                        className="mt-8 space-y-5"
                    >
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                Email
                            </Label>
                            <div className="relative mt-2">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F7F5F0]/40"
                                />
                                <Input
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    data-testid="admin-login-email"
                                    placeholder="admin@bincycle.in"
                                    aria-invalid={!!errors.email}
                                    className={`h-12 rounded-sm bg-[#F7F5F0]/5 pl-10 text-[#F7F5F0] placeholder:text-[#F7F5F0]/30 focus-visible:ring-[#C45B38] ${
                                        errors.email
                                            ? "border-[#C45B38]"
                                            : "border-[#F7F5F0]/20"
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-[#C45B38]">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                Password
                            </Label>
                            <div className="relative mt-2">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F7F5F0]/40"
                                />
                                <Input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    data-testid="admin-login-password"
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                    className={`h-12 rounded-sm bg-[#F7F5F0]/5 pl-10 text-[#F7F5F0] placeholder:text-[#F7F5F0]/30 focus-visible:ring-[#C45B38] ${
                                        errors.password
                                            ? "border-[#C45B38]"
                                            : "border-[#F7F5F0]/20"
                                    }`}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-[#C45B38]">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="rounded-sm border border-dashed border-[#F7F5F0]/15 bg-[#F7F5F0]/5 p-3">
                            <p className="font-mono-label text-[10px] text-[#F7F5F0]/40 mb-1">
                                Demo credentials
                            </p>
                            <p className="font-mono-label text-[11px] text-[#F7F5F0]/80">
                                {ADMIN_DEMO.email} ·{" "}
                                <span className="text-[#C45B38]">
                                    {ADMIN_DEMO.password}
                                </span>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            data-testid="admin-login-submit"
                            className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#C45B38] text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] disabled:opacity-60 transition-colors"
                        >
                            {pending ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center font-mono-label text-[10px] text-[#F7F5F0]/40">
                    Bincycle operations console · v1.0
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
