import { PropertyWithId, PropertyWithIdPrisma } from "./types";

export const PropertiesConverter = (properties: PropertyWithIdPrisma[]) =>
  properties.map((property) => converterProperty(property));

const converterProperty = (property: PropertyWithIdPrisma): PropertyWithId => ({
  ...property,
  availableFrom: property.availableFrom ? new Date(property.availableFrom) : undefined,
});
