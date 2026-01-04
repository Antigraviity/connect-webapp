import { Metadata } from "next";
import CompanyLayoutClient from "./CompanyLayoutClient";

export const metadata: Metadata = {
  title: "Employer Dashboard | Forge India Connect",
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyLayoutClient>{children}</CompanyLayoutClient>;
}
