import { notFound } from "next/navigation";
import { getProtocol } from "@/protocols";

// Force dynamic rendering since protocol components use wallet adapter
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ protocolId: string; slug?: string[] }>;
}

export default async function ProtocolPage({ params }: Props) {
  const { protocolId, slug } = await params;
  const protocol = getProtocol(protocolId);

  if (!protocol) {
    notFound();
  }

  const { RootComponent } = protocol;
  return <RootComponent slug={slug || []} />;
}
