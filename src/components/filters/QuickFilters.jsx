import {
    GENRE_OPTIONS,
    SEASON_OPTIONS,
    FORMAT_OPTIONS,
    getYearOptions,
} from "../../filtersConfig.js";

export default function QuickFilters({
    filters,
    onChange,
    onToggleAdvanced,
    advancedOpen,
}) {
    const years = getYearOptions();

    const handle = (field) => (e) => {
        onChange({ [field]: e.target.value });
    };

    const fillCurrentSeason = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let season = "WINTER";
        if (month >= 4 && month <= 6) season = "SPRING";
        else if (month >= 7 && month <= 9) season = "SUMMER";
        else if (month >= 10 && month <= 12) season = "FALL";
        onChange({ year: String(year), season });
    };

    return (
        <div className="mb-3">
            <div className="row g-2 align-items-end">
                <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">Genres</label>
                    <select
                        className="form-select"
                        value={filters.genre}
                        onChange={handle("genre")}
                    >
                        <option value="">Any</option>
                        {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">Year</label>
                    <select
                        className="form-select"
                        value={filters.year}
                        onChange={handle("year")}
                    >
                        {years.map((y) => (
                        <option key={y.value} value={y.value}>
                            {y.label}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label fw-semibold mb-0">Season</label>
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0"
                            onClick={fillCurrentSeason}
                        >
                            Current
                        </button>
                    </div>
                    <select
                        className="form-select"
                        value={filters.season}
                        onChange={handle("season")}
                    >
                        {SEASON_OPTIONS.map((s) => (
                        <option key={s.value || "ANY"} value={s.value}>
                            {s.label}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">Format</label>
                    <select
                        className="form-select"
                        value={filters.format}
                        onChange={handle("format")}
                    >
                        {FORMAT_OPTIONS.map((f) => (
                        <option key={f.value || "ANY"} value={f.value}>
                            {f.label}
                        </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-2 d-flex justify-content-end">
                <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onToggleAdvanced}
                >
                    {advancedOpen ? "Hide advanced filters" : "Show advanced filters"}
                </button>
            </div>
        </div>
    );
}
