import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Buy Products | Forge India Connect",
    description: "Shop local products from trusted sellers in your area - fresh produce, handmade goods, and more",
};

export default function BuyProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
