import Image from "next/image";

const IMG_PREFIX = "https://cdn.imweb.me/upload/S20250624bfeeb8bdef278/";

const orgs = [
  {
    name: "중소벤처기업진흥공단",
    abbr: "중진공",
    url: "https://www.kosmes.or.kr",
    img: `${IMG_PREFIX}12b1eaa7851a6.png`,
  },
  {
    name: "신용보증기금",
    abbr: "신보",
    url: "https://www.kodit.co.kr",
    img: `${IMG_PREFIX}efdf18145519b.png`,
  },
  {
    name: "기술보증기금",
    abbr: "기보",
    url: "https://www.kibo.or.kr",
    img: `${IMG_PREFIX}28822c88eec59.png`,
  },
  {
    name: "소상공인시장진흥공단",
    abbr: "소진공",
    url: "https://www.semas.or.kr",
    img: `${IMG_PREFIX}b84a69e337c73.png`,
  },
  {
    name: "서울신용보증재단",
    abbr: "서울신보",
    url: "https://www.seoulshinbo.co.kr",
    img: `${IMG_PREFIX}87c7644e8191f.jpg`,
  },
  {
    name: "경기신용보증재단",
    abbr: "경기신보",
    url: "https://www.gcgf.or.kr",
    img: `${IMG_PREFIX}f1e78a6971c4d.jpg`,
  },
];

export default function GovBanner() {
  return (
    <div className="py-8 px-6 bg-white border-t border-gray-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col items-center gap-5">
          <span className="text-xs font-semibold text-gray-40 tracking-widest uppercase">
            주요 유관기관
          </span>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {orgs.map((org) => (
              <a
                key={org.abbr}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative w-[120px] h-[52px] border border-gray-10 hover:border-primary-50 rounded-lg overflow-hidden transition-all duration-200 px-3 py-2 flex items-center justify-center bg-white">
                  <Image
                    src={org.img}
                    alt={org.name}
                    fill
                    className="object-contain p-2"
                    sizes="120px"
                    unoptimized
                  />
                </div>
                <span className="text-[11px] text-gray-40 group-hover:text-primary-60 transition-colors">
                  {org.abbr}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
