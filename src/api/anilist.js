import {
  MIN_SCORE_OPTIONS,
  POPULARITY_BUCKET_OPTIONS,
  EPISODE_RANGE_OPTIONS,
  DURATION_RANGE_OPTIONS,
  optionByValue,
} from "../filtersConfig.js";

const ANILIST_URL = "https://graphql.anilist.co";

/**
 * Generic helper to send a GraphQL request to AniList.
 * @param {string} query - GraphQL query string
 * @param {object} variables - variables object
 * @returns {Promise<any>} - parsed JSON data
 */
export async function anilistRequest(query, variables = {}) {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList HTTP error ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    const message = json.errors.map((e) => e.message).join("; ");
    throw new Error(`AniList GraphQL error: ${message}`);
  }

  return json.data;
}

// --- LIST QUERY WITH FILTERS & SORT --- :contentReference[oaicite:8]{index=8}

const LIST_ANIME_QUERY = `
  query ListAnime(
    $page: Int!,
    $perPage: Int!,
    $search: String,
    $genres: [String],
    $season: MediaSeason,
    $seasonYear: Int,
    $formatIn: [MediaFormat],
    $status: MediaStatus,
    $minScore: Int,
    $minPopularity: Int,
    $episodesMin: Int,
    $episodesMax: Int,
    $durationMin: Int,
    $durationMax: Int,
    $sourceIn: [MediaSource],
    $country: CountryCode,
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(
        type: ANIME
        search: $search
        genre_in: $genres
        season: $season
        seasonYear: $seasonYear
        format_in: $formatIn
        status: $status
        source_in: $sourceIn
        countryOfOrigin: $country
        averageScore_greater: $minScore
        popularity_greater: $minPopularity
        episodes_greater: $episodesMin
        episodes_lesser: $episodesMax
        duration_greater: $durationMin
        duration_lesser: $durationMax
        isAdult: false
        sort: $sort
      ) {
        id
        title {
          english
          userPreferred
        }
        coverImage {
          large
        }
        averageScore
        format
        season
        seasonYear
        status
      }
    }
  }
`;

function cleanVariables(vars) {
  const cleaned = {};
  for (const [key, value] of Object.entries(vars)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Turn UI filter state into GraphQL variables.
 */
function buildListVariables(page, perPage, filters = {}) {
  const {
    search = "",
    genre = "",
    year = "",
    season = "",
    format = "",
    minScore = "ANY",
    popularityBucket = "ANY",
    episodeRange = "ANY",
    durationRange = "ANY",
    source = "",
    country = "",
    status = "",
    advancedGenres = [],
    sort = "POPULARITY_DESC",
  } = filters;

  // Numeric mappings via config options
  let minScoreValue = null;
  const scoreOpt = optionByValue(MIN_SCORE_OPTIONS, minScore);
  if (scoreOpt && typeof scoreOpt.min === "number") {
    minScoreValue = scoreOpt.min;
  }

  let minPopularityValue = null;
  const popOpt = optionByValue(POPULARITY_BUCKET_OPTIONS, popularityBucket);
  if (popOpt && typeof popOpt.min === "number") {
    minPopularityValue = popOpt.min;
  }

  let episodesMin = null;
  let episodesMax = null;
  const epOpt = optionByValue(EPISODE_RANGE_OPTIONS, episodeRange);
  if (epOpt) {
    episodesMin = epOpt.min ?? null;
    episodesMax = epOpt.max ?? null;
  }

  let durationMin = null;
  let durationMax = null;
  const durOpt = optionByValue(DURATION_RANGE_OPTIONS, durationRange);
  if (durOpt) {
    durationMin = durOpt.min ?? null;
    durationMax = durOpt.max ?? null;
  }

  // combine main genre (quick filter) and extra genres (advanced)
  const genresCombined = [];
  if (genre) {
    genresCombined.push(genre);
  }
  if (Array.isArray(advancedGenres) && advancedGenres.length > 0) {
    for (const g of advancedGenres) {
      if (g && !genresCombined.includes(g)) {
        genresCombined.push(g);
      }
    }
  }

  return {
    page,
    perPage,
    search: search || null,
    genres: genresCombined.length > 0 ? genresCombined : null,
    season: season || null,
    seasonYear: year ? Number(year) : null,
    formatIn: format ? [format] : null,
    status: status || null,
    minScore: minScoreValue,
    minPopularity: minPopularityValue,
    episodesMin,
    episodesMax,
    durationMin,
    durationMax,
    sourceIn: source ? [source] : null,
    country: country || null,
    sort: [sort || "POPULARITY_DESC"],
  };
}

/**
 * Get a page of anime for the list view with filters.
 */
export async function fetchAnimePage(page, perPage, filters = {}) {
  const rawVariables = buildListVariables(page, perPage, filters);
  const variables = cleanVariables(rawVariables);
  const data = await anilistRequest(LIST_ANIME_QUERY, variables);
  return data.Page;
}

// --- DETAIL QUERY (UNCHANGED) --- :contentReference[oaicite:9]{index=9}

const ANIME_DETAIL_QUERY = `
  query ($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
        userPreferred
      }
      description(asHtml: false)
      coverImage {
        extraLarge
      }
      bannerImage
      format
      status
      episodes
      duration
      season
      seasonYear
      averageScore
      genres
      studios {
        nodes {
          id
          name
        }
      }
      externalLinks {
        site
        url
      }
      siteUrl

      characters(sort: [ROLE, RELEVANCE, ID], page: 1, perPage: 50) {
        edges {
          role
          node {
            id
            name {
              full
              native
              userPreferred
            }
            image {
              large
              medium
            }
          }
        }
      }

      relations {
        edges {
          relationType
          node {
            id
            type
            title {
              english
              romaji
              native
              userPreferred
            }
            coverImage {
              large
            }
            format
            season
            seasonYear
            startDate {
              year
              month
              day
            }
            siteUrl
          }
        }
      }

    }
  }
`;

const CHARACTER_DETAIL_QUERY = `
  query ($id: Int) {
    Character(id: $id) {
      id
      name {
        full
        native
        userPreferred
        alternative
      }
      image {
        large
        medium
      }
      description(asHtml: false)
      gender
      age
      dateOfBirth {
        year
        month
        day
      }
      favourites
      siteUrl
      media(sort: POPULARITY_DESC, type: ANIME) {
        edges {
          characterRole
          node {
            id
            title {
              english
              romaji
              native
              userPreferred
            }
            coverImage {
              extraLarge
              large
              medium
            }
            format
            season
            seasonYear
            episodes
            averageScore
          }
          voiceActors {
            id
            name {
              full
              native
            }
            languageV2
            image {
              large
            }
            siteUrl
          }
        }
      }
    }
  }
`;

/**
 * Get detailed info for a single anime by AniList ID.
 */
export async function fetchAnimeById(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error(`Invalid anime id: ${id}`);
  }

  const data = await anilistRequest(ANIME_DETAIL_QUERY, { id: numericId });
  return data.Media;
}

export async function fetchCharacterById(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error(`Invalid character id: ${id}`);
  }

  const data = await anilistRequest(CHARACTER_DETAIL_QUERY, { id: numericId });
  return data.Character;
}
