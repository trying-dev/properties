"use client";

import { useSelector } from " +/redux";
import CardService from "./features/cardService";

export default function Services() {
  const services = useSelector((s) => s.property.services);

  if (!services) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {services.map((service) => (
        <CardService key={service.id} service={service} />
      ))}
    </div>
  );
}
