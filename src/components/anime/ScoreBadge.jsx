const getScoreClass = (score) => {
    if (score >= 80) return "score-green";
    if (score >= 70) return "score-yellow";
    if (score >= 60) return "score-orange";
    return "score-red";
};

export default function ScoreBadge({ score }) {
    if (typeof score !== "number") return null;

    const className = `anime-score-badge ${getScoreClass(score)}`;

    return <div className={className}>⭐ {score}</div>;
}