import { useQuery } from "@tanstack/react-query";
import { getNewsStories } from "@/lib/sanity";
import { type NewsStory } from "@/types/news";

interface UseFetchNewsStoriesResult {
  stories: NewsStory[] | undefined;
  isLoading: boolean;
}

const useFetchNewsStories = (): UseFetchNewsStoriesResult => {
  const {
    data: stories,
    isPending: isLoading,
  } = useQuery<NewsStory[]>({
    queryKey: ["newsStories"],
    queryFn: getNewsStories,
  });

  return {
    stories,
    isLoading,
  };
};

export default useFetchNewsStories;
