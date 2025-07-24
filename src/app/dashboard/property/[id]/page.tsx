"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Building2,
  MapPin,
  User,
  Home,
  Key,
  Users,
  DollarSign,
  Settings,
  FileText,
  CreditCard,
  AlertCircle,
} from "lucide-react";

import { getProperty } from " +/actions/property/actions_and_mutations";
import { PropertyWithRelations } from " +/actions/property/manager";

import { ExpandablePropertyInfo } from "./fragments/ExpandablePropertyInfo";
import { ExpandablePropertyAdmin } from "./fragments/ExpandableAdminInfo";
import { ExpandableUnits } from "./fragments/ExpandableUnits";

const PropertyPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      if (!id || typeof id !== "string") {
        setError("ID de propiedad inválido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const propertyData = await getProperty({ id });

        if (!propertyData) {
          setError("Propiedad no encontrada");
          return;
        }

        setProperty(propertyData);
      } catch (err) {
        console.error("Error fetching property:", err);

        setError("Error al cargar la propiedad. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  // Calcular estadísticas dinámicamente
  const calculateStats = (units: NonNullable<PropertyWithRelations>["units"]) => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter((unit) =>
      unit.contracts.some((contract) => contract.status === "ACTIVE"),
    ).length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const totalMonthlyRent = units.reduce((sum, unit) => {
      const activeContract = unit.contracts.find((contract) => contract.status === "ACTIVE");
      return sum + (activeContract?.rent || 0);
    }, 0);

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      totalMonthlyRent,
    };
  };

  // Función para obtener el estado del último pago
  const getPaymentStatus = (
    payments: NonNullable<PropertyWithRelations>["units"][0]["contracts"][0]["payments"],
  ) => {
    if (!payments.length) return { status: "Sin pagos", color: "gray" };

    const latestPayment = payments[0]; // Ya están ordenados por fecha desc

    switch (latestPayment.status) {
      case "PAID":
        return { status: "Al día", color: "green" };
      case "PENDING":
        return { status: "Pendiente", color: "yellow" };
      case "OVERDUE":
        return { status: "Vencido", color: "red" };
      default:
        return { status: "Desconocido", color: "gray" };
    }
  };

  // Componentes auxiliares
  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {children}
    </div>
  );

  const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
  );

  const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`px-6 py-4 ${className}`}>{children}</div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró la propiedad</h3>
            <p className="text-gray-500">
              La propiedad solicitada no existe o no tienes permisos para verla.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats(property.units);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>
                  {property.street} #{property.number}, {property.neighborhood}, {property.city}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {property.status}
              </span>
            </div>
          </div>
        </div>

        {/* Top Row - Cards principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Información General */}
          <ExpandablePropertyInfo property={property} />

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total unidades:</span>
                  <span className="font-medium">{stats.totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ocupadas:</span>
                  <span className="font-medium text-green-600">{stats.occupiedUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vacantes:</span>
                  <span className="font-medium text-red-600">{stats.vacantUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ocupación:</span>
                  <span className="font-medium">{stats.occupancyRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos mensuales:</span>
                  <span className="font-medium text-green-600">
                    ${stats.totalMonthlyRent.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrador */}
          <ExpandablePropertyAdmin property={property} />
        </div>

        {/* Bottom Row - Secciones grandes */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Unidades */}
        <ExpandableUnits property={property} />

        {/* Zonas Comunes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Zonas Comunes</h3>
              </div>
              <span className="text-sm text-gray-500">{property.commonZones.length} zonas</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {property.commonZones.map((zone) => (
                <div
                  key={zone.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <span className="font-medium">{zone.name}</span>
                        {zone.description && <p className="text-sm text-gray-600">{zone.description}</p>}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        zone.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {zone.available ? "Disponible" : "No disponible"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Responsable: {zone.admin.user.name} {zone.admin.user.lastName}
                  </div>
                </div>
              ))}

              {/* Placeholder para más zonas comunes */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Agregar nueva zona común</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* </div> */}
      </div>
    </div>
  );
};

export default PropertyPage;
