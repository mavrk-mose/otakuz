import { serializeShopFilter } from "@/lib/query-state";
import { redirect } from "next/navigation";

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(serializeShopFilter("/shop/products", { anime: slug }));
}
