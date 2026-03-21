"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingMenu from "@/components/FloatingMenu";

interface LayoutShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function LayoutShell({ children, isAdmin }: LayoutShellProps) {
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
