export default function SearchBar({ value, onChange, onSubmit, onClear }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
        onSubmit();
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label fw-semibold">Search</label>

            <div className="d-flex align-items-start gap-2">
                <form className="flex-grow-1" onSubmit={handleSubmit}>
                <div className="input-group input-group-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by English / Romaji / Native title…"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        Search
                    </button>
                </div>
                </form>

                <button
                    className="btn btn-outline-secondary btn-lg"
                    type="button"
                    onClick={onClear}
                >
                    Clear All
                </button>
            </div>
        </div>
    );
}