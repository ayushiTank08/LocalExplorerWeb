"use client";

import React, { useState, useRef, useEffect } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "Select an option",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (option: DropdownOption) => {
    setSelectedLabel(option.label);
    setIsOpen(false);
    onSelect(option.value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-[200px]">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full p-3 items-center gap-2 rounded bg-[var(--color-background)] bg-opacity-80 cursor-pointer"
      >
        <div className="flex-1 text-black font-body text-sm font-normal">
          {selectedLabel || placeholder}
        </div>
        <img src="/assets/Icons/Down-Arrow.svg" alt="Dropdown Arrow" className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[var(--color-background)] rounded shadow-md z-50">
          {options.map((option) => {
            const isSelected = selectedLabel === option.label;
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="group px-4 py-2 mt-2 text-sm text-black cursor-pointer flex items-center gap-3"
              >
                <span className="group-hover:translate-x-2 transition-transform duration-200">
                  {option.label}
                </span>
                <img
                  src="/assets/Icons/Check.svg"
                  alt="Selected"
                  className={`w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 ${isSelected ? "opacity-100" : ""
                    } transition-opacity duration-200`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
