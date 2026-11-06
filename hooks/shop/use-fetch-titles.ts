import {client} from "@/lib/sanity";
import {useQuery} from "@tanstack/react-query";
import {Title} from "@/types/shop";

const useFetchTitles = () => {
    const {
        data: titles,
        isPending: isLoading
    } = useQuery<Title[]>({
        queryKey: ['titles'],
        queryFn: async () => {
            return await client.fetch(`
               *[_type == "title"] | order(_createdAt desc) {
                  _id,
                  name,
                  image
                }
            `);
        },
    });

    return {
        titles,
        isLoading
    }
}

export default useFetchTitles;