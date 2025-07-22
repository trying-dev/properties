"use client";

import { useSelector } from " +/redux";

export default function Tenant() {
  const tenant = useSelector((s) => s.property.tenant);

  if (!tenant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-xl mb-3">Tenant</h3>

      <div className="p-5 rounded-lg border">
        <p>Full Name: {tenant.fullName}</p>
        <p>Identification Document: {tenant.identificationDocument}</p>
        <p>Birth Date: {new Date(tenant.birthDate).toLocaleDateString()}</p>
        <p>Phone: {tenant.phone}</p>
        <p>Email: {tenant.email}</p>
        <p>Additional Address: {tenant.additionalAddress || "N/A"}</p>
        <p>Additional residents: || N/A</p>
      </div>

      <div className="p-5 rounded-lg border">
        <p>
          Lease Start Date:
          {new Date(tenant.leaseStartDate).toLocaleDateString()}
        </p>
        <p>Lease End Date: {new Date(tenant.leaseEndDate).toLocaleDateString()}</p>
        <p>Contract Duration: {tenant.contractDuration}</p>
        <p>Renewal Terms: {tenant.renewalTerms || "N/A"}</p>
        <p>Security Deposit: ${tenant.securityDeposit}</p>
        <p>Specific Clauses: {tenant.specificClauses || "N/A"}</p>
      </div>
      <div className="p-5 rounded-lg border">tenant</div>

      <div className="p-5 rounded-lg border">
        <p>Rent Amount: ${tenant.rentAmount}</p>
        <p>Preferred Payment Method: {tenant.preferredPaymentMethod}</p>
        <p>Discounts or Adjustments: {tenant.discountsOrAdjustments || "N/A"}</p>
      </div>

      <div className="p-5 rounded-lg border">
        <p>Tenant Utilities: {tenant.tenantUtilities || "N/A"}</p>
        <p>Basic Maintenance: {tenant.basicMaintenance || "N/A"}</p>
        <p>Reported Issues: {tenant.reportedIssues || "None"}</p>
        <p>Pets: {tenant.pets || "N/A"}</p>
      </div>

      <div className="p-5 rounded-lg border">
        <p>Move-in Date: {new Date(tenant.moveInDate).toLocaleDateString()}</p>
        <p>Absence Periods: {tenant.absencePeriods || "None"}</p>
        <p>Contract Modifications: {tenant.contractModifications || "None"}</p>
      </div>

      <div className="p-5 rounded-lg border">
        <p>Satisfaction Surveys: {tenant.satisfactionSurveys || "N/A"}</p>
        <p>Communication History: {tenant.communicationHistory || "N/A"}</p>
        <p>Incidents: {tenant.incidents || "None"}</p>
      </div>

      <div className="p-5 rounded-lg border">
        <p>Emergency Contact Name: {tenant.emergencyContactName}</p>
        <p>Emergency Contact Phone: {tenant.emergencyContactPhone}</p>
        <p>Emergency Contact Relation: {tenant.emergencyContactRelation}</p>
        <p>Trusted Person: {tenant.trustedPerson || "N/A"}</p>
        <p>Created At: {new Date(tenant.createdAt).toLocaleDateString()}</p>
        <p>Updated At: {new Date(tenant.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
