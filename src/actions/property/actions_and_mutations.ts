"use server";

import { Prisma } from "@prisma/client";
import { propertyManager } from "./manager";

export async function createProperty({ data }: { data: Prisma.PropertyCreateInput }) {
  try {
    return await propertyManager.createProperty({ data });
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

export async function getProperties(props?: { options?: Prisma.PropertyFindManyArgs }) {
  try {
    return await propertyManager.getProperties(props);
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

export async function getPropertyById({
  id,
  options,
}: {
  id: string;
  options?: Prisma.PropertyFindUniqueArgs;
}) {
  try {
    return propertyManager.getPropertyById({ id, options });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    throw error;
  }
}

export async function updateProperty({ id, data }: { id: string; data: Prisma.PropertyUpdateInput }) {
  try {
    return await propertyManager.updateProperty({
      id,
      data,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

export async function deleteProperty({ id }: { id: string }) {
  try {
    return await propertyManager.deleteProperty({ id });
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
}

export async function getPropertyForReduxWhenComponentLoad({ id }: { id: string }) {
  try {
    const property = await propertyManager.getPropertyForReduxWhenComponentLoad({ id });
    return property;
  } catch (error) {
    console.error("Error fetching property getPropertyForReduxWhenComponentLoad:", error);
    throw error;
  }
}
