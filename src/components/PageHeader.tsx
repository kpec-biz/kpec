"use client";

import { useState } from "react";
import { r2 } from "@/lib/r2-images";

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
  const [loaded, setLoaded] = useState(false);
  const webpUrl = r2(bgImage);

  return (
    <section className="relative pt-32 pb-16 text-center overflow-hidden">
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      )}
      {/* Background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: `url(${webpUrl})` }}
      />
      <img
        src={webpUrl}
        alt=""
        className="hidden"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-primary-80/85" />
      <div className="relative max-w-[1200px] mx-auto px-6">
        <h1
          className={`text-4xl sm:text-5xl font-bold text-white mb-4 ${loaded ? "animate-fade-in" : ""}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-white/60 text-lg max-w-2xl mx-auto ${loaded ? "animate-fade-in" : ""}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
