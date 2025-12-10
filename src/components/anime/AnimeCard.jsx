import { Link } from "react-router-dom";
import ScoreBadge from "./ScoreBadge.jsx";

export default function AnimeCard({ anime }) {
    const title = anime.title.english ?? anime.title.userPreferred ?? "Untitled";

    return (
        <Link
            to={`/anime/${anime.id}`}
            className="text-decoration-none text-reset"
        >
        <div className="anime-card">
            {anime.coverImage?.large && (
                <div className="anime-card-image-wrapper">
                    <img
                        src={anime.coverImage.large}
                        alt={anime.title.userPreferred}
                        className="anime-card-image"
                    />
                    {typeof anime.averageScore === "number" && (
                        <ScoreBadge score={anime.averageScore} />
                    )}
                </div>
            )}
            <div className="anime-card-title">
                <span className="anime-card-title-text">
                    {title}
                </span>
            </div>
        </div>
        </Link>
    );
}