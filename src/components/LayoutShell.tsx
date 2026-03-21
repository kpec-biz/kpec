"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingMenu from "@/components/FloatingMenu";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 판단: /admin 경로이거나 admin 서브도메인
    const adminPath = pathname.startsWith("/admin");
    const adminHost = window.location.hostname.startsWith("admin.");
    setIsAdmin(adminPath || adminHost);
  }, [pathname]);

  // admin이면 Header/Footer 없이 children만
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingMenu />
    </>
  );
}
