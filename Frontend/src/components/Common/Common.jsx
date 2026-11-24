
import React from "react";
import { Search, X, MoreVertical } from "lucide-react";
import "./Common.css";

function SearchField({ value, onChange, onClear, placeholder }) {
    return (
        <div className="common-search-box">
            <Search
                size={18}
                className="common-search-icon"
            />

            <input
                type="text"
                className="common-search-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />

            {value && onClear && (
                <button
                    type="button"
                    className="common-search-clear"
                    onClick={onClear}
                    aria-label="Clear search"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}

export function PMSSearch({
    value,
    onChange,
    placeholder = "Search",
}) {
    return (
        <SearchField
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    );
}

export default function CommonSearch({
    search,
    setSearch,
    placeholder = "Search..."
}) {
    return (
        <SearchField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
            placeholder={placeholder}
        />
    );
}

export function PMSActionButton({ onClick }) {
    return (
        <button
            type="button"
            className="pms-action-button"
            onClick={onClick}
            aria-label="Actions"
        >
            <MoreVertical size={18} />
        </button>
    );
}

// Reusable PMS page header
export function PMSPageHeader({
    title,
    subtitle,
    buttonText,
    buttonIcon,
    onButtonClick,
}) {
    return (
        <div className="pms-page-header">
            <div className="pms-page-header-title">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>

            {buttonText && (
                <button
                    type="button"
                    className="pms-page-header-button"
                    onClick={onButtonClick}
                >
                    {buttonIcon}
                    <span>{buttonText}</span>
                </button>
            )}
        </div>
    );
}
