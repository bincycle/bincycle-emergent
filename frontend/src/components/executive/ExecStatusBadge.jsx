import { EXEC_STATUS } from "@/lib/executiveMock";

export const ExecStatusBadge = ({ status, size = "sm" }) => {
    const meta = EXEC_STATUS[status] || EXEC_STATUS.assigned;
    const pad = size === "lg" ? "px-2.5 py-1" : "px-2 py-0.5";
    const text = size === "lg" ? "text-[11px]" : "text-[10px]";
    return (
        <span
            data-testid={`exec-status-${status}`}
            className={`inline-flex items-center gap-1.5 rounded-sm border font-mono-label ${pad} ${text} ${meta.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
};

export default ExecStatusBadge;
