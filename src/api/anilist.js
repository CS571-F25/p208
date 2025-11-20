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
      "Accept": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!res.ok) {
    // Network / HTTP-level error
    const text = await res.text();
    throw new Error(`AniList HTTP error ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    // GraphQL-level error
    const message = json.errors.map((e) => e.message).join("; ");
    throw new Error(`AniList GraphQL error: ${message}`);
  }

  return json.data;
}

// Fetch a page of anime for the home list
const LIST_ANIME_QUERY = `
  query ($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          english
          userPreferred
        }
        coverImage {
          large
        }
        averageScore
      }
    }
  }
`;

/**
 * Get a page of anime for the list view.
 */
export async function fetchAnimePage(page, perPage) {
  const data = await anilistRequest(LIST_ANIME_QUERY, { page, perPage });
  return data.Page;
}

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
