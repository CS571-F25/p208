export default function PageHeader({ title, subtitle }) {
    return (
        <>
            <h1 className="mb-3">{title}</h1>
            {subtitle && <p className="text-muted mb-4">{subtitle}</p>}
        </>
    );
}