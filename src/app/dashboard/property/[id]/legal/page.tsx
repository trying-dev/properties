"use client";

import { useSelector } from " +/redux";

export default function Information() {
  const legal = useSelector((s) => s.property.legal);

  if (!legal) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-xl mb-3">Legal</h3>

      {/* Title Documents */}
      <section>
        <h4 className="font-semibold text-lg mb-2">Title Documents</h4>
        {legal.titleDocuments?.map((doc) => (
          <div key={doc.id} className="p-3">
            <p>
              <strong>Deed Number:</strong> {doc.deedNumber}
            </p>
            <p>
              <strong>Notary:</strong> {doc.notary}
            </p>
            <p>
              <strong>Date Issued:</strong> {new Date(doc.deedDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Registry:</strong> {doc.publicRegistry}
            </p>
            <p>
              <strong>Current:</strong> {doc.isCurrent ? "Yes" : "No"}
            </p>
            <a
              href={doc.documentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Document
            </a>
          </div>
        ))}
      </section>

      {/* Units */}
      <section>
        <h4 className="font-semibold text-lg mb-2">Units</h4>
        {legal.units?.map((unit) => (
          <div key={unit.id} className="p-3">
            <p>
              <strong>Unit Type:</strong> {unit.unitType}
            </p>
            <p>
              <strong>Unit Number:</strong> {unit.unitNumber}
            </p>
            <p>
              <strong>Available:</strong> {unit.isAvailable ? "Yes" : "No"}
            </p>
            {unit.contracts?.length > 0 && (
              <div className="mt-2">
                <h5 className="font-semibold">Contracts:</h5>
                {unit.contracts.map((contract) => (
                  <div key={contract.id} className="pl-3">
                    <p>
                      <strong>Type:</strong> {contract.contractType}
                    </p>
                    <p>
                      <strong>Name:</strong> {contract.contractName}
                    </p>
                    <p>
                      <strong>Duration:</strong> {contract.contractDuration}
                    </p>
                    <p>
                      <strong>Active:</strong> {contract.isActive ? "Yes" : "No"}
                    </p>
                    {contract.tenantResponsibilities && (
                      <p>
                        <strong>Tenant Responsibilities:</strong> {contract.tenantResponsibilities}
                      </p>
                    )}
                    {contract.ownerResponsibilities && (
                      <p>
                        <strong>Owner Responsibilities:</strong> {contract.ownerResponsibilities}
                      </p>
                    )}
                    {contract.pets && (
                      <p>
                        <strong>Pets Allowed:</strong> {contract.pets}
                      </p>
                    )}
                    <h6 className="font-semibold mt-2">Tenants:</h6>
                    {contract.tenants?.map((tenant) => (
                      <div key={tenant.id} className="pl-5">
                        <p>
                          <strong>Name:</strong> {tenant.user.name} {tenant.user.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {tenant.user.email}
                        </p>
                        {tenant.user.phone && (
                          <p>
                            <strong>Phone:</strong> {tenant.user.phone}
                          </p>
                        )}
                        {tenant.user.address && (
                          <p>
                            <strong>Address:</strong> {tenant.user.address}
                          </p>
                        )}
                        {tenant.user.birthDate && (
                          <p>
                            <strong>Birth Date:</strong>{" "}
                            {new Date(tenant.user.birthDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                    <h6 className="font-semibold mt-2">Sub-Tenants:</h6>
                    {contract.subTenants?.map((subTenant) => (
                      <div key={subTenant.id} className="pl-5">
                        <p>
                          <strong>Name:</strong> {subTenant.user.name} {subTenant.user.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {subTenant.user.email}
                        </p>
                        {subTenant.user.phone && (
                          <p>
                            <strong>Phone:</strong> {subTenant.user.phone}
                          </p>
                        )}
                        {subTenant.user.address && (
                          <p>
                            <strong>Address:</strong> {subTenant.user.address}
                          </p>
                        )}
                        {subTenant.user.birthDate && (
                          <p>
                            <strong>Birth Date:</strong>{" "}
                            {new Date(subTenant.user.birthDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                    {contract.documentLink && (
                      <a
                        href={contract.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Contract
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
