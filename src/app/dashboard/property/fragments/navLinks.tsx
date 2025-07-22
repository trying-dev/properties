"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { path: "info", label: "Information" },
  { path: "legal", label: "Legal" },
  { path: "units", label: "Units" },
  { path: "insurance", label: "Insurance" },
  { path: "services", label: "Services" },
  { path: "economy", label: "Economy" },
  { path: "architectures", label: "Architectures" },
  { path: "equip", label: "Equipments" },
];

export function NavLinks() {
  const pathname = usePathname();

  const pathParts = pathname.split("/"); // Split the current path by '/' and retrieve the property ID from the correct position
  const propertyId = pathParts[3]; // The property ID is assumed to be in the 4th position

  return (
    <nav className="flex flex-wrap gap-5">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={`/dashboard/property/${propertyId}/${link.path}`}
          className={`
            px-5 py-2 rounded-full text-xl font-medium transition-all duration-200
            ${
              pathname.includes(link.path)
                ? "bg-black text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-black"
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            active:scale-95
          `}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
