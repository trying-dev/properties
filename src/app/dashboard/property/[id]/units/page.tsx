"use client";

import { useSelector } from " +/redux";

export default function UnitsInformation() {
  const units = useSelector((state) => state.property.units);

  if (!units) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-xl mb-3">Units Information</h3>

      {/* Units */}
      <section>
        <h4 className="font-semibold text-lg mb-2">Units</h4>
        {units.map((unit) => (
          <div key={unit.id} className="p-3 border border-gray-200 rounded">
            <p>
              <strong>Unit Type:</strong> {unit.unitType}
            </p>
            <p>
              <strong>Unit Number:</strong> {unit.unitNumber}
            </p>
            <p>
              <strong>Available:</strong> {unit.isAvailable ? "Yes" : "No"}
            </p>

            {/* Contracts */}
            {unit.contracts?.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold text-md">Contracts:</h5>
                {unit.contracts.map((contract) => (
                  <div key={contract.id} className="pl-3 mt-2">
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
                    {contract.documentLink && (
                      <a
                        href={contract.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Contract Document
                      </a>
                    )}

                    {/* Tenants */}
                    {contract.tenants?.length > 0 && (
                      <div className="mt-3">
                        <h6 className="font-semibold">Tenants:</h6>
                        <div className="flex flex-col gap-3 mt-2">
                          {contract.tenants.map((tenant) => (
                            <div key={tenant.id} className="p-5 rounded-lg border">
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
                        </div>
                      </div>
                    )}

                    {/* Sub-Tenants */}
                    {contract.subTenants?.length > 0 && (
                      <div className="mt-3">
                        <h6 className="font-semibold">Sub-Tenants:</h6>
                        <div className="flex flex-col gap-3 mt-2">
                          {contract.subTenants.map((subTenant) => (
                            <div key={subTenant.id} className="p-5 rounded-lg border">
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
                        </div>
                      </div>
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
