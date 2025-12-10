import AnimeCard from "./AnimeCard.jsx";

export default function AnimeGrid({ animeList }) {
    return (
        <div className="row g-3">
            {animeList.map((anime) => (
                <div key={anime.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <AnimeCard anime={anime} />
                </div>
            ))}
        </div>
    );
}