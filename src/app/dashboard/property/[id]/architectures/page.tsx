"use client";

import { useSelector } from " +/redux";

const Architectures = () => {
  const architectures = useSelector((s) => s.property.architectures);

  if (!architectures || architectures.length === 0) {
    return <div className="p-6 text-center text-gray-500">No architecture data available.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Architectures</h1>

      {architectures.map((architecture) => {
        const { id, name, description, mapCoordinates, areaDimensions, maintenances, subelements } =
          architecture;

        return (
          <div key={id} className="bg-white shadow rounded-lg p-6 mb-6">
            {/* Architecture Overview */}
            <h2 className="text-2xl font-semibold mb-4">{name}</h2>
            {description && (
              <p className="text-lg">
                <span className="font-medium">Description:</span> {description}
              </p>
            )}
            {mapCoordinates && (
              <p className="text-lg">
                <span className="font-medium">Map Coordinates:</span> {mapCoordinates}
              </p>
            )}
            {areaDimensions && (
              <p className="text-lg">
                <span className="font-medium">Area Dimensions:</span> {areaDimensions}
              </p>
            )}

            {/* Sub-elements */}
            {subelements && subelements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Sub-elements</h3>
                <ul className="space-y-3">
                  {subelements.map((subelement) => (
                    <li key={subelement.id} className="p-4 bg-gray-50 rounded-md shadow">
                      <p className="text-lg font-medium">{subelement.name}</p>
                      {subelement.description && (
                        <p className="text-sm text-gray-600">{subelement.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Maintenance History */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Maintenance History</h3>
              {maintenances && maintenances.length > 0 ? (
                <ul className="space-y-3">
                  {maintenances.map((maintenance, index) => (
                    <li key={index} className="p-4 bg-gray-50 rounded-md shadow">
                      <p className="text-lg font-medium">Description: {maintenance.description}</p>
                      <p className="text-sm text-gray-600">Category: {maintenance.category}</p>
                      <p className="text-sm text-gray-600">Type: {maintenance.type}</p>
                      <p className="text-sm text-gray-600">
                        Maintenance Date: {new Date(maintenance.maintenanceDate).toLocaleDateString()}
                      </p>
                      {maintenance.nextMaintenanceDate && (
                        <p className="text-sm text-gray-600">
                          Next Maintenance Date:{" "}
                          {new Date(maintenance.nextMaintenanceDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Cost Responsible: {maintenance.costResponsible}</p>
                      <p className="text-sm text-gray-600">
                        Repair Cost:{" "}
                        {maintenance.repairCost ? `$${maintenance.repairCost.toFixed(2)}` : "N/A"}
                      </p>
                      {maintenance.warranty && (
                        <p className="text-sm text-gray-600">Warranty: {maintenance.warranty}</p>
                      )}
                      <p className="text-sm text-gray-600">Status: {maintenance.status || "Not specified"}</p>
                      {maintenance.observations && (
                        <p className="text-sm text-gray-600">Observations: {maintenance.observations}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No maintenance history available.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Architectures;
