import { siteConfig } from "@/lib/config";
import type { AppLocale } from "@/i18n/locales";

type StructuredDataProps = {
  locale: AppLocale;
};

const faqTranslations: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  vi: [
    {
      question: "Khách mời có cần cài đặt ứng dụng hay tạo tài khoản không?",
      answer:
        "Không. Khách mời chỉ cần quét mã QR hoặc nhấp vào đường dẫn sự kiện để chụp hoặc chọn ảnh và tải lên ngay lập tức từ trình duyệt điện thoại. Hoàn toàn không cần tải app hay tạo tài khoản.",
    },
    {
      question: "Thư viện ảnh sự kiện có được bảo mật riêng tư không?",
      answer:
        "Có. Mỗi sự kiện có thư viện ảnh riêng tư, chỉ những người có mã QR hoặc liên kết do chủ tiệc chia sẻ mới có thể xem hoặc đóng góp ảnh.",
    },
    {
      question: "Ảnh và video có được giữ nguyên chất lượng gốc không?",
      answer:
        "Có. CandidCrowd lưu giữ hình ảnh và video ở độ phân giải gốc cao nhất, không bị nén mờ như các nền tảng mạng xã hội thông thường.",
    },
    {
      question: "CandidCrowd phù hợp với những loại sự kiện nào?",
      answer:
        "CandidCrowd bắt đầu tối ưu cho đám cưới, đồng thời hỗ trợ hoàn hảo cho tiệc sinh nhật, thôi nôi, kỷ niệm ngày cưới, sự kiện công ty, hội nghị và họp mặt gia đình.",
    },
  ],
  en: [
    {
      question: "Do guests need an app or account to upload photos?",
      answer:
        "No. Guests simply scan the event QR code or open the link to take or select photos and upload directly from their mobile browser. No app download and no account creation required.",
    },
    {
      question: "Is the event gallery private?",
      answer:
        "Yes. Every event gallery is private and accessible only to the host and invited guests who have the event link or QR code.",
    },
    {
      question: "Are photos and videos preserved in original quality?",
      answer:
        "Yes. CandidCrowd preserves uploads in original high resolution without aggressive compression so you keep full-quality memories.",
    },
    {
      question: "What event types does CandidCrowd support?",
      answer:
        "CandidCrowd is tailored for weddings, and works equally well for birthday parties, anniversaries, corporate events, conferences, and family reunions.",
    },
  ],
};

export function StructuredData({ locale }: StructuredDataProps) {
  const baseUrl = siteConfig.marketingUrl.replace(/\/$/, "");
  const pageUrl = `${baseUrl}/${locale}`;
  const faqs = faqTranslations[locale] || faqTranslations.en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "CandidCrowd",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/icon.svg`,
          caption: "CandidCrowd Logo",
        },
        description:
          "Event photo and video sharing platform with instant QR code upload. No guest account and no app install required.",
        email: siteConfig.supportEmail,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: siteConfig.supportEmail,
            availableLanguage: [
              "English",
              "Vietnamese",
              "Spanish",
              "French",
              "German",
              "Italian",
              "Portuguese",
            ],
          },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Hanoi",
          addressCountry: "VN",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "CandidCrowd",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: ["en", "vi", "es", "fr", "de", "it", "pt-BR"],
      },
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#app`,
        name: "CandidCrowd",
        url: pageUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem:
          "All modern browsers (iOS Safari, Android Chrome, Desktop)",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          category: "FreeTier",
        },
        featureList: [
          "Instant QR Code Event Photo Upload",
          "No App Install Required",
          "No Guest Account Required",
          "Private Shared Gallery",
          "Real-time Live Wall",
          "Full Original Quality Downloads",
        ],
        description:
          "Collect event photos and videos from every guest with one QR code. No app or guest account required.",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}/#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
