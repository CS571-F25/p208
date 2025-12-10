import { SORT_OPTIONS } from "../../filtersConfig.js";

export default function SortControls({ value, onChange }) {
    return (
        <div className="d-flex justify-content-end align-items-center mb-3">
            <span className="me-2 text-muted">Sort by</span>
            <select
                className="form-select form-select-sm"
                style={{ maxWidth: "220px" }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}