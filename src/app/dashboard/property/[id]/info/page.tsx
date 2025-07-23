"use client";

import InfoRow from " +/app/dashboard/fragments/InfoRow";
import { useSelector } from " +/redux";
import { capitalize } from " +/utils";

export default function Information() {
  const property = useSelector((s) => s.property);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-2xl">Información del inmueble</h2>

      <div className="flex flex-col gap-5">
        <div className="p-5 rounded-lg border">
          <InfoRow label="Nombre" value={property.name} />
          <InfoRow label="Descripción" value={property.description} />
          <InfoRow label="Estado" value={capitalize(property.status)} />
        </div>

        <div className="p-5 rounded-lg border">
          <InfoRow label="Calle y número" value={property.streetAndNumber} />
          <InfoRow label="Barrio" value={property.neighborhood} />
          <InfoRow label="Ciudad" value={property.city} />
          <InfoRow label="Estado" value={property.State} />
          <InfoRow label="Código postal" value={property.postalCode} />
          <InfoRow label="Coordenadas GPS" value={property.gpsCoordinates} />
          <InfoRow label="País" value={property.country} />
        </div>

        <div className="p-5 rounded-lg border">
          <InfoRow label="Tipo de propiedad" value={capitalize(property.propertyType)} />
          <InfoRow label="Área total" value={property.totalLandArea} postfix="m²" />
          <InfoRow label="Área construida" value={property.builtArea} postfix="m²" />
          <InfoRow label="Pisos" value={property.floors} />
          <InfoRow label="Antigüedad" value={property.age} postfix="años" />
        </div>

        <div className="p-5 rounded-lg border">
          <InfoRow label="Jardín o patio" value={property.yardOrGarden} />
          <InfoRow label="Parqueaderos" value={property.parking} />
          <InfoRow label="Ubicación de parqueadero" value={property.parkingLocation} />
          <InfoRow label="Balcón o terraza" value={property.balconiesAndTerraces} />
          <InfoRow label="Recreational areas" value={JSON.stringify(property.recreationalAreas)} />
        </div>
      </div>
    </div>
  );
}
