import Image from "next/image";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity";
import { urlFor } from "@/lib/sanity";

type ArticleBodyProps = {
  content?: PortableTextBlock[];
  fallback?: string;
};

type ArticleImage = {
  _type: "image";
  alt?: string;
  caption?: string;
  asset?: {
    _ref?: string;
  };
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-7 font-serif text-xl leading-9 text-foreground/85 md:text-[1.35rem] md:leading-10">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-5 mt-14 text-3xl font-black tracking-tight text-foreground md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-4 mt-10 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-4 border-teal-500 pl-6 font-serif text-2xl italic leading-relaxed text-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-8 ml-6 list-disc space-y-3 font-serif text-xl leading-8 text-foreground/85">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-8 ml-6 list-decimal space-y-3 font-serif text-xl leading-8 text-foreground/85">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          className="font-semibold text-teal-600 underline decoration-teal-500/40 underline-offset-4 hover:text-teal-500 dark:text-teal-400"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
  },
  types: {
    image: ({ value }) => {
      const image = value as ArticleImage;
      if (!image.asset?._ref) {
        return null;
      }

      return (
        <figure className="my-12">
          <div className="overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={urlFor(image).width(1400).height(900).fit("crop").url()}
              alt={image.alt || "Article image"}
              width={1400}
              height={900}
              className="h-auto w-full object-cover"
            />
          </div>
          {image.caption ? (
            <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function NewsArticleBody({ content, fallback }: ArticleBodyProps) {
  if (content?.length) {
    return <PortableText value={content} components={components} />;
  }

  return fallback ? (
    <div className="space-y-7">
      {fallback
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph) => (
          <p
            key={paragraph}
            className="font-serif text-xl leading-9 text-foreground/85 md:text-[1.35rem] md:leading-10"
          >
            {paragraph}
          </p>
        ))}
    </div>
  ) : (
    <p className="font-serif text-xl leading-9 text-muted-foreground">
      This story does not have body copy yet.
    </p>
  );
}
