import { useEffect, useRef, useState } from "react";
import { fetchAnimePage } from "../api/anilist.js";
import { useHomeState } from "../HomeStateContext.jsx";
import PageContainer from "../components/layout/PageContainer.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import AnimeGrid from "../components/anime/AnimeGrid.jsx";
import SearchBar from "../components/filters/SearchBar.jsx";
import QuickFilters from "../components/filters/QuickFilters.jsx";
import AdvancedFilters from "../components/filters/AdvancedFilters.jsx";
import SortControls from "../components/filters/SortControls.jsx";

const getInitialPerPage = () => {
  if (typeof window === "undefined") return 24;

  const width = window.innerWidth;
  if (width < 576) return 24;
  if (width < 768) return 30;
  if (width < 992) return 32;
  return 48;
};

const initialFilters = {
  search: "",
  genre: "",
  year: "",
  season: "",
  format: "",
  minScore: "ANY",
  popularityBucket: "ANY",
  episodeRange: "ANY",
  durationRange: "ANY",
  source: "",
  country: "",
  status: "",
  advancedGenres: [],
  sort: "POPULARITY_DESC",
};

export default function HomePage() {
  const { homeState, saveHomeState } = useHomeState();

  const [filters, setFilters] = useState(homeState?.filters ?? initialFilters);
  const [searchInput, setSearchInput] = useState(homeState?.searchInput ?? "");
  const [animeList, setAnimeList] = useState(homeState?.animeList ?? []);
  const [pageInfo, setPageInfo] = useState(homeState?.pageInfo ?? null);
  const [page, setPage] = useState(homeState?.page ?? 1);
  const [initialLoading, setInitialLoading] = useState(homeState ? false : true);

  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [perPage] = useState(getInitialPerPage); // decide once per session
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLoadingMore, setShowLoadingMore] = useState(false);

  const [restoredFromState, setRestoredFromState] = useState(!!homeState);

  const loaderRef = useRef(null);

  const handleFiltersChange = (partial) => {
    // Reset paging & list when any filter/sort changes
    setPage(1);
    setAnimeList([]);
    setPageInfo(null);
    setInitialLoading(true);
    setLoadingMore(false);
    setError("");

    setFilters((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const handleClearAll = () => {
    setSearchInput("");

    // Reset paging & list
    setPage(1);
    setAnimeList([]);
    setPageInfo(null);
    setInitialLoading(true);
    setLoadingMore(false);
    setError("");

    // Reset filters to default
    setFilters(initialFilters);
  };
  
  // Snapshot the current home state, including scroll
  useEffect(() => {
    saveHomeState({
      filters,
      searchInput,
      animeList,
      pageInfo,
      page,
      perPage,
    });
  }, [filters, searchInput, animeList, pageInfo, page, perPage]);

  // Fetch whenever "page" or "filters" change
  useEffect(() => {
    let cancelled = false;

    // If we just restored from saved state, skip a network call once
    if (restoredFromState && animeList.length > 0) {
      setInitialLoading(false);
      setLoadingMore(false);
      setRestoredFromState(false);
      return;
    }

    async function load() {
      setError("");

      if (page === 1) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const pageData = await fetchAnimePage(page, perPage, filters);
        if (cancelled) return;

        setPageInfo(pageData.pageInfo);
        setAnimeList((prev) => {
          // First page: just replace
          if (page === 1 || prev.length === 0) {
            return pageData.media;
          }

          // Later pages: append, but skip duplicates by id
          const existingIds = new Set(prev.map((a) => a.id));
          const merged = [...prev];

          for (const anime of pageData.media) {
            if (!existingIds.has(anime.id)) {
              merged.push(anime);
              existingIds.add(anime.id);
            }
          }

          return merged;
        });

      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load anime.");
        }
      } finally {
        if (page === 1) {
          setInitialLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, perPage, filters, restoredFromState]);

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
        rootMargin: "100px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [initialLoading, loadingMore, pageInfo]);

  useEffect(() => {
    let timeoutId;

    if (loadingMore) {
      // Only show the "Loading more…" text if loading takes > 200ms
      timeoutId = setTimeout(() => {
        setShowLoadingMore(true);
      }, 200);
    } else {
      setShowLoadingMore(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingMore]);

  // --- RENDERING ---

  // We keep filters visible even while loading
  return (
    <PageContainer>
      <PageHeader
        title="AniList Viewer"
        subtitle="See some of the all-time popular anime here! Use search and filters to refine the list, then click an anime to see more!"
      />

      {/* Large search bar (type freely, only search on button/Enter) */}
      <SearchBar
        value={searchInput}
        onChange={(value) => setSearchInput(value)}
        onSubmit={() => handleFiltersChange({ search: searchInput })}
        onClear={handleClearAll}
      />

      {/* Quick filters row */}
      <QuickFilters
        filters={filters}
        onChange={handleFiltersChange}
        advancedOpen={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced((open) => !open)}
      />

      {/* Advanced filter panel */}
      <AdvancedFilters
        open={showAdvanced}
        filters={filters}
        onChange={handleFiltersChange}
      />

      {/* Sort controls */}
      <SortControls
        value={filters.sort}
        onChange={(value) => handleFiltersChange({ sort: value })}
      />

      {initialLoading && !animeList.length && !error && (
        <p>Loading anime…</p>
      )}

      {error && !initialLoading && !animeList.length && (
        <p className="text-danger">Error: {error}</p>
      )}

      <AnimeGrid animeList={animeList} />

      {/* Sentinel for infinite scroll */}
      <div ref={loaderRef} className="py-3 text-center">
        {/* Show loading indicator only when loading */}
        {showLoadingMore && <span>Loading more…</span>}

        {/* CASE 1: No results at all */}
        {!initialLoading &&
          !loadingMore &&
          animeList.length === 0 && (
            <span className="fw-bold fs-4 text-secondary" style={{ opacity: 0.8 }}>
              No results found
            </span>
          )}

        {/* CASE 2: Has results but no more pages */}
        {!loadingMore &&
          !initialLoading &&
          animeList.length > 0 &&
          !pageInfo?.hasNextPage && (
            <span className="text-muted">No more results.</span>
          )}
      </div>

      {error && animeList.length > 0 && (
        <div className="text-danger mt-2">Error: {error}</div>
      )}
    </PageContainer>
  );
}