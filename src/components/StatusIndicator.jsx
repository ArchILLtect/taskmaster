import React, { useEffect, useState } from "react";
import "../styles/header.css";
import { useApp } from "../contexts/AppContext";

const StatusIndicator = ({ type = "dot" }) => {
    const [showDot, setShowDot] = useState(true);
    const [showText, setShowText] = useState(false);
    const { status, setStatus } = useApp();

    // Simplify logic with a direct mapping
    useEffect(() => {
        const visibilityMap = {
            both: { showDot: true, showText: true },
            dot: { showDot: true, showText: false },
            text: { showDot: false, showText: true },
        };

        const visibility = visibilityMap[type] || visibilityMap.both;
        setShowDot(visibility.showDot);
        setShowText(visibility.showText);
    }, [type]);

    // Simulate persisting the status (e.g., API call)
    const updateStatus = async (newStatus) => {
        try {
            // Make API call here to update status in the backend
            console.log(`Updating status to: ${newStatus}`);
            setStatus(newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const toggleStatus = () => {
        const nextStatus =
            status === "online" ? "away" : status === "away" ? "offline" : "online";
        updateStatus(nextStatus);
    };

    // Map status to CSS classes
    const statusClass =
        status === "online"
            ? "status-online"
            : status === "away"
            ? "status-away"
            : "status-offline";

    return (
        <div
            className="status-container flex items-center"
            onClick={toggleStatus}
            title={`Current status: ${status}`}
        >
            {showDot && (
                <div
                    className={`status-indicator border-[1.5px] border-gray-800 ${statusClass}`}
                />
            )}
            {showText && (
                <span className="ml-2 text-gray-800 dark:text-gray-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            )}
        </div>
    );
};

export default StatusIndicator;