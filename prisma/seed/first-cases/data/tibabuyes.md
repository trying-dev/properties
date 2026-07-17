# Casa Tibabuyes

> Nota: áreas y rentas provienen del seed demo actual → tratar como **(est)** hasta
> confirmar valores reales. Barrio corregido de "Chapinero" (error del seed) a Tibabuyes,
> localidad Suba.

PROPIEDAD
  # — Identificación —
  nombre:          Casa Tibabuyes
  tipo:            EDIFICIO
  estado:          ACTIVA
  modo_arriendo:   MIXTO            # locales + apartamentos + habitaciones (piso 4)
  descripcion:     Casa de 5 pisos con locales y unidades residenciales.
  gestor:          admin dueño (ver seed-casa-tibabuyes-owners)

  # — Dirección —
  direccion:       Calle 137B #105B-10   # (est) confirmar
  barrio:          Tibabuyes
  localidad:       Suba
  ciudad:          Bogotá
  departamento:    Bogotá
  pais:            Colombia
  codigo_postal:   ???                   # fallback 00000
  estrato:         ???                   # [CONSULTAR] (Tibabuyes suele ser 2)
  gps:             4.74097,-74.09929     # (est) confirmar

  # — Estructura —
  pisos:           5
  area_construida: 420 m2
  area_lote:       160 m2
  edad:            8 años            # (est)
  año_construccion: ???
  material:        ???
  conjunto:        —
  edificio:        —

  # — Valores —
  valor_comercial: ???            # [CONSULTAR]
  valor_catastral: ???            # [CONSULTAR] — base del predial

  # — Exterior y zonas comunes —
  parqueaderos:    0
  ubicacion_parqueo: ???
  patio_jardin:    ???
  balcones_terrazas: ???
  areas_recreativas: ???
  zonas_comunes:   escaleras, cocina compartida piso 4, baño compartido piso 4, lavado compartido piso 4

UNIDADES
  - codigo:      C1-LOCAL-A
    piso:        1
    area:        40 m2 (est)
    habitaciones: 0
    baños:       1
    tiene:       cocina, baño
    estado:      LIBRE
    renta:       1.800.000 (est)
    deposito:    1.800.000 (est)
    descripcion: Local comercial con cocina y baño privado.

  - codigo:      C1-LOCAL-B
    piso:        1
    area:        30 m2 (est)
    habitaciones: 0
    baños:       0
    tiene:       (open space, sin cocina ni baño)
    estado:      LIBRE
    renta:       1.200.000 (est)
    deposito:    1.200.000 (est)
    descripcion: Local comercial tipo open space.

  - codigo:      C2-201
    piso:        2
    area:        45 m2 (est)
    habitaciones: 1
    baños:       1
    tiene:       cocina, baño
    mascotas:    sí
    estado:      LIBRE
    renta:       1.300.000 (est)
    deposito:    1.300.000 (est)
    descripcion: Unidad con cocina y baño privado.

  - codigo:      C2-202
    piso:        2
    area:        48 m2 (est)
    habitaciones: 1
    baños:       1
    tiene:       cocina, baño
    mascotas:    sí
    estado:      LIBRE
    renta:       1.350.000 (est)
    deposito:    1.350.000 (est)
    descripcion: Unidad con cocina y baño privado.

  - codigo:      C3-301
    piso:        3
    area:        120 m2 (est)
    habitaciones: 3
    baños:       2
    tiene:       cocina, baño, sala-comedor, lavado, balcón
    mascotas:    sí
    estado:      LIBRE
    renta:       3.500.000 (est)
    deposito:    3.500.000 (est)
    descripcion: Apartamento completo con 3 habitaciones, sala-comedor, cocina, baño y área de lavado.

  - codigo:      C4-401
    piso:        4
    area:        18 m2 (est)
    habitaciones: 1
    baños:       0
    tiene:       (habitación)
    comparte:    cocina, baño, lavado
    estado:      LIBRE
    renta:       650.000 (est)
    deposito:    650.000 (est)
    descripcion: Habitación en piso compartido.

  - codigo:      C4-402
    piso:        4
    area:        20 m2 (est)
    habitaciones: 1
    baños:       0
    tiene:       (habitación)
    comparte:    cocina, baño, lavado
    estado:      LIBRE
    renta:       680.000 (est)
    deposito:    680.000 (est)
    descripcion: Habitación en piso compartido.

  - codigo:      C4-403
    piso:        4
    area:        19 m2 (est)
    habitaciones: 1
    baños:       0
    tiene:       (habitación)
    comparte:    cocina, baño, lavado
    estado:      LIBRE
    renta:       670.000 (est)
    deposito:    670.000 (est)
    descripcion: Habitación en piso compartido.

  - codigo:      C4-404
    piso:        4
    area:        21 m2 (est)
    habitaciones: 1
    baños:       0
    tiene:       (habitación)
    comparte:    cocina, baño, lavado
    estado:      LIBRE
    renta:       690.000 (est)
    deposito:    690.000 (est)
    descripcion: Habitación en piso compartido.

  - codigo:      C5-501
    piso:        5
    area:        85 m2 (est)
    habitaciones: 2
    baños:       1
    tiene:       cocina, baño, sala-comedor, balcón
    estado:      LIBRE
    renta:       2.400.000 (est)
    deposito:    2.400.000 (est)
    descripcion: Unidad con 2 habitaciones, sala-comedor, cocina y baño.

  - codigo:      C5-502
    piso:        5
    area:        55 m2 (est)
    habitaciones: 1
    baños:       1
    tiene:       cocina, baño
    estado:      LIBRE
    renta:       1.700.000 (est)
    deposito:    1.700.000 (est)
    descripcion: Unidad con 1 habitación, cocina y baño.

---

PENDIENTES DE CONSULTAR
  - Rentas y depósitos reales de las 11 unidades (hoy todos (est)).
  - Estrato socioeconómico.
  - Valor comercial y valor catastral (para predial).
  - Confirmar dirección exacta, gps y edad/año de construcción.
