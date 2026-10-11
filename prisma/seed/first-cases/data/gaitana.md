# Casa Gaitana

PROPIEDAD

# — Identificación —

nombre: Casa Gaitana
tipo: EDIFICIO
estado: ACTIVA
modo_arriendo: MIXTO # locales + apartamentos
descripcion: Casa de 3 pisos con local y unidades residenciales.
gestor: admin dueño (ver seed-casa-tibabuyes-owners)

# — Dirección —

direccion: [CONSULTAR]
barrio: Gaitana
localidad: Suba
ciudad: Bogotá
departamento: Cundinamarca
pais: Colombia
codigo_postal: [CONSULTAR] # fallback 00000
estrato: 3
gps: 4.739513400735189, -74.10871951331606 # (est) confirmar

# — Estructura —

pisos: 3
area_construida: [CONSULTAR] m2
area_lote: 6 m2 \* 12 m2
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

- codigo: CG-01-LOCAL-001
  piso: 1
  area: [CONSULTAR] m2 (est)
  habitaciones: 0
  baños: 1
  tiene: espacio en L, baño, entrada independiente
  estado: ARRENDADO
  renta: 800.000 (cop)
  deposito: 0
  descripcion: Local comercial en L con entrada independiente y bañoindependiente que comparte servicios de agua y luz.

- codigo: CG-01-APT-001
  piso: 1
  area: [CONSULTAR]
  habitaciones: 2
  baños: 1
  tiene: cocina, baño, comedor
  mascotas: sí
  estado: ARRENDADO
  renta: 700.000 (col)
  deposito: No
  descripcion: Unidad con cocina y baño privado.

- codigo: CG-01-APT-002
  piso: 2
  area: [CONSULTAR] m2 (est)
  habitaciones: 2
  baños: 1
  tiene: cocina, baño, sala-comedor
  mascotas: sí
  estado: ARRENDADO
  renta: 750.000 (est)
  deposito: 0
  descripcion: Apartamento con 2 habitaciones, cocina, sala-comedor y baño privado que comparte servicios de agua, luz y gas.

- codigo: CG-01-APT-003
  piso: 2
  area: [CONSULTAR] m2 (est)
  habitaciones: 2
  baños: 1
  tiene: cocina, baño, sala-comedor, lavado
  mascotas: sí
  estado: ARRENDADO
  renta: 800.000(est)
  deposito: 0
  descripcion: Apartamento con 2 habitaciones, sala-comedor, cocina, baño y área de lavado, que comparte servicios de agua, luz y gas.

- codigo: CG-01-APT-004
  piso: 3
  area: [CONSULTAR] m2 (est)
  habitaciones: 2
  baños: 1
  tiene: 2 habitaciones, cocina, baño, sala-comedor
  mascotas: NO
  estado: LIBRE
  renta: 700.000 (est)
  deposito: 0
  descripcion: Habitación en piso compartido.
