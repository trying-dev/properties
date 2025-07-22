"use client";

import { useSelector } from " +/redux";

export default function Information() {
  const info = useSelector((s) => s.property.information);

  if (!info) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-bold text-xl mb-3">Information</h2>

      <div className="flex flex-col gap-5">
        <div className="p-5 rounded-lg border">
          <p>Street and Number: {info.streetAndNumber}</p>
          <p>Neighborhood: {info.neighborhood}</p>
          <p>City and State: {info.cityAndState}</p>
          <p>Postal code: {info.postalCode}</p>
          <p>GPS Coordinates: {info.gpsCoordinates}</p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>Property type: {info.propertyType}</p>
          <p>Total land area: {info.totalLandArea} m²</p>
          <p>Built area: {info.builtArea} m²</p>
          <p>Floors: {info.floors}</p>
          <p>Orientation: {info.orientation}</p>
          <p>Age: {info.age} years</p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>Bedrooms: {info.bedrooms}</p>
          <p>Bathrooms: {info.bathrooms}</p>
          <p>Half bathrooms: {info.halfBathrooms}</p>
          <p>Kitchen description: {info.kitchen}</p>
          <p>Living and dining description: {info.livingAndDining}</p>
          <p>Additional rooms: {JSON.stringify(info.additionalRooms)}</p>
        </div>

        <div className="p-5 rounded-lg border">
          <p>Yard or garden: {info.yardOrGarden}</p>
          <p>Parking spots: {info.parking}</p>
          <p>Parking location: {info.parkingLocation}</p>
          <p>Balconies and terraces: {info.balconiesAndTerraces}</p>
          <p>Recreational areas: {JSON.stringify(info.recreationalAreas)}</p>
        </div>
      </div>
    </div>
  );
}
