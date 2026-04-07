import { useState, useRef, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Fuse from "fuse.js";
import { MapPin } from "lucide-react";
import { allSuburbs, type SuburbData } from "@/lib/saa/suburbs";

interface SuburbAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suburb: SuburbData) => void;
  error?: boolean; // To style it red if valid/invalid check is needed later
}

export function SuburbAutocomplete({
  value,
  onChange,
  onSelect,
  error,
}: SuburbAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<SuburbData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js
  const fuse = useRef(
    new Fuse(allSuburbs, {
      keys: ["suburb", "postcode"],
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
    }),
  );

  // Handle value changes
  useEffect(() => {
    // Only search if the user is typing (we could add a 'isTyping' state or similar,
    // but simply checking if the dropdown is open/should be open is often enough).
    // Here we search whenever value changes, provided it's long enough.
    if (value.length >= 2) {
      const searchResults = fuse.current.search(value, { limit: 8 });
      setResults(searchResults.map((r) => r.item));
    } else {
      setResults([]);
    }
  }, [value]);

  // Handle focus/blur and clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelection(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSelection = (suburb: SuburbData) => {
    onSelect(suburb);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Move focus to next field? Or keep it here?
    // Usually better to keep focus or let user tab away.
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id="property-suburb" // ID matches the label in parent
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.length >= 2) setShowSuggestions(true);
        }}
        placeholder="Ulverstone"
        className={`input-field ${
          error ? "border-red-500 focus:ring-red-500" : ""
        }`}
        autoComplete="off"
      />

      {/* Suggestion Dropdown */}
      {showSuggestions && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((item, index) => (
            <button
              key={`${item.suburb}-${item.postcode}-${index}`}
              type="button"
              onClick={() => handleSelection(item)}
              className={`
                w-full px-4 py-3 text-left flex items-center gap-3 
                hover:bg-blue-50 transition-colors
                ${selectedIndex === index ? "bg-blue-50" : ""}
                ${
                  index !== results.length - 1 ? "border-b border-gray-100" : ""
                }
              `}
            >
              <MapPin className="w-4 h-4 text-harcourts-blue flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {item.suburb}
                </div>
                <div className="text-xs text-gray-500">
                  {item.state} {item.postcode}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
