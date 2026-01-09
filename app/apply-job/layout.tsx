import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Jobs | Forge India Connect",
    description: "Discover local job opportunities and apply to positions that match your skills and experience",
};

export default function ApplyJobLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
