"use client";

import Image from "next/image";
import Link from "next/link";
import Todays from "@/components/news/Todays";
import useFetchNewsStories from "@/hooks/news/use-fetch-news";
import { type NewsStory } from "@/types/news";

function formatDate(value?: string) {
  if (!value) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function NewsPage() {
  const { stories = [], isLoading } = useFetchNewsStories();
  const featuredStory = stories.find((story) => story.isFeatured) || stories[0];
  const secondaryStories = stories.filter((story) => story._id !== featuredStory?._id).slice(0, 4);
  const groupedSections = Object.values(
    stories.reduce<Record<string, { title: string; featured?: NewsStory; items: NewsStory[] }>>((acc, story) => {
      const sectionTitle = story.section || "Featured";
      if (!acc[sectionTitle]) {
        acc[sectionTitle] = { title: sectionTitle, featured: undefined, items: [] };
      }

      const sectionGroup = acc[sectionTitle];
      if (!sectionGroup.featured || story.isFeatured) {
        sectionGroup.featured = story;
      }

      if (sectionGroup.featured?._id !== story._id) {
        sectionGroup.items.push(story);
      }

      return acc;
    }, {})
  )
    .map((section) => ({
      ...section,
      items: section.items.slice(0, 5),
      panelClassName: stories.find((story) => story.section === section.title)?.panelClassName || "bg-indigo-700",
      textClassName: stories.find((story) => story.section === section.title)?.textClassName || "text-white",
      itemClassName: stories.find((story) => story.section === section.title)?.itemClassName || "hover:bg-indigo-800",
    }))
    .filter((section) => section.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-64 rounded-lg bg-gray-800" />
          <div className="h-32 rounded-lg bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white max-w-full min-h-screen p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-800 p-6 shadow-md">
            <div className="text-center">
              {featuredStory?.imageUrl ? (
                <Link href={`/news/${encodeURIComponent(featuredStory._id)}`}>
                  <Image
                    src={featuredStory.imageUrl}
                    alt={featuredStory.title}
                    width={1200}
                    height={640}
                    className="mb-4 h-64 w-full rounded-lg object-cover shadow-md"
                  />
                </Link>
              ) : (
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-lg">
                  <div className="text-xl font-bold">{featuredStory?.tag || "News"}</div>
                </div>
              )}
              <h1 className="mb-2 text-3xl font-bold transition duration-300 hover:text-teal-300">
                {featuredStory ? (
                  <Link href={`/news/${encodeURIComponent(featuredStory._id)}`}>{featuredStory.title}</Link>
                ) : (
                  "Latest stories from the community"
                )}
              </h1>
              <p className="mb-4 text-lg text-gray-400">
                {featuredStory?.summary || featuredStory?.description || "Fresh updates from our latest coverage."}
              </p>
              <p className="text-sm text-gray-500">
                {featuredStory?.authorName || featuredStory?.author?.name || "Staff"} - {formatDate(featuredStory?.publishedAt)}
              </p>
            </div>
          </div>

          <Todays stories={secondaryStories} />

          {secondaryStories[0] ? (
            <div>
              {secondaryStories[0].imageUrl ? (
                <Link href={`/news/${encodeURIComponent(secondaryStories[0]._id)}`}>
                  <Image
                    src={secondaryStories[0].imageUrl}
                    alt={secondaryStories[0].title}
                    width={1200}
                    height={640}
                    className="mb-4 rounded-lg shadow-md"
                  />
                </Link>
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-gray-700 shadow-md">
                  <span className="text-lg font-semibold">{secondaryStories[0].tag || "News"}</span>
                </div>
              )}
              <h2 className="mb-2 text-2xl font-bold transition duration-300 hover:text-teal-300">
                <Link href={`/news/${encodeURIComponent(secondaryStories[0]._id)}`}>
                  {secondaryStories[0].title}
                </Link>
              </h2>
              <p className="mb-2 text-lg text-gray-400">
                {secondaryStories[0].summary || secondaryStories[0].description}
              </p>
              <p className="text-sm text-gray-500">
                {secondaryStories[0].authorName || secondaryStories[0].author?.name || "Staff"} - {formatDate(secondaryStories[0].publishedAt)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg bg-indigo-700 p-6 shadow-md lg:sticky lg:top-20">
          <h2 className="mb-4 text-2xl font-bold">Latest Headlines</h2>
          <ul className="space-y-4">
            {stories.slice(0, 5).map((item) => (
              <li key={item._id} className="rounded transition duration-200 hover:bg-indigo-800">
                <Link href={`/news/${encodeURIComponent(item._id)}`} className="block p-4">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-300">
                    {item.authorName || item.author?.name || "Staff"} - {formatDate(item.publishedAt)} | {item.commentsCount || 0} comments
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {groupedSections.map((section) => (
        <div key={section.title} className="grid grid-cols-1 gap-6 pt-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-800 p-6 shadow-md">
              <div className="text-center">
                {section.featured?.imageUrl ? (
                  <Link href={`/news/${encodeURIComponent(section.featured._id)}`}>
                    <Image
                      src={section.featured.imageUrl}
                      alt={section.featured.title}
                      width={1200}
                      height={640}
                      className="mb-4 h-64 w-full rounded-lg object-cover shadow-md"
                    />
                  </Link>
                ) : (
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-lg">
                    <div className="text-xl font-bold">{section.title}</div>
                  </div>
                )}
                <h2 className="mb-2 text-3xl font-bold transition duration-300 hover:text-teal-300">
                  {section.featured ? (
                    <Link href={`/news/${encodeURIComponent(section.featured._id)}`}>
                      {section.featured.title}
                    </Link>
                  ) : null}
                </h2>
                <p className="mb-4 text-lg text-gray-400">
                  {section.featured?.summary || section.featured?.description}
                </p>
                <p className="text-sm text-gray-500">
                  {section.featured?.authorName || section.featured?.author?.name || "Staff"} - {formatDate(section.featured?.publishedAt)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className={`rounded-lg p-6 shadow-md lg:sticky lg:top-20 ${section.panelClassName} ${section.textClassName}`}>
              <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
              <ul className="space-y-4">
                {section.items.map((item) => (
                  <li key={item._id} className={`rounded transition duration-200 ${section.itemClassName}`}>
                    <Link href={`/news/${encodeURIComponent(item._id)}`} className="block p-4">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-80">
                        {item.authorName || item.author?.name || "Staff"} - {formatDate(item.publishedAt)} | {item.commentsCount || 0} comments
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
