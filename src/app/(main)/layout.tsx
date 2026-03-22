import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingMenu from "@/components/FloatingMenu";
import PopupBanner from "@/components/PopupBanner";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pb-12 sm:pb-0">{children}</main>
      <Footer />
      <FloatingMenu />
      <MobileBottomNav />
      <PopupBanner />
    </>
  );
}
