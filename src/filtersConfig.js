// --- Quick filters ---

export const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export const SEASON_OPTIONS = [
  { value: "", label: "Any season" },
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

export const FORMAT_OPTIONS = [
  { value: "", label: "Any format" },
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "Special" },
  { value: "MUSIC", label: "Music" },
];

export function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current + 1; y >= 1960; y--) {
    years.push(y);
  }
  return [{ value: "", label: "Any year" }].concat(
    years.map((y) => ({ value: String(y), label: String(y) }))
  );
}

// --- Advanced filters ---

export const MIN_SCORE_OPTIONS = [
  { value: "ANY", label: "Any score", min: null },
  { value: "60_PLUS", label: "60+ (Okay)", min: 60 },
  { value: "70_PLUS", label: "70+ (Good)", min: 70 },
  { value: "80_PLUS", label: "80+ (Great)", min: 80 },
  { value: "90_PLUS", label: "90+ (Top tier)", min: 90 },
];

export const POPULARITY_BUCKET_OPTIONS = [
  { value: "ANY", label: "Any popularity", min: null },
  { value: "WELL_KNOWN", label: "Well-known", min: 30000 },
  { value: "POPULAR", label: "Popular", min: 100000 },
  { value: "VERY_POPULAR", label: "Very popular", min: 200000 },
  { value: "TOP_HITS", label: "Top hits only", min: 400000 },
];

export const EPISODE_RANGE_OPTIONS = [
  { value: "ANY", label: "Any length", min: null, max: null },
  { value: "SHORT", label: "1-12 eps (short)", min: 1, max: 12 },
  { value: "MEDIUM", label: "13-26 eps (1-2 cour)", min: 13, max: 26 },
  { value: "LONG", label: "27-99 eps (long)", min: 27, max: 99 },
  { value: "VERY_LONG", label: "100+ eps", min: 100, max: null },
];

export const DURATION_RANGE_OPTIONS = [
  { value: "ANY", label: "Any length", min: null, max: null },
  { value: "SHORT", label: "< 15 min/ep", min: null, max: 15 },
  { value: "STANDARD", label: "15-30 min/ep", min: 15, max: 30 },
  { value: "LONG", label: "> 30 min/ep", min: 30, max: null },
];

export const SOURCE_OPTIONS = [
  { value: "", label: "Any source" },
  { value: "ORIGINAL", label: "Original" },
  { value: "MANGA", label: "Manga" },
  { value: "LIGHT_NOVEL", label: "Light novel" },
  { value: "WEB_NOVEL", label: "Web novel" },
  { value: "NOVEL", label: "Novel (other)" },
  { value: "VISUAL_NOVEL", label: "Visual novel" },
  { value: "VIDEO_GAME", label: "Video game" },
  { value: "MULTIMEDIA_PROJECT", label: "Multimedia project" },
  { value: "PICTURE_BOOK", label: "Picture book" },
  { value: "OTHER", label: "Other" },
];

export const COUNTRY_OPTIONS = [
  { value: "", label: "Any country" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "KR", label: "Korea" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "FINISHED", label: "Finished" },
  { value: "RELEASING", label: "Releasing" },
  { value: "NOT_YET_RELEASED", label: "Not yet released" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const SORT_OPTIONS = [
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "SCORE_DESC", label: "Score" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "START_DATE_DESC", label: "Newest first" },
  { value: "START_DATE", label: "Oldest first" },
  { value: "TITLE_ENGLISH", label: "Title A-Z" },
];

export function optionByValue(options, value) {
  return options.find((o) => o.value === value) || null;
}
