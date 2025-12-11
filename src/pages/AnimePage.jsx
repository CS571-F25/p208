import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchAnimeById } from "../api/anilist.js";
import PageContainer from "../components/layout/PageContainer.jsx";

export default function AnimePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [showAllRelations, setShowAllRelations] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAnimeById(id);
        if (!cancelled) {
          setAnime(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load anime.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <p>Loading anime details…</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <p className="text-danger">Error: {error}</p>
        <p>
          <Link to="/">Back to list</Link>
        </p>
      </PageContainer>
    );
  }

  if (!anime) {
    return (
      <PageContainer>
        <p>Anime not found.</p>
        <p>
          <Link to="/">Back to list</Link>
        </p>
      </PageContainer>
    );
  }

  // --- Relations (anime only), sorted oldest -> newest ---

  const relationEdges = anime.relations?.edges ?? [];

  function getRelationYear(node) {
    if (node.seasonYear) return node.seasonYear;
    if (node.startDate?.year) return node.startDate.year;
    return null;
  }

  const sortedRelations = relationEdges
    .filter((edge) => edge && edge.node)
    .slice()
    .sort((a, b) => {
      const na = a.node;
      const nb = b.node;
      const ya = getRelationYear(na);
      const yb = getRelationYear(nb);

      if (ya == null && yb == null) return 0;
      if (ya == null) return 1; // unknown years go last
      if (yb == null) return -1;
      if (ya !== yb) return ya - yb; // oldest -> newest

      return 0; // keep API order when year equal
    });

  // Only keep related ANIME (no manga/novel/etc.)
  const animeRelations = sortedRelations.filter(
    (edge) => edge.node?.type === "ANIME"
  );

  const RELATIONS_INITIAL_COUNT = 6;

  const visibleRelations = showAllRelations
    ? animeRelations
    : animeRelations.slice(0, RELATIONS_INITIAL_COUNT);

  const canExpandRelations = animeRelations.length > RELATIONS_INITIAL_COUNT;

  // --- Characters ---
  const characterEdges = anime.characters?.edges ?? [];

  const mainCharacters = characterEdges.filter(
    (edge) => edge && edge.role === "MAIN" && edge.node
  );

  const supportingCharacters = characterEdges.filter(
    (edge) => edge && edge.role === "SUPPORTING" && edge.node
  );

  const hasSupporting = supportingCharacters.length > 0;

  const charactersToShow = showAllCharacters
    ? [...mainCharacters, ...supportingCharacters]
    : mainCharacters;

  return (
    <PageContainer>
      <button
        className="btn btn-link p-0 mb-3"
        onClick={() => navigate(-1) || navigate("/")}
      >
        &larr; Back
      </button>

      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-3 pe-lg-5">
          {anime.coverImage?.extraLarge && (
            <img
              src={anime.coverImage.extraLarge}
              alt={anime.title.userPreferred}
              className="img-fluid rounded mb-3"
            />
          )}
        </div>

        <div className="col-md-8">
          <h1 className="mb-2">
            {anime.title.english ?? anime.title.userPreferred}
          </h1>
          <p className="text-muted mb-2">
            {anime.format} • {anime.status} •{" "}
            {anime.episodes ?? "?"} eps •{" "}
            {anime.duration != null ? `${anime.duration} min` : "?"} •{" "}
            {anime.season} {anime.seasonYear}
          </p>
          <p className="mb-2">
            AniList score: {anime.averageScore ?? "N/A"}
          </p>
          <p className="mb-2">
            Genres: {anime.genres?.join(", ") || "—"}
          </p>
          <p className="mb-2">
            Studios:{" "}
            {anime.studios?.nodes?.map((s) => s.name).join(", ") || "—"}
          </p>
          <h4 className="mt-4 mb-2">Description</h4>
          <div
            style={{ whiteSpace: "normal", marginTop: "1rem", lineHeight: "1.3" }}
            dangerouslySetInnerHTML={{ __html: anime.description }}
          ></div>
          {anime.externalLinks?.length > 0 && (
            <p className="mt-3">
              <a
                href={anime.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="me-3"
              >
                AniList
              </a>
              {anime.externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="me-3"
                >
                  {link.site}
                </a>
              ))}
            </p>
          )}

          {animeRelations.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-3">Relations</h4>

              <div className="row g-3">
                {visibleRelations.map((edge) => {
                  const relTypeRaw = edge.relationType || "OTHER";
                  const media = edge.node;

                  const relLabel = relTypeRaw
                    .split("_")
                    .map(
                      (part) =>
                        part.charAt(0) + part.slice(1).toLowerCase()
                    )
                    .join(" ");

                  const titleObj = media.title || {};
                  const mediaTitle =
                    titleObj.english ??
                    titleObj.userPreferred ??
                    titleObj.romaji ??
                    titleObj.native ??
                    "Untitled";

                  const hasSeasonInfo = media.season && media.seasonYear;

                  const imgSrc =
                    media.coverImage?.extraLarge ||
                    media.coverImage?.large ||
                    media.coverImage?.medium;

                  return (
                    <div
                      key={`${relTypeRaw}-${media.id}`}
                      className="col-6 col-sm-4 col-md-2"
                    >
                      <Link
                        to={`/anime/${media.id}`}
                        className="text-decoration-none text-reset"
                      >
                        <div className="character-appearance-card character-appearance-card--small h-100">
                          {imgSrc && (
                            <div className="character-appearance-card-image-wrapper character-appearance-card-image-wrapper--small">
                              <img
                                src={imgSrc}
                                alt={mediaTitle}
                                className="character-appearance-card-image"
                              />
                            </div>
                          )}

                          <div className="character-appearance-card-body">
                            {/* Relation type label */}
                            <div className="relation-label text-uppercase mb-1">
                              {relLabel}
                            </div>

                            {/* Title */}
                            <div className="character-appearance-card-title">
                              {mediaTitle}
                            </div>

                            {/* Format + season/year, same style as character page */}
                            <div className="character-appearance-card-meta">
                              <span className="character-appearance-chip">
                                {media.format ?? "Unknown format"}
                              </span>
                              {hasSeasonInfo && (
                                <span className="character-appearance-meta-text">
                                  {media.season} {media.seasonYear}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {canExpandRelations && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm mt-3"
                  onClick={() => setShowAllRelations((prev) => !prev)}
                >
                  {showAllRelations
                    ? "Show fewer works"
                    : "Show all related works"}
                </button>
              )}
            </div>
          )}

          {mainCharacters.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-3">Characters</h4>

              <div className="row g-2">
                {charactersToShow.map((edge) => {
                  const ch = edge.node;
                  const chName =
                    ch.name?.userPreferred ||
                    ch.name?.full ||
                    ch.name?.native ||
                    "Unknown character";

                  const imgSrc = ch.image?.large || ch.image?.medium;

                  return (
                    <div
                      key={ch.id}
                      className="col-12"
                    >
                      <Link
                        to={`/character/${ch.id}`}
                        className="text-decoration-none text-reset"
                      >
                        <div className="anime-character-card">
                          {imgSrc && (
                            <div className="anime-character-card-image-wrapper">
                              <img
                                src={imgSrc}
                                alt={chName}
                                className="anime-character-card-image"
                              />
                            </div>
                          )}
                          <div className="anime-character-card-body">
                            <div className="anime-character-card-name">
                              {chName}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {hasSupporting && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm mt-2"
                  onClick={() => setShowAllCharacters((prev) => !prev)}
                >
                  {showAllCharacters
                    ? "Show main characters only"
                    : "Show supporting characters"}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
