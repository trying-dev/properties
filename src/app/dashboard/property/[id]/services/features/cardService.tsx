"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Service } from " +/redux/store";

import CardInsident from "./CardInsident";
import CardPayment from "./CardPayment";

export default function CardService({ service }: { service: Service }) {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const propertyId = pathParts[3];

  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-5 w-full">
      <div key={service.id} className="flex flex-col gap-4 items-center  border-b rounded-lg p-5">
        <h3 className="font-bold text-xl mb-3">{service.serviceType}</h3>

        <div className="p-5 rounded-lg border w-full">
          <p>Provider: {service.provider}</p>
          <p>Account Number: {service.accountNumber}</p>
          <p>Payment Responsible: {service.paymentResponsible}</p>
        </div>

        <h3 className="text-lg">Payments</h3>

        <div className="flex flex-col gap-5 p-5 border w-full">
          {service.servicePayment.map((s) => (
            <CardPayment key={s.id} info={s} />
          ))}
        </div>

        <h3 className="text-lg">Incidents</h3>

        <div className="flex flex-col gap-5 p-5 border w-full">
          {service.incident.map((i) => (
            <CardInsident key={i.id} info={i} />
          ))}
        </div>

        <Link
          className={`py-3 px-4 bg-[#D9D9D9] rounded-full transition-all w-auto`}
          href={`/dashboard/property/${propertyId}/services/${service.id}`}
        >
          ver
        </Link>
      </div>
    </div>
  );
}
