"use-client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { toast } from "sonner";

export function useDeleteProduct ({merchantId}: {merchantId: string}) {
    const queryClient = useQueryClient();

    return  useMutation({
        mutationFn: async (productId: string) => {
          return client.delete(productId);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['products', merchantId] });
          toast.success("Product deleted successfully");
        },
      });
}