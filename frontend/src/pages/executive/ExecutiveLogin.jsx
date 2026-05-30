import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Truck, IdCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signInExec } from "@/lib/executiveMock";

const ExecutiveLogin = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        empId: "EXEC-0042",
        pin: "",
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
        if (!form.empId.trim()) er.empId = "Employee ID is required.";
        if (!form.pin.trim()) er.pin = "PIN is required.";
        else if (!/^\d{4}$/.test(form.pin))
            er.pin = "4-digit PIN.";
        setErrors(er);
        if (Object.keys(er).length) return;
        setPending(true);
        setTimeout(() => {
            signInExec();
            setPending(false);
            toast.success("Welcome back, Vikram.");
            navigate("/executive");
        }, 800);
    };

    return (
        <div
            data-testid="exec-login-page"
            className="min-h-screen bg-[#171A15] text-[#F7F5F0]"
        >
            <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#C45B38] text-[#F7F5F0]">
                            <Truck size={16} />
                        </span>
                        <span className="font-display text-xl font-black tracking-tight">
                            bincycle
                            <span className="text-[#C45B38]">.</span>{" "}
                            <span className="font-mono-label text-[10px] text-[#F7F5F0]/60 ml-1">
                                PARTNER
                            </span>
                        </span>
                    </div>
                </header>

                <div>
                    <p className="font-mono-label text-xs text-[#F7F5F0]/60">
                        [ partner sign in ]
                    </p>
                    <h1 className="mt-4 font-display font-black tracking-tighter text-4xl">
                        Hello,
                        <br />
                        <span className="italic font-medium text-[#C45B38]">
                            partner.
                        </span>
                    </h1>
                    <p className="mt-3 text-[#F7F5F0]/70 text-sm leading-relaxed">
                        Use the credentials issued by your supervisor. Need
                        help? Ring the dispatch line.
                    </p>

                    <form
                        onSubmit={submit}
                        data-testid="exec-login-form"
                        noValidate
                        className="mt-8 space-y-5"
                    >
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                Employee ID
                            </Label>
                            <div className="relative mt-2">
                                <IdCard
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F7F5F0]/40"
                                />
                                <Input
                                    name="empId"
                                    value={form.empId}
                                    onChange={onChange}
                                    data-testid="exec-login-empid"
                                    placeholder="EXEC-0042"
                                    aria-invalid={!!errors.empId}
                                    className={`h-14 rounded-sm bg-[#F7F5F0]/5 pl-10 text-[#F7F5F0] placeholder:text-[#F7F5F0]/30 focus-visible:ring-[#C45B38] tracking-wider uppercase ${
                                        errors.empId
                                            ? "border-[#C45B38]"
                                            : "border-[#F7F5F0]/20"
                                    }`}
                                />
                            </div>
                            {errors.empId && (
                                <p className="mt-1.5 text-xs text-[#C45B38]">
                                    {errors.empId}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                                4-digit PIN
                            </Label>
                            <Input
                                name="pin"
                                value={form.pin}
                                onChange={onChange}
                                data-testid="exec-login-pin"
                                inputMode="numeric"
                                placeholder="••••"
                                maxLength={4}
                                aria-invalid={!!errors.pin}
                                className={`mt-2 h-14 rounded-sm bg-[#F7F5F0]/5 text-center text-2xl tracking-[1em] text-[#F7F5F0] placeholder:text-[#F7F5F0]/30 focus-visible:ring-[#C45B38] ${
                                    errors.pin
                                        ? "border-[#C45B38]"
                                        : "border-[#F7F5F0]/20"
                                }`}
                            />
                            {errors.pin && (
                                <p className="mt-1.5 text-xs text-[#C45B38]">
                                    {errors.pin}
                                </p>
                            )}
                            <p className="mt-2 font-mono-label text-[10px] text-[#F7F5F0]/40">
                                Demo: type any 4 digits to continue.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            data-testid="exec-login-submit"
                            className="w-full inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-[#C45B38] text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] disabled:opacity-60 transition-colors"
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
                    Bincycle partner app · v1.0
                </p>
            </div>
        </div>
    );
};

export default ExecutiveLogin;
