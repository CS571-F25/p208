import {
    MIN_SCORE_OPTIONS,
    POPULARITY_BUCKET_OPTIONS,
    EPISODE_RANGE_OPTIONS,
    DURATION_RANGE_OPTIONS,
    SOURCE_OPTIONS,
    COUNTRY_OPTIONS,
    STATUS_OPTIONS,
    GENRE_OPTIONS,
} from "../../filtersConfig.js";

export default function AdvancedFilters({ open, filters, onChange }) {
    if (!open) return null;

    const handle = (field) => (e) => {
        onChange({ [field]: e.target.value });
    };

    const toggleAdvancedGenre = (genre) => {
        const current = Array.isArray(filters.advancedGenres)
            ? filters.advancedGenres
            : [];
        const exists = current.includes(genre);
        const next = exists
            ? current.filter((g) => g !== genre)
            : [...current, genre];
        onChange({ advancedGenres: next });
    };

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Minimum score</label>
                        <select
                        className="form-select"
                        value={filters.minScore}
                        onChange={handle("minScore")}
                        >
                            {MIN_SCORE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Popularity</label>
                        <select
                        className="form-select"
                        value={filters.popularityBucket}
                        onChange={handle("popularityBucket")}
                        >
                            {POPULARITY_BUCKET_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Episode count</label>
                        <select
                        className="form-select"
                        value={filters.episodeRange}
                        onChange={handle("episodeRange")}
                        >
                            {EPISODE_RANGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Duration per episode</label>
                        <select
                        className="form-select"
                        value={filters.durationRange}
                        onChange={handle("durationRange")}
                        >
                            {DURATION_RANGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Source type</label>
                        <select
                        className="form-select"
                        value={filters.source}
                        onChange={handle("source")}
                        >
                            {SOURCE_OPTIONS.map((opt) => (
                                <option key={opt.value || "ANY"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Country of origin</label>
                        <select
                        className="form-select"
                        value={filters.country}
                        onChange={handle("country")}
                        >
                            {COUNTRY_OPTIONS.map((opt) => (
                                <option key={opt.value || "ANY"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Airing status</label>
                        <select
                        className="form-select"
                        value={filters.status}
                        onChange={handle("status")}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value || "ANY"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label fw-semibold">Additional genres</label>
                        <div className="d-flex flex-wrap gap-2">
                            {GENRE_OPTIONS.map((g) => {
                            const selected = filters.advancedGenres?.includes(g);
                            return (
                                <button
                                key={g}
                                type="button"
                                className={
                                    "btn btn-sm " +
                                    (selected ? "btn-primary" : "btn-outline-secondary")
                                }
                                onClick={() => toggleAdvancedGenre(g)}
                                >
                                {g}
                                </button>
                            );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
