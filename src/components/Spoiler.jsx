import { useState } from "react";

export default function Spoiler({ children }) {
    const [open, setOpen] = useState(false);

    const baseStyle = {
        padding: "2px 6px",
        borderRadius: "4px",
        cursor: "pointer",
        margin: "0 2px",
        display: "inline-block",
        transition: "all 0.15s ease-in-out",
        fontWeight: 500,
        fontSize: "0.95em",
    };

    if (open) {
        // Revealed state: show actual spoiler text
        return (
        <span
            onClick={() => setOpen(false)}
            style={{
            ...baseStyle,
            backgroundColor: "#eee",
            color: "#222",
            }}
        >
            {children}
        </span>
        );
    }

    // Hidden state: show a clear label, NOT a black bar
    return (
        <span
        onClick={() => setOpen(true)}
        style={{
            ...baseStyle,
            backgroundColor: "#222",
            color: "#fff",
        }}
        >
        Spoiler (click to reveal)
        </span>
    );
}
