"use client";

import Insurance from "./features/Insurance";
import { useSelector } from " +/redux";

export default function Insurances() {
  const insurances = useSelector((s) => s.property.insurances);

  if (!insurances) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {insurances.map((insurance) => (
        <Insurance key={insurance.id} insurance={insurance} />
      ))}
    </div>
  );
}
