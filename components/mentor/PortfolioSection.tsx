// components/mentor/PortfolioSection.tsx
import { Card, CardContent } from "@/components/common/Card";
import { ExternalLink, FileText, Image as ImageIcon, Trophy, Video } from "lucide-react";
import Image from "next/image";

export interface PortfolioItem {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  type: "case-study" | "result" | "video" | "image" | "article";
}

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
}

const TYPE_ICONS = {
  "case-study": FileText,
  "result": Trophy,
  "video": Video,
  "image": ImageIcon,
  "article": FileText,
};

const TYPE_LABELS = {
  "case-study": "Case Study",
  "result": "Result",
  "video": "Video",
  "image": "Image",
  "article": "Article",
};

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  if (!portfolio || portfolio.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-xl font-semibold">Portfolio & Results</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {portfolio.map((item, index) => {
            const Icon = TYPE_ICONS[item.type];

            return (
              <Card key={index} className="border-white/10 bg-white/5">
                <CardContent className="p-4">
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="relative mb-3 h-40 w-full overflow-hidden rounded-lg bg-white/5">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-medium text-purple-300">
                      {TYPE_LABELS[item.type]}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 font-semibold text-white">{item.title}</h3>

                  {/* Description */}
                  {item.description && (
                    <p className="mb-3 text-sm text-white/70 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {/* Link */}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
