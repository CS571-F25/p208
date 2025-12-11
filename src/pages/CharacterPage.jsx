import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchCharacterById } from "../api/anilist.js";
import Spoiler from "../components/Spoiler.jsx";

function formatBirthday(dob) {
  if (!dob) return null;
  const { year, month, day } = dob;
  if (!month || !day) return null;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const base = `${monthNames[month - 1]} ${day}`;
  return year ? `${base}, ${year}` : base;
}

function cleanInlineText(value) {
  if (!value) return "";
  let text = value;

  // Convert AniList spoiler syntax in inline fields:
  // ~!spoiler text!~  -> [[SPOILER:spoiler text]]
  text = text.replace(/~!(.+?)!~/gs, (match, p1) => `[[SPOILER:${p1}]]`);

  // [Name](url) -> Name
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, "$1");

  // <a href="...">Name</a> -> Name
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");

  // Remove bare URLs
  text = text.replace(/https?:\/\/\S+/g, "");

  // Remove bold / italic markers
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  return text.trim();
}

function parseDescription(desc) {
  if (!desc) return { info: [], text: "" };

  const lines = desc.split(/\r?\n/);
  const info = [];
  const bodyLines = [];
  let inInfoBlock = true;

  for (const line of lines) {
    const trimmed = line.trim();

    let matched = false;

    if (inInfoBlock && trimmed !== "") {
      // Patterns like:
      // __Initial Height__: 170 cm (5'7")
      // __Affiliation:__ 104th Trainees Squad, Survey Corps.
      // **Something**: value
      let m =
        trimmed.match(/^__([^_]+?)__:\s*(.+)$/) ||
        trimmed.match(/^__([^_]+?):__\s*(.+)$/) ||
        trimmed.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);

      if (m) {
        const label = m[1].trim();
        const rawValue = m[2].trim();
        const value = cleanInlineText(rawValue); // strip links / markdown / inline spoilers
        info.push({ label, value });
        matched = true;
      }
    }

    if (!matched) {
      inInfoBlock = false;
      bodyLines.push(line);
    }
  }

  let text = bodyLines.join("\n");

  // 1) Markdown links: [Name](url) -> Name
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, "$1");

  // 2) HTML links: <a href="...">Name</a> -> Name
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");

  // 3) Bare URLs: https://something -> removed
  text = text.replace(/https?:\/\/\S+/g, "");

  // 4) Remove bold / italic markers
  text = text.replace(/\*\*(.+?)\*\*/g, "$1"); // **text**
  text = text.replace(/__(.+?)__/g, "$1");     // __text__
  text = text.replace(/\*(.+?)\*/g, "$1");     // *text*
  text = text.replace(/_(.+?)_/g, "$1");       // _text_

  // 5) Replace AniList spoiler syntax ~!spoiler!~
  text = text.replace(/~!(.+?)!~/gs, (match, p1) => `[[SPOILER:${p1}]]`);

  return { info, text: text.trim() };
}

export default function CharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function renderTextWithSpoilers(text) {
    if (!text) return null;

    const pattern = /\[\[SPOILER:(.+?)\]\]/g;
    const nodes = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = pattern.exec(text)) !== null) {
      // Plain text before the spoiler
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }

      // Spoiler chunk
      nodes.push(
        <Spoiler key={`sp-${key++}`}>{match[1]}</Spoiler>
      );

      lastIndex = pattern.lastIndex;
    }

    // Remaining text after last spoiler
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    return nodes;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchCharacterById(id);
        if (!cancelled) {
          setCharacter(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load character.");
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

  const name =
    character?.name?.userPreferred ||
    character?.name?.full ||
    character?.name?.native ||
    "Unknown character";

  const altNames =
    character?.name?.alternative && character.name.alternative.length > 0
      ? character.name.alternative.join(", ")
      : null;

  const birthday = formatBirthday(character?.dateOfBirth);

  const favouriteCount = character?.favourites ?? 0;

  // Parse description into info items + cleaned text
  const {
    info: infoFromDescription,
    text: cleanedDescription,
  } = parseDescription(character?.description);

  // Build the combined "details" list
  const detailItems = [];

  if (birthday) {
    detailItems.push({ label: "Birthday", value: birthday });
  }
  if (character?.age) {
    const cleanedAge = character.age.endsWith("-")
      ? character.age.replace("-", "+") // "15-" → "15+"
      : character.age;
    detailItems.push({ label: "Age", value: cleanedAge });
  }
  if (character?.gender) {
    detailItems.push({ label: "Gender", value: character.gender });
  }

  for (const item of infoFromDescription) {
    detailItems.push(item);
  }

  // Appearances are now media.edges (not nodes)
  const appearances = (character?.media?.edges ?? []).filter(Boolean);

  // --- Voice actors aggregation (CV) ---

  // Collect unique voice actors across all appearances, keyed by id+language
  const vaMap = new Map();

  for (const edge of appearances) {
    if (!edge.voiceActors) continue;

    for (const va of edge.voiceActors) {
      if (!va) continue;

      const language = va.languageV2 || "Unknown";
      const key = `${va.id}-${language}`;

      if (!vaMap.has(key)) {
        vaMap.set(key, {
          id: va.id,
          fullName: va.name?.full || "Unknown",
          nativeName: va.name?.native || null,
          language,
          siteUrl: va.siteUrl || null,
          image: va.image?.large || null,
        });
      }
    }
  }

  // Group CVs by language
  const vaGroupsByLanguage = {};
  for (const va of vaMap.values()) {
    const lang = va.language || "Unknown";
    if (!vaGroupsByLanguage[lang]) {
      vaGroupsByLanguage[lang] = [];
    }
    vaGroupsByLanguage[lang].push(va);
  }

  const vaLanguages = Object.keys(vaGroupsByLanguage).sort((a, b) => {
    if (a === "Japanese") return -1;
    if (b === "Japanese") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="container py-4">
      <button
        className="btn btn-link p-0 mb-3"
        type="button"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>

      {loading && <p>Loading character…</p>}
      {error && !loading && (
        <p className="text-danger">Error: {error}</p>
      )}

      {!loading && !character && !error && (
        <p className="text-danger">Character not found.</p>
      )}

      {character && (
        <>
          <div className="row g-4 mb-4">
            {/* Left column: portrait & meta */}
            <div className="col-12 col-md-4 col-lg-3">
              {(character.image?.large || character.image?.medium) && (
                <img
                  src={character.image.large || character.image.medium}
                  alt={name}
                  className="img-fluid rounded mb-3"
                />
              )}

              <div className="mb-3">
                <div className="character-favorites-chip">
                  <span className="character-favorites-icon">♥</span>
                  <span className="character-favorites-text">
                    {favouriteCount.toLocaleString()} favorites on AniList
                  </span>
                </div>
              </div>

              {character.siteUrl && (
                <p className="mb-2">
                  <a
                    href={character.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on AniList
                  </a>
                </p>
              )}
            </div>

            {/* Right column: name, alt names, details, CVs, description */}
            <div className="col-12 col-md-8 col-lg-9">
              <h1 className="mb-2">{name}</h1>

              {character.name?.native && (
                <p className="text-muted mb-1">
                  <strong>Native:</strong> {character.name.native}
                </p>
              )}

              {altNames && (
                <p className="text-muted mb-3">
                  <strong>Also known as:</strong> {altNames}
                </p>
              )}

              {detailItems.length > 0 && (
                <div className="mb-3">
                  {detailItems.map((item) => (
                    <p key={item.label} className="mb-1">
                      <strong>{item.label}:</strong>{" "}
                      {renderTextWithSpoilers(item.value)}
                    </p>
                  ))}
                </div>
              )}

              {vaLanguages.length > 0 && (
                <div className="mb-3">
                  <h5 className="mb-2">Voice Actors</h5>

                  {vaLanguages.map((lang) => (
                    <p key={lang} className="small mb-1">
                      <span className="text-muted text-uppercase me-1">
                        {lang}:
                      </span>
                      {vaGroupsByLanguage[lang].map((va, idx) => (
                        <span key={`${va.id}-${lang}`}>
                          {va.fullName}
                          {va.nativeName &&
                            va.nativeName !== va.fullName && (
                              <> ({va.nativeName})</>
                            )}
                          {idx < vaGroupsByLanguage[lang].length - 1 ? "/ " : ""}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              )}

              {cleanedDescription && (
                <div className="mb-3 mt-4">
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {renderTextWithSpoilers(cleanedDescription)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Anime appearances */}
          {appearances.length > 0 && (
            <div className="mt-4">
              <h4 className="fw-bold mb-3">Anime Appearances</h4>

              <div className="row g-3">
                {appearances.map((edge) => {
                  const media = edge?.node;

                  if (!media || !media.title) {
                    return null;
                  }

                  const titleObj = media.title || {};
                  const mediaTitle =
                    titleObj.english ??
                    titleObj.userPreferred ??
                    titleObj.romaji ??
                    "Untitled";

                  const hasSeasonInfo = media.season && media.seasonYear;
                  const imageSrc =
                    media.coverImage?.extraLarge ||
                    media.coverImage?.large ||
                    media.coverImage?.medium;

                  return (
                    <div
                      key={media.id}
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <Link
                        to={`/anime/${media.id}`}
                        className="text-decoration-none text-reset"
                      >
                        <div className="character-appearance-card h-100">
                          {imageSrc && (
                            <div className="character-appearance-card-image-wrapper">
                              <img
                                src={imageSrc}
                                alt={mediaTitle}
                                className="character-appearance-card-image"
                              />
                            </div>
                          )}

                          <div className="character-appearance-card-body">
                            <div className="character-appearance-card-title">
                              {mediaTitle}
                            </div>

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
            </div>
          )}

        </>
      )}
    </div>
  );
}