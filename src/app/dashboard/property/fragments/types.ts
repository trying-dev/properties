import { Prisma } from "@prisma/client";

export interface Property {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  address: string;
  price?: number; // Precio de la propiedad
  size?: number; // Tamaño en metros cuadrados
  bedrooms?: number; // Número de dormitorios
  bathrooms?: number; // Número de baños
  garage?: boolean; // Si tiene garaje o no
  garden?: boolean; // Si tiene jardín o no
  balcony?: boolean; // Si tiene balcón o no
  petFriendly?: boolean; // Si se permiten mascotas
  propertyType?: string; // Tipo de propiedad (ej. Casa, Apartamento)
  yearBuilt?: number; // Año de construcción
  description?: string; // Descripción adicional
  heatingType?: string; // Tipo de calefacción (ej. Eléctrico, Gas)
  coolingType?: string; // Tipo de refrigeración (ej. Aire acondicionado, Ventilador)
  availableFrom?: Date; // Fecha en que la propiedad está disponible
  status?: string; // Estado de la propiedad (ej. Disponible, Vendido, Alquilado)
}

export interface PropertyWithId extends Property {
  id: string;
}

export interface PropertyWithIdPrisma extends Prisma.PropertyCreateInput {
  id: string;
}
