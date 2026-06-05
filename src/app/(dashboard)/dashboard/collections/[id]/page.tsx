import { CollectionSourcesView } from "@/components/dashboard/sources/collection-sources-view";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  return <CollectionSourcesView collectionID={id} />;
}
