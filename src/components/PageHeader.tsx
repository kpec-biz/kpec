"use client";

import { motion } from "framer-motion";
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
  const webpUrl = r2(bgImage);

  return (
    <section className="relative pt-32 pb-16 text-center overflow-hidden">
      {/* Background image — no skeleton, overlay covers 85% */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${webpUrl})` }}
      />
      <div className="absolute inset-0 bg-primary-80/85" />
      <div className="relative max-w-[1200px] mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-2xl sm:text-5xl font-bold text-white mb-3 sm:mb-4"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-white/60 text-[13px] sm:text-lg max-w-2xl mx-auto [text-wrap:balance]"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
