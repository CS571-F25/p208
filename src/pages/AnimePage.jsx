import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchAnimeById } from "../api/anilist.js";

export default function AnimePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="container py-4">
        <p>Loading anime details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <p className="text-danger">Error: {error}</p>
        <p>
          <Link to="/">Back to list</Link>
        </p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container py-4">
        <p>Anime not found.</p>
        <p>
          <Link to="/">Back to list</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1) || navigate("/")}>
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
          <h1 className="mb-2">{anime.title.english ?? anime.title.userPreferred}</h1>
          <p className="text-muted mb-2">
            {anime.format} • {anime.status} •{" "}
            {anime.episodes ?? "?"} eps •{" "}
            {anime.duration != null ? `${anime.duration} min`: "?"} •{" "}
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
              <a href={anime.siteUrl} target="_blank" rel="noreferrer" className="me-3">
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
        </div>
      </div>
    </div>
  );
}
