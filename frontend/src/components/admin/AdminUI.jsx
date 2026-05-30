// Shared building blocks for the admin pages: page header, stat card, chips, empty state.
import { ChevronRight } from "lucide-react";
import { ADMIN_STATUS } from "@/lib/adminMock";

export const AdminPageHeader = ({ eyebrow, title, description, actions }) => (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
            <p className="font-mono-label text-xs text-[#596155]">
                {eyebrow}
            </p>
            <h1 className="mt-2 font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#121710]">
                {title}
            </h1>
            {description && (
                <p className="mt-2 text-sm text-[#596155] max-w-2xl">
                    {description}
                </p>
            )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
    </header>
);

export const StatCard = ({ label, value, suffix, accent, testid }) => (
    <div
        data-testid={testid}
        className="bg-white p-5 sm:p-6 border border-[#D1CDBC] rounded-sm"
    >
        <p className="font-mono-label text-[10px] text-[#596155]">{label}</p>
        <p
            className={`mt-2 font-display text-3xl sm:text-4xl font-black tracking-tighter ${
                accent || "text-[#121710]"
            }`}
        >
            {value}
            {suffix && (
                <span className="text-sm text-[#596155] font-normal ml-1.5">
                    {suffix}
                </span>
            )}
        </p>
    </div>
);

export const StatusChip = ({ status, testid }) => {
    const meta = ADMIN_STATUS[status] || ADMIN_STATUS.scheduled;
    return (
        <span
            data-testid={testid}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-label text-[10px] ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

export const EmptyState = ({ title, body, action }) => (
    <div className="rounded-sm border border-dashed border-[#D1CDBC] bg-white p-10 text-center">
        <p className="font-display text-lg font-bold tracking-tight text-[#121710]">
            {title}
        </p>
        {body && (
            <p className="mt-1.5 text-sm text-[#596155] max-w-md mx-auto">
                {body}
            </p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);

export const SectionCard = ({ title, action, children, testid }) => (
    <section
        data-testid={testid}
        className="rounded-sm border border-[#D1CDBC] bg-white p-5 sm:p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold tracking-tight text-[#121710]">
                {title}
            </h3>
            {action}
        </div>
        {children}
    </section>
);

export const RowLink = ({ to, children, testid }) => (
    <a
        href={to}
        data-testid={testid}
        className="group flex items-center justify-between gap-4 rounded-sm border border-[#D1CDBC] bg-white p-3.5 hover:-translate-y-0.5 hover:border-[#121710] transition-all"
    >
        <div className="min-w-0 flex-1">{children}</div>
        <ChevronRight
            size={14}
            className="text-[#596155] shrink-0 transition-transform group-hover:translate-x-0.5"
        />
    </a>
);
