import React from "react";
import { Search, Plus, MoreVertical } from "lucide-react";
import "./Common.css";


/* ================================
   PAGE HEADER
================================ */

export const PMSPageHeader = ({
    title,
    subtitle,
    buttonText,
    onButtonClick,
    buttonIcon = <Plus size={16} />,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search",
}) => {
    return (
        <div className="pms-page-header">

            <div className="pms-page-header-left">
                <h1 className="pms-page-title">
                    {title}
                </h1>

                {subtitle && (
                    <p className="pms-page-subtitle">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="pms-page-header-right">

                {onSearchChange && (
                    <PMSSearch
                        value={searchValue}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                )}

                {buttonText && (
                    <button
                        type="button"
                        className="pms-primary-button"
                        onClick={onButtonClick}
                    >
                        {buttonIcon}
                        {buttonText}
                    </button>
                )}

            </div>

        </div>
    );
};

/* ================================
   SEARCH
================================ */

export const PMSSearch = ({
    value,
    onChange,
    placeholder = "Search",
}) => {
    return (
        <div className="pms-search">

            <Search size={16} />

            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />

        </div>
    );
};


/* ================================
   ACTION BUTTON
================================ */

export const PMSActionButton = ({ onClick }) => {
    return (
        <button
            type="button"
            className="pms-action-button"
            onClick={onClick}
        >
            <MoreVertical size={18} />
        </button>
    );
};