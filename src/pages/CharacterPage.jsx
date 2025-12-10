import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchCharacterById } from "../api/anilist.js";
import Spoiler from "../components/Spoiler.jsx";

function formatBirthday(dob) {
  if (!dob) return null;
  const { year, month, day } = dob;
  if (!month || !day) return null;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const base = `${monthNames[month - 1]} ${day}`;
  return year ? `${base}, ${year}` : base;
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
        const value = m[2].trim();
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

  // Remove markdown links: [Name](url) -> Name
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, "$1");

  // Remove bold/italic markers: **text**, __text__, *text*, _text_
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/__(.+?)__/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");

  // Convert AniList spoiler tags ~!text!~ into placeholder tokens for later rendering
  text = text.replace(/~!(.+?)!~/gs, (match, p1) => `[[SPOILER:${p1}]]`);

  return { info, text: text.trim() };
}

export default function CharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Parse description into info items + cleaned text
  const { info: infoFromDescription, text: cleanedDescription } = parseDescription(character?.description);

  // Build the combined "details" list
  const detailItems = [];

    if (birthday) {
        detailItems.push({ label: "Birthday", value: birthday });
    }
    if (character?.age) {
        const cleanedAge = character.age.endsWith("-")
            ? character.age.replace("-", "+")   // "15-" → "15+"
            : character.age;
        detailItems.push({ label: "Age", value: cleanedAge });
    }
    if (character?.gender) {
        detailItems.push({ label: "Gender", value: character.gender });
    }

    for (const item of infoFromDescription) {
        detailItems.push(item);
    }

  const appearances = character?.media?.nodes ?? [];

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

              <div className="mb-2">
                <span className="badge bg-primary me-2">
                  {character.favourites ?? 0} favourites
                </span>
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

            {/* Right column: name, alt names, description */}
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
                        <strong>{item.label}:</strong> {item.value}
                        </p>
                    ))}
                    </div>
                )}

                {cleanedDescription && (
                    <div className="mb-3">
                        <p style={{ whiteSpace: "pre-wrap" }}>
                        {cleanedDescription.split(/(\[\[SPOILER:.+?\]\])/).map((part, idx) => {
                            const match = part.match(/^\[\[SPOILER:(.+?)\]\]$/);
                            if (match) {
                            return (
                                <Spoiler key={idx}>
                                {match[1]}
                                </Spoiler>
                            );
                            }
                            return <span key={idx}>{part}</span>;
                        })}
                        </p>
                    </div>
                )}
            </div>
          </div>

          {/* Anime appearances */}
          <div className="mb-4">
            <h2 className="h4 mb-3">Anime Appearances</h2>
            {appearances.length === 0 && (
              <p className="text-muted">No anime listed for this character.</p>
            )}

            {appearances.length > 0 && (
              <div className="row g-3">
                {appearances.map((media) => {
                  const mediaTitle =
                    media.title.english ??
                    media.title.userPreferred ??
                    media.title.romaji ??
                    "Untitled";

                  return (
                    <div
                      key={media.id}
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <Link
                        to={`/anime/${media.id}`}
                        className="text-decoration-none text-reset"
                      >
                        <div className="card h-100">
                          {(media.coverImage?.extraLarge ||
                            media.coverImage?.large ||
                            media.coverImage?.medium) && (
                            <img
                              src={
                                media.coverImage.extraLarge ||
                                media.coverImage.large ||
                                media.coverImage.medium
                              }
                              alt={mediaTitle}
                              className="card-img-top"
                            />
                          )}
                          <div className="card-body">
                            <h3 className="h6 card-title mb-1">
                              {mediaTitle}
                            </h3>
                            <p className="card-text text-muted mb-1">
                              {media.format} •{" "}
                              {media.season} {media.seasonYear}
                            </p>
                            {/* No role here; Character.media doesn't expose role */}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}