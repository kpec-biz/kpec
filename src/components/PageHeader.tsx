interface PageHeaderProps {
  bgImage: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({
  bgImage,
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <section
      className="relative pt-32 pb-16 text-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-primary-80/85" />
      <div className="relative max-w-[1200px] mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-lg max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
