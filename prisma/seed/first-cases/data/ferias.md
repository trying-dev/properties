# Casa Ferias

PROPIEDAD

# — Identificación —

nombre: Casa Ferias
tipo: EDIFICIO
estado: ACTIVA
modo_arriendo: MIXTO # locales + apartamentos
descripcion: Casa de 3 pisos con local y unidades residenciales.
gestor: admin dueño (ver seed-casa-tibabuyes-owners)

# — Dirección —

direccion: [CONSULTAR]
barrio: Ferias
localidad: Engativa
ciudad: Bogotá
departamento: Cundinamarca
pais: Colombia
codigo_postal: [CONSULTAR] # fallback 00000
estrato: 3
gps: 4.686104904869476, -74.08861814559945 # (est) confirmar

# — Estructura —

pisos: 2
area_construida: [CONSULTAR] m2
area_lote: 8 m2 \* 13 m2
edad: 20 años # (est)
año_construccion: [CONSULTAR]
material: ladrillo, bloque, placa masisa, placa facil y tejas metalicas en estructura
conjunto: No
edificio: No

# — Valores —

valor_comercial: ??? # [CONSULTAR]
valor_catastral: ??? # [CONSULTAR] — base del predial

# — Exterior y zonas comunes —

parqueaderos: 0
ubicacion_parqueo: ???
patio_jardin: ???
balcones_terrazas: ???
areas_recreativas: ???
zonas_comunes: escaleras, pasillo primer piso, pasillo segundo piso

UNIDADES

- codigo: CF-01-LOCAL-001
  piso: 1
  area: [CONSULTAR] m2 (est)
  habitaciones: 0
  baños: 1
  tiene: 1 espacio
  estado: ARRENDADO
  renta: 800.000 (cop)
  deposito: 0
  descripcion: Local comercial con entrada independiente y baño independiente que comparte servicios de agua y luz.

- codigo: CG-01-APST-001
  piso: 1
  area: [CONSULTAR]
  habitaciones: 1
  baños: 1
  tiene: cocina, baño
  mascotas: sí
  estado: ARRENDADO
  renta: 500.000 (col)
  deposito: No
  descripcion: Aparta estudio con baño y cocina que comparte servicios de agua, luz y gas.

- codigo: CG-01-APST-002
  piso: 1
  area: [CONSULTAR]
  habitaciones: 1
  baños: 1
  tiene: cocina, baño
  mascotas: sí
  estado: ARRENDADO
  renta: 500.000 (col)
  deposito: No
  descripcion: Aparta estudio con baño y cocina que comparte servicios de agua, luz y gas.

- codigo: CG-01-APST-003
  piso: 2
  area: [CONSULTAR]
  habitaciones: 1
  baños: 1
  tiene: cocina, baño
  mascotas: sí
  estado: ARRENDADO
  renta: 600.000 (col)
  deposito: No
  descripcion: Aparta estudio con baño y cocina que comparte espacio le lavado, servicios de agua, luz y gas.

- codigo: CG-01-APT-001
  piso: 1
  area: [CONSULTAR] m2 (est)
  habitaciones: 3
  baños: 1
  tiene: cocina, baño
  mascotas: sí
  estado: ARRENDADO
  renta: 900.000 (est)
  deposito: 0
  descripcion: Apartamento con 3 habitaciones, cocina y baño privado que comparte espacio le lavado, servicios de agua, luz y gas.

- codigo: CG-01-APT-002
  piso: 1
  area: [CONSULTAR] m2 (est)
  habitaciones: 2
  baños: 1
  tiene: cocina, baño, lavado
  mascotas: sí
  estado: ARRENDADO
  renta: 800.000(est)
  deposito: 0
  descripcion: Apartamento con 2 habitaciones, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.

- codigo: CG-01-APT-003
  piso: 2
  area: [CONSULTAR] m2 (est)
  habitaciones: 1
  baños: 1
  tiene: 2 habitaciones, cocina, baño, sala-comedor
  mascotas: NO
  estado: LIBRE
  renta: 700.000 (est)
  deposito: 0
  descripcion: Apartamento con 1 habitacion, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.

- codigo: CG-01-APT-004
  piso: 2
  area: [CONSULTAR] m2 (est)
  habitaciones: 1
  baños: 1
  tiene: 2 habitaciones, cocina, baño, sala-comedor
  mascotas: NO
  estado: LIBRE
  renta: 700.000 (est)
  deposito: 0
  descripcion: Apartamento con 1 habitacion, sala-comedor, cocina, baño, que comparte espacio le lavado, servicios de agua, luz y gas.

- codigo: CG-01-APT-003
  piso: 2
  area: [CONSULTAR] m2 (est)
  habitaciones: 2
  baños: 1
  tiene: 2 habitaciones, cocina, baño, sala-comedor, espacio le lavado
  mascotas: SI
  estado: LIBRE
  renta: 800.000 (est)
  deposito: 0
  descripcion: Apartamento con 2 habitacion, sala-comedor, cocina, baño, espacio le lavado, que comparte servicios de agua, luz y gas.
