import { redirect } from "next/navigation";

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/shop/products?${new URLSearchParams({ anime: slug })}`);
}
