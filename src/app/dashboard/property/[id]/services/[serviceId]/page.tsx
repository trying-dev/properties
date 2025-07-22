"use client";

import { useEffect, useState } from "react";
import { PropertyBasicService } from "@prisma/client";

import { PropsJustParams } from "./types";
import { getPropertyBasicServiceById } from " +/actions/services/actions_and_mutations";

export default function Services({ params }: PropsJustParams) {
  const [id, setId] = useState<string | null>(null);
  const [services, setServices] = useState<PropertyBasicService[] | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setId(resolvedParams.serviceId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      async function fetchServicesProperty() {
        if (id !== null) {
          const property = await getPropertyBasicServiceById({ id });
          const { basicService } = property || { basicService: null };
          setServices(basicService);
        }
      }
      fetchServicesProperty();
    }
  }, [id]);

  console.log(" service :: ", services);
  if (!services) {
    return <div>Loading...</div>;
  }
  // const service = services.find((service) => service.id === id);

  return <div>service</div>;
}
