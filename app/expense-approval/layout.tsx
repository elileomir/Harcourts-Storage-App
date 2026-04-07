import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Expense Approval | Harcourts",
    description:
        "Authorise Harcourts to collect and process payments of council rates, water and land tax bills on your behalf.",
};

export default function ExpenseApprovalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-28 sm:w-36 h-8">
                            <Image
                                src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                                alt="Harcourts"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="hidden sm:flex items-center">
                            <div className="w-px h-6 bg-gray-200 mx-3" />
                            <span className="text-teal-600 font-semibold text-sm tracking-tight">
                                Expense Approval
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Secure Form</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
                <div className="max-w-4xl mx-auto px-4">
                    <p>
                        &copy; {new Date().getFullYear()} Harcourts International. All
                        rights reserved.
                    </p>
                    <p className="mt-1">
                        This form is securely processed and your information is handled
                        in accordance with our privacy policy.
                    </p>
                </div>
            </footer>
        </div>
    );
}
