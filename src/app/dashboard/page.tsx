"use client";

import { useEffect, useState } from "react";

import CardAdmin from "./fragments/CardAdmin";
import CardProperty, { PropertyWithAddress } from "./fragments/CardProperty";

import { getPropertiesWithAddress } from " +/actions/property/actions_and_mutations";

export default function Dashboard() {
  const [properties, setProperties] = useState<PropertyWithAddress[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      const properties = await getPropertiesWithAddress();
      setProperties(properties);
    }
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-[150px] min-h-screen justify-center items-center p-5">
      <div className="flex flex-col gap-5 p-5 rounded-lg border w-full max-w-[441px] h-fit">
        {properties.map((property) => (
          <CardProperty key={property.id} property={property} />
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-[150px] w-full max-w-[441px]">
        <div className="flex flex-col gap-5 p-5 rounded-lg border w-full h-fit">
          {new Array(5).fill(null).map(() => (
            <CardAdmin key={Math.random()} />
          ))}
        </div>
      </div>
    </div>
  );
}
