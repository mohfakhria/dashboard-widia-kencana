import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id?: string } }): Promise<Metadata> {
  if (params?.id === "create") {
    return {
      title: "Create New Quotation | PT. Widia Kencana Dashboard",
      description: "Form to create a new quotation for PT. Widia Kencana Dashboard Platform.",
    };
  }

  if (params?.id) {
    return {
      title: `Quotation ${params.id} | PT. Widia Kencana Dashboard`,
      description: `Detailed view of quotation ${params.id} on PT. Widia Kencana Dashboard Platform.`,
    };
  }

  return {
    title: "Quotation List | PT. Widia Kencana Dashboard",
    description: "Quotation List for PT. Widia Kencana Dashboard Platform.",
  };
}

export default function QuotationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}