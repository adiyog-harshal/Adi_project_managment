
import React from "react";
import { Search, X } from "lucide-react";
import "./Common.css";

// Reusable search component
export default function CommonSearch({
    search,
    setSearch,
    placeholder = "Search..."
}) {
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
                <button
                    type="button"
                    className="common-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                >
                    <X size={16} />
                </button>
            )}
        </div>
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
