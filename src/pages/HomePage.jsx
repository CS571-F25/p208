import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnimePage } from "../api/anilist.js";

const PER_PAGE = 30;

export default function HomePage() {
  const [animeList, setAnimeList] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loaderRef = useRef(null);

  // Fetch whenever "page" changes (page 1 = initial, page 2+ = more)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (page === 1) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError("");

      try {
        const pageData = await fetchAnimePage(page, PER_PAGE);
        if (cancelled) return;

        setPageInfo(pageData.pageInfo);

        setAnimeList((prev) =>
          page === 1 ? pageData.media : [...prev, ...pageData.media]
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load anime.");
        }
      } finally {
        if (!cancelled) {
          if (page === 1) setInitialLoading(false);
          else setLoadingMore(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          !initialLoading &&
          !loadingMore &&
          pageInfo?.hasNextPage
        ) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "100px", // start loading a bit before it hits the bottom
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [initialLoading, loadingMore, pageInfo]);

  // --- RENDERING ---

  if (initialLoading && !animeList.length) {
    return (
      <div className="container py-4">
        <h1 className="mb-3">AniList Viewer</h1>
        <p>Loading anime…</p>
      </div>
    );
  }

  if (error && !animeList.length) {
    return (
      <div className="container py-4">
        <h1 className="mb-3">AniList Viewer</h1>
        <p className="text-danger">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">AniList Viewer</h1>
      <p className="text-muted mb-4">
        See some of the all-time popular anime here! Click an anime to see more!
      </p>

      <div className="row g-3">
        {animeList.map((anime) => (
          <div key={anime.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <Link
              to={`/anime/${anime.id}`}
              className="text-decoration-none text-reset"
            >
              <div className="card h-100">
                {anime.coverImage?.large && (
                  <img
                    src={anime.coverImage.large}
                    className="card-img-top"
                    alt={anime.title.userPreferred}
                  />
                )}
                <div className="card-body">
                  <h6 className="card-title">
                    {anime.title.english ?? anime.title.userPreferred}
                  </h6>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={loaderRef} className="py-3 text-center">
        {loadingMore && <span>Loading more…</span>}
        {!pageInfo?.hasNextPage && (
          <span className="text-muted">No more results.</span>
        )}
      </div>

      {error && animeList.length > 0 && (
        <div className="text-danger mt-2">Error: {error}</div>
      )}
    </div>
  );
}
