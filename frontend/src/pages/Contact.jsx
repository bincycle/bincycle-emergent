import { useState } from "react";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SectionReveal from "@/components/SectionReveal";

const offices = [
    {
        city: "Bengaluru — HQ",
        addr: "WeWork Galaxy, 43 Residency Rd, Bengaluru 560025",
    },
    { city: "Mumbai", addr: "BKC Annex, Bandra-Kurla Complex, Mumbai 400051" },
    { city: "Gurugram", addr: "Two Horizon Centre, Sector 43, Gurugram 122002" },
];

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        topic: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in name, email and message.");
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            setForm({ name: "", email: "", topic: "", message: "" });
            toast.success("Message sent — we'll write back within 24 hours.");
        }, 800);
    };

    const onChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div data-testid="contact-page">
            <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
                <SectionReveal>
                    <p className="font-mono-label text-xs text-[#596155]">
                        [ contact ]
                    </p>
                </SectionReveal>
                <SectionReveal delay={0.05}>
                    <h1 className="mt-5 max-w-4xl font-display font-black tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#121710]">
                        Say hi. We{" "}
                        <span className="italic font-medium text-[#284226]">
                            actually
                        </span>{" "}
                        reply.
                    </h1>
                </SectionReveal>
                <SectionReveal delay={0.1}>
                    <p className="mt-6 max-w-2xl text-lg text-[#596155] leading-relaxed">
                        Whether it's a missed pickup, a press request, or you
                        just want to bring Bincycle to your city — start here.
                    </p>
                </SectionReveal>
            </section>

            <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24 grid gap-12 lg:grid-cols-12">
                <SectionReveal className="lg:col-span-7">
                    <form
                        onSubmit={onSubmit}
                        data-testid="contact-form"
                        className="rounded-sm border border-[#D1CDBC] bg-white p-6 sm:p-10"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="font-mono-label text-xs text-[#596155]"
                                >
                                    Your name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    data-testid="contact-input-name"
                                    placeholder="Aanya R."
                                    className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                                />
                            </div>
                            <div className="space-y-2">
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
                                    value={form.email}
                                    onChange={onChange}
                                    data-testid="contact-input-email"
                                    placeholder="you@email.com"
                                    className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                                />
                            </div>
                        </div>
                        <div className="mt-5 space-y-2">
                            <Label
                                htmlFor="topic"
                                className="font-mono-label text-xs text-[#596155]"
                            >
                                Topic
                            </Label>
                            <Input
                                id="topic"
                                name="topic"
                                value={form.topic}
                                onChange={onChange}
                                data-testid="contact-input-topic"
                                placeholder="Society onboarding / billing / press / something else"
                                className="h-12 rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                            />
                        </div>
                        <div className="mt-5 space-y-2">
                            <Label
                                htmlFor="message"
                                className="font-mono-label text-xs text-[#596155]"
                            >
                                Message
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={onChange}
                                data-testid="contact-input-message"
                                rows={6}
                                placeholder="Tell us what's on your mind..."
                                className="rounded-sm border-[#D1CDBC] focus-visible:ring-[#284226]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            data-testid="contact-submit-btn"
                            className="mt-7 group inline-flex items-center gap-2 rounded-sm bg-[#284226] px-6 py-3.5 text-base font-medium text-[#F7F5F0] transition-colors hover:bg-[#1C2E1A] disabled:opacity-60"
                        >
                            {submitting ? "Sending..." : "Send message"}
                            <ArrowUpRight
                                size={18}
                                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </button>
                    </form>
                </SectionReveal>

                <SectionReveal delay={0.1} className="lg:col-span-5 space-y-8">
                    <div>
                        <p className="font-mono-label text-xs text-[#596155]">
                            [ reach us directly ]
                        </p>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail
                                    size={18}
                                    className="text-[#284226] mt-0.5"
                                />
                                <div>
                                    <p className="text-sm text-[#596155]">
                                        Email
                                    </p>
                                    <a
                                        href="mailto:hello@bincycle.in"
                                        data-testid="contact-email"
                                        className="text-[#121710] font-medium hover:text-[#C45B38]"
                                    >
                                        hello@bincycle.in
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone
                                    size={18}
                                    className="text-[#284226] mt-0.5"
                                />
                                <div>
                                    <p className="text-sm text-[#596155]">
                                        Support
                                    </p>
                                    <a
                                        href="tel:+918012345678"
                                        data-testid="contact-phone"
                                        className="text-[#121710] font-medium hover:text-[#C45B38]"
                                    >
                                        +91 80 1234 5678
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#D1CDBC]">
                        <p className="font-mono-label text-xs text-[#596155]">
                            [ offices ]
                        </p>
                        <ul className="mt-5 space-y-5">
                            {offices.map((o) => (
                                <li
                                    key={o.city}
                                    className="flex items-start gap-3"
                                >
                                    <MapPin
                                        size={18}
                                        className="text-[#284226] mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-display text-base font-bold text-[#121710]">
                                            {o.city}
                                        </p>
                                        <p className="text-sm text-[#596155] leading-relaxed mt-1">
                                            {o.addr}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </SectionReveal>
            </section>
        </div>
    );
};

export default Contact;
