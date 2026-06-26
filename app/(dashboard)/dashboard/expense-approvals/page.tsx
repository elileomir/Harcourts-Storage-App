"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Droplets,
    FileText,
    MapPin,
    Clock,
    Search,
    Loader2,
    BarChart3,
    Download,
    Trash2,
    Eye,
    X,
    Building2,
    User,
    Users,
    Shield,
    ExternalLink,
    Landmark,
    Receipt,
    Plus,
    Paperclip,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";

// ============================================
// Types
// ============================================
interface ExpenseApprovalRow {
    id: string;
    status: string;
    form_data: ExpenseApprovalFormData;
    owner_name: string;
    property_address: string;
    services_selected: string[] | string | null;
    docusign_url: string | null;
    submitter_email: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================
// Helpers
// ============================================
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getServiceLabel(service: string): string {
    const labels: Record<string, string> = {
        councilRates: "Council Rates",
        council_rates: "Council Rates",
        landTax: "Land Tax",
        land_tax: "Land Tax",
        taswater: "TasWater",
    };
    return labels[service] || service;
}

function getServiceColor(service: string): string {
    if (service.toLowerCase().includes("council")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (service.toLowerCase().includes("land") || service.toLowerCase().includes("tax")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (service.toLowerCase().includes("taswater") || service.toLowerCase().includes("water")) return "bg-cyan-50 text-cyan-700 border-cyan-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
}

function getOwnershipIconElement(structure: string, className: string) {
    switch (structure) {
        case "Company": return <Building2 className={className} />;
        case "Trust": return <Shield className={className} />;
        default: return <User className={className} />;
    }
}

// ============================================
// Stat Card
// ============================================
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-[#001F49] mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// Approval Card
// ============================================
function ApprovalCard({
    approval,
    onView,
    onDelete,
}: {
    approval: ExpenseApprovalRow;
    onView: (approval: ExpenseApprovalRow) => void;
    onDelete: (approval: ExpenseApprovalRow) => void;
}) {
    const fd = approval.form_data;
    
    // services_selected may be null, string, JSON string, or array — normalize
    const rawServices = approval.services_selected;
    let servicesArr: string[] = [];
    if (Array.isArray(rawServices)) {
        servicesArr = rawServices;
    } else if (typeof rawServices === "string") {
        try { servicesArr = JSON.parse(rawServices); } catch { servicesArr = [rawServices]; }
        if (!Array.isArray(servicesArr)) servicesArr = [];
    }

    // Fallback: derive from form_data booleans
    const resolvedServices = servicesArr.length > 0
        ? servicesArr
        : [
            fd?.councilRates && "councilRates",
            fd?.landTax && "landTax",
            fd?.taswater && "taswater",
        ].filter((s): s is string => typeof s === "string");

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex-shrink-0 flex items-center justify-center">
                        {getOwnershipIconElement(fd?.ownershipStructure || "Individual", "w-5 h-5 text-teal-600")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#001F49] truncate text-sm">
                            {approval.owner_name || "Unknown Owner"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {approval.property_address || "No address"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(approval.created_at)}
                            </span>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {resolvedServices.map((s) => (
                                <span
                                    key={s}
                                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getServiceColor(s)}`}
                                >
                                    {getServiceLabel(s)}
                                </span>
                            ))}
                            {resolvedServices.length === 0 && (
                                <span className="text-[10px] text-gray-300 italic">No services selected</span>
                            )}
                        </div>

                        {/* Ownership info */}
                        {fd?.ownershipStructure && fd.ownershipStructure !== "Individual" && (
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                {fd.ownershipStructure === "Company" && fd.companyName
                                    ? `Company: ${fd.companyName}`
                                    : fd.ownershipStructure === "Trust" && fd.trustName
                                        ? `Trust: ${fd.trustName}`
                                        : fd.ownershipStructure}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(approval); }}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="View details"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(approval); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ============================================
// Detail Drawer
// ============================================
function DetailDrawer({
    approval,
    onClose,
}: {
    approval: ExpenseApprovalRow | null;
    onClose: () => void;
}) {
    if (!approval) return null;

    const fd = approval.form_data;
    const owners = fd?.owners || [];

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-lg bg-white shadow-2xl h-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
                    <div>
                        <h2 className="text-lg font-bold text-[#001F49]">
                            {approval.owner_name || "Expense Approval"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(approval.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto overflow-x-hidden space-y-6 flex-1">
                    {/* Property Details */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal-500" />
                            Property Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">Address</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{approval.property_address || "—"}</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">Suburb</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd?.propertySuburb || "—"}</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">State</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd?.propertyState || "—"}</span>
                            </div>
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">Postcode</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd?.propertyPostcode || "—"}</span>
                            </div>
                            {fd?.propertyPID && (
                                <div className="grid grid-cols-3 text-gray-500">
                                    <span className="col-span-1 border-r border-gray-100">PID</span>
                                    <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.propertyPID}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Services */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-teal-500" />
                            Services Selected
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {fd?.councilRates && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-semibold">
                                    <Landmark className="w-3.5 h-3.5" /> Council Rates
                                </span>
                            )}
                            {fd?.landTax && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-semibold">
                                    <Receipt className="w-3.5 h-3.5" /> Land Tax
                                </span>
                            )}
                            {fd?.taswater && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg border border-cyan-200 text-xs font-semibold">
                                    <Droplets className="w-3.5 h-3.5" /> TasWater
                                </span>
                            )}
                            {!fd?.councilRates && !fd?.landTax && !fd?.taswater && (
                                <p className="text-sm text-gray-400 italic">No services selected</p>
                            )}
                        </div>
                    </section>

                    {/* Ownership */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-teal-500" />
                            Ownership Details
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">Structure</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd?.ownershipStructure || "Individual"}</span>
                            </div>
                            {fd?.companyName && (
                                <div className="grid grid-cols-3 text-gray-500">
                                    <span className="col-span-1 border-r border-gray-100">Company</span>
                                    <span className="col-span-2 pl-3 text-gray-900 font-medium">
                                        {fd.companyName} {fd.companyACN && `(ACN: ${fd.companyACN})`}
                                    </span>
                                </div>
                            )}
                            {fd?.trustName && (
                                <div className="grid grid-cols-3 text-gray-500">
                                    <span className="col-span-1 border-r border-gray-100">Trust</span>
                                    <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.trustName}</span>
                                </div>
                            )}

                            {/* Owners */}
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 font-medium mb-2 uppercase">Owners</p>
                                <div className="space-y-2">
                                    {owners.slice(0, fd?.ownerCount || 1).map((owner, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="font-semibold text-gray-900">{owner.fullName || `Owner ${i + 1}`}</p>
                                            <p className="text-xs text-gray-500">
                                                {owner.email && <>{owner.email} • </>}
                                                {owner.mobileCountryCode || "+61"} {owner.mobileNumber}
                                            </p>
                                            {(owner.street || owner.suburb) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {[owner.street, owner.suburb, owner.state, owner.postcode].filter(Boolean).join(", ")}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TasWater Details */}
                    {fd?.taswater && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-cyan-500" />
                                TasWater Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                {fd.taswaterAccountNo && (
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Account No</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.taswaterAccountNo}</span>
                                    </div>
                                )}
                                {fd.taswaterAccountName && (
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Account Name</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.taswaterAccountName}</span>
                                    </div>
                                )}
                                {fd.taswaterAuthorityLevel && (
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Authority Level</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">Level {fd.taswaterAuthorityLevel}</span>
                                    </div>
                                )}
                                {fd.taswaterSettlementDate && (
                                    <div className="grid grid-cols-3 text-gray-500">
                                        <span className="col-span-1 border-r border-gray-100">Settlement Date</span>
                                        <span className="col-span-2 pl-3 text-gray-900 font-medium">{fd.taswaterSettlementDate}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Uploaded Files */}
                    {(fd?.asicRegisterFileName || fd?.trustScheduleFileName) && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-teal-500" />
                                Uploaded Documents
                            </h3>
                            <div className="space-y-2">
                                {fd.asicRegisterFileName && (
                                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{fd.asicRegisterFileName}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">ASIC Register</p>
                                        </div>
                                        {fd.asicRegisterFileBase64 && (
                                            <a
                                                href={fd.asicRegisterFileBase64}
                                                download={fd.asicRegisterFileName}
                                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                )}
                                {fd.trustScheduleFileName && (
                                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{fd.trustScheduleFileName}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Trust Schedule</p>
                                        </div>
                                        {fd.trustScheduleFileBase64 && (
                                            <a
                                                href={fd.trustScheduleFileBase64}
                                                download={fd.trustScheduleFileName}
                                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* DocuSign URL */}
                    {approval.docusign_url && (
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-indigo-500" />
                                DocuSign
                            </h3>
                            <a
                                href={approval.docusign_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 text-sm font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open DocuSign Envelope
                            </a>
                        </section>
                    )}

                    {/* Meta */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Submission Info
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 text-gray-500">
                                <span className="col-span-1 border-r border-gray-100">Submitted</span>
                                <span className="col-span-2 pl-3 text-gray-900 font-medium">{formatDate(approval.created_at)}</span>
                            </div>
                            {approval.submitter_email && (
                                <div className="grid grid-cols-3 text-gray-500">
                                    <span className="col-span-1 border-r border-gray-100">Email</span>
                                    <span className="col-span-2 pl-3 text-gray-900 font-medium break-all">{approval.submitter_email}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Main Page
// ============================================
export default function ExpenseApprovalsDashboard() {
    const [approvals, setApprovals] = useState<ExpenseApprovalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApproval, setSelectedApproval] = useState<ExpenseApprovalRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ExpenseApprovalRow | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch approvals
    const fetchApprovals = useCallback(async () => {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from("landlord_expense_approvals")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching expense approvals:", error);
            setLoading(false);
            return;
        }

        setApprovals((data as ExpenseApprovalRow[]) || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchApprovals();
    }, [fetchApprovals]);

    // Delete handler
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        try {
            const res = await fetch(`/api/expense-approval/delete?id=${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                console.error("Error deleting approval:", data.error);
                setDeleteTarget(null);
                setDeleting(false);
                return;
            }
        } catch (err) {
            console.error("Error deleting approval:", err);
            setDeleteTarget(null);
            setDeleting(false);
            return;
        }

        // Optimistic removal
        setApprovals((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
        setDeleting(false);
    };

    // Export
    const handleExport = () => {
        const headers = [
            "Owner Name",
            "Property Address",
            "Ownership Structure",
            "Services",
            "Status",
            "Email",
            "Submitted",
        ];

        const rows = filtered.map((a) => {
            const fd = a.form_data;
            const services = [fd?.councilRates && "Council Rates", fd?.landTax && "Land Tax", fd?.taswater && "TasWater"].filter(Boolean).join("; ");
            return [
                `"${a.owner_name || ""}"`,
                `"${a.property_address || ""}"`,
                `"${fd?.ownershipStructure || "Individual"}"`,
                `"${services}"`,
                `"${a.status}"`,
                `"${a.submitter_email || ""}"`,
                `"${new Date(a.created_at).toLocaleString()}"`,
            ];
        });

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `expense_approvals_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter
    const filtered = approvals.filter((a) => {
        const term = searchTerm.toLowerCase();
        return (
            !term ||
            (a.owner_name || "").toLowerCase().includes(term) ||
            (a.property_address || "").toLowerCase().includes(term) ||
            (a.submitter_email || "").toLowerCase().includes(term)
        );
    });

    // Stats
    const totalApprovals = filtered.length;
    const councilCount = filtered.filter((a) => a.form_data?.councilRates).length;
    const landTaxCount = filtered.filter((a) => a.form_data?.landTax).length;
    const taswaterCount = filtered.filter((a) => a.form_data?.taswater).length;


    return (
        <div className="max-w-6xl mx-auto pb-12 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                    Expense Approvals
                </h1>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-500 text-base">
                        View and manage all landlord expense approval submissions.
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/expense-approval"
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Approval
                        </Link>
                        <button
                            onClick={handleExport}
                            disabled={filtered.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Approvals"
                    value={String(totalApprovals)}
                    icon={BarChart3}
                    color="bg-teal-50 text-teal-600"
                />
                <StatCard
                    title="Council Rates"
                    value={String(councilCount)}
                    subtitle="approvals"
                    icon={Landmark}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Land Tax"
                    value={String(landTaxCount)}
                    subtitle="approvals"
                    icon={Receipt}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="TasWater"
                    value={String(taswaterCount)}
                    subtitle="approvals"
                    icon={Droplets}
                    color="bg-cyan-50 text-cyan-600"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by owner, property, or email..."
                        className="input-field-normal pl-10 text-sm"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    <span className="ml-2 text-gray-500">Loading approvals...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                        {searchTerm
                            ? "No approvals match your search"
                            : "No expense approvals submitted yet"}
                    </p>
                    {!searchTerm && (
                        <Link
                            href="/dashboard/expense-approval"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Approval
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((approval) => (
                        <ApprovalCard
                            key={approval.id}
                            approval={approval}
                            onView={setSelectedApproval}
                            onDelete={setDeleteTarget}
                        />
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                    <Landmark className="w-3 h-3 text-blue-500" /> Council Rates
                </span>
                <span className="flex items-center gap-1.5">
                    <Receipt className="w-3 h-3 text-amber-500" /> Land Tax
                </span>
                <span className="flex items-center gap-1.5">
                    <Droplets className="w-3 h-3 text-cyan-500" /> TasWater
                </span>
            </div>

            {/* Detail Drawer */}
            <DetailDrawer
                approval={selectedApproval}
                onClose={() => setSelectedApproval(null)}
            />

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Remove Approval</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to remove the expense approval for{" "}
                            <strong>{deleteTarget.owner_name || "this owner"}</strong> at{" "}
                            <strong>{deleteTarget.property_address || "this property"}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Remove
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
