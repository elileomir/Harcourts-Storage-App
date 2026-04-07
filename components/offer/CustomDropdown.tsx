"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    /** Width class — e.g. "w-32", "w-44" */
    width?: string;
    /** Opens upward instead of downward */
    openUp?: boolean;
    hasError?: boolean;
}

export function CustomDropdown({
    value,
    options,
    onChange,
    placeholder = "Select",
    icon,
    className = "",
    width = "w-44",
    openUp = false,
    hasError = false,
}: CustomDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedOption = options.find((o) => o.value === value);
    const displayLabel = selectedOption?.label || placeholder;

    return (
        <div ref={ref} className={`relative flex-shrink-0 ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 h-[46px] px-3 rounded-lg border bg-white text-sm font-medium transition-colors cursor-pointer ${width} ${hasError
                    ? "border-red-500 text-red-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
            >
                {icon && <span className="flex-shrink-0 text-gray-400">{icon}</span>}
                <span className="flex-1 text-left truncate">{displayLabel}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div
                    className={`absolute right-0 ${openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                        } ${width} min-w-max bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-fade-in`}
                >
                    <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                        {options.map((opt, idx) => (
                            <button
                                key={`${idx}-${opt.value}`}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${value === opt.value
                                    ? "text-harcourts-blue font-semibold bg-harcourts-blue/5"
                                    : "text-gray-700"
                                    }`}
                            >
                                <span className="flex-1 truncate">{opt.label}</span>
                                {value === opt.value && (
                                    <Check className="w-3.5 h-3.5 text-harcourts-blue flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
