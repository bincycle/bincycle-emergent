import { useState } from "react";
import { Copy, Share2, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { referralInfo } from "@/lib/mockPickups";

export const ReferralCard = () => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(referralInfo.code);
            setCopied(true);
            toast.success("Referral code copied.");
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Couldn't copy — long-press to copy manually.");
        }
    };

    const share = async () => {
        const shareData = {
            title: "Refer Bincycle",
            text: `Use my code ${referralInfo.code} for ₹${referralInfo.perFriend} off your first Bincycle pickup.`,
            url: "https://bincycle.in/refer",
        };
        try {
            if (typeof navigator.share === "function") {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    `${shareData.text} ${shareData.url}`
                );
                toast.success("Invite copied — paste it anywhere.");
            }
        } catch {
            /* user cancelled */
        }
    };

    return (
        <section
            data-testid="overview-referral-card"
            className="relative overflow-hidden rounded-sm border border-[#D1CDBC] bg-[#171A15] text-[#F7F5F0] p-6 sm:p-7"
        >
            <span
                aria-hidden
                className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#C45B38]/20 blur-3xl"
            />
            <div className="relative">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#C45B38] text-[#F7F5F0]">
                    <Gift size={16} />
                </div>
                <h3 className="mt-4 font-display text-2xl font-black tracking-tighter">
                    Refer a friend,
                    <br />
                    earn{" "}
                    <span className="text-[#C45B38]">
                        ₹{referralInfo.perFriend} off.
                    </span>
                </h3>
                <p className="mt-3 text-sm text-[#F7F5F0]/70">
                    Share your code below. When a friend books their first
                    pickup, you both get ₹{referralInfo.perFriend} off your
                    next one.
                </p>

                <div
                    data-testid="referral-code-row"
                    className="mt-5 flex items-center gap-2 rounded-sm border border-[#F7F5F0]/20 bg-[#F7F5F0]/5 p-2"
                >
                    <p
                        className="flex-1 font-display text-2xl font-black tracking-widest text-[#F7F5F0] pl-2"
                        data-testid="referral-code"
                    >
                        {referralInfo.code}
                    </p>
                    <button
                        type="button"
                        onClick={copy}
                        data-testid="referral-copy-btn"
                        className="inline-flex items-center gap-1.5 rounded-sm bg-[#F7F5F0] px-3 py-2 text-xs font-medium text-[#121710] hover:bg-[#EDE9DC] transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={12} /> Copied
                            </>
                        ) : (
                            <>
                                <Copy size={12} /> Copy
                            </>
                        )}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={share}
                    data-testid="referral-share-btn"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#C45B38] px-4 py-2.5 text-sm font-medium text-[#F7F5F0] hover:bg-[#A64A2B] transition-colors"
                >
                    <Share2 size={14} /> Share invite
                </button>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#F7F5F0]/15 pt-5">
                    <div>
                        <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                            Friends joined
                        </p>
                        <p
                            className="mt-1 font-display text-2xl font-black tracking-tighter"
                            data-testid="referral-friends-count"
                        >
                            {referralInfo.friendsJoined}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono-label text-[10px] text-[#F7F5F0]/60">
                            Earned so far
                        </p>
                        <p
                            className="mt-1 font-display text-2xl font-black tracking-tighter text-[#C45B38]"
                            data-testid="referral-earned-amount"
                        >
                            ₹{referralInfo.earnedTotal}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReferralCard;
