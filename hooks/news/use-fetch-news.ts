import { useQuery } from "@tanstack/react-query";
import { getNewsStories } from "@/lib/sanity";
import { type NewsStory } from "@/types/news";

const useFetchNewsStories = () => {
  const {
    data: stories,
    isLoading,
  } = useQuery<NewsStory[]>({
    queryKey: ["newsStories"],
    queryFn: getNewsStories,
    staleTime: Infinity,
  });

  return {
    stories,
    isLoading,
  };
};

export default useFetchNewsStories;
