"use client";

import { Service } from "@prisma/client";

export default function ServiceCard({ service }: { service: Service }) {
  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-5   h-fit">
      <div key={service.id} className="flex flex-col gap-1 border-b rounded-lg p-5  bg-slate-100">
        <h3 className="font-bold text-xl mb-3">Service Type: {service.serviceType}</h3>

        <div className="p-5 rounded-lg border">
          <p>Provider: {service.provider}</p>
          <p>Account Number: {service.accountNumber}</p>
          <p>Payment Responsible: {service.paymentResponsible}</p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>Emergency Number: {service.emergencyNumber}</p>
          <p>Support Contact Name: {service.supportContactName}</p>
          <p>Support Contact Phone: {service.supportContactPhone}</p>
          <p>
            Support Contact Email:
            {service.supportContactEmail || "No email provided"}
          </p>
          <p>Support Hours: {service.supportHours}</p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>
            Disconnection Clause:
            {service.disconnectionClause || "No disconnection clause provided"}
          </p>
          <p>
            Contract Conditions:
            {service.contractConditions || "No contract conditions provided"}
          </p>
          <p>
            Shared Responsibilities:
            {service.sharedResponsibilities || "No shared responsibilities provided"}
          </p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>Created At: {new Date(service.createdAt).toLocaleDateString()}</p>
          <p>Updated At: {new Date(service.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
