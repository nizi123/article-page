// components/ArticleCard.tsx

import React, { useState } from "react";
import Link from "next/link";

export type Article = {
  id: number;
  title: string;
  summary: string;
  category: string;
  tagColor: string;
  imageUrl: string;
};

type Props = {
  article: Article;
};

const ArticleCard = ({ article }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/article/${article.id}`}
      className="no-underline text-inherit"
    >
      <div
        className="flex flex-col gap-2 bg-transparent p-0 rounded-xl overflow-hidden transition w-full max-w-[384px] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[4/3] w-full relative">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {isHovered && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <span
            className="text-[11px] font-medium px-2 py-0.5 border w-fit text-center"
            style={{ color: article.tagColor, borderColor: article.tagColor }}
          >
            {article.category}
          </span>
          <h3
            className="text-[17px] font-semibold leading-snug transition-colors"
            style={{ color: isHovered ? article.tagColor : "#111111" }}
          >
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {article.summary}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
