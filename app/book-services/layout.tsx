import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book Services | Forge India Connect",
    description: "Find and book trusted local services near you - from home repairs to professional services",
};

export default function BookServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
