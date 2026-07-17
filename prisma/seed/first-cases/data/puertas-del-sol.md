# Casa Puertas del Sol

> Datos parciales (del archivo `casas`). Falta decidir **modo_arriendo** y valores reales.

PROPIEDAD
  # — Identificación —
  nombre:          Casa Puertas del Sol
  tipo:            CASA
  estado:          ACTIVA
  modo_arriendo:   ???            # [CONSULTAR] ¿COMPLETA o POR_HABITACION?
  descripcion:     Casa de 2 pisos, 2.90 m de frente × 12 m de fondo.
  gestor:          ???

  # — Dirección —
  direccion:       ???
  barrio:          ???
  localidad:       ???
  ciudad:          Bogotá
  departamento:    Bogotá
  pais:            Colombia
  codigo_postal:   ???            # fallback 00000
  estrato:         ???            # [CONSULTAR]
  gps:             ???

  # — Estructura —
  pisos:           2
  area_construida: ??? m2         # frente 2.90 × fondo 12 ≈ 34.8 m2/piso → ~70 m2 (est)
  area_lote:       ??? m2         # ≈ 34.8 m2 (est)
  edad:            ??? años
  año_construccion: ???
  material:        ???

  # — Valores —
  valor_comercial: ???            # [CONSULTAR]
  valor_catastral: ???            # [CONSULTAR]

  # — Exterior y zonas comunes —
  parqueaderos:    0
  patio_jardin:    patio con lavadero (piso 1)
  zonas_comunes:   patio, lavadero

# Espacios conocidos (aún sin definir cómo se arriendan):
#   Piso 1: sala-comedor, cocina, baño, patio con lavadero.
#   Piso 2: dos habitaciones.

UNIDADES
  # Opción A (COMPLETA) — toda la casa a un inquilino:
  - codigo:      PDS-CASA
    piso:        1
    area:        ??? m2 (est ~70)
    habitaciones: 2
    baños:       1
    tiene:       cocina, baño, sala-comedor, lavado
    estado:      LIBRE
    renta:       ???            # [CONSULTAR]
    deposito:    ???
    descripcion: Casa completa de 2 pisos.

  # Opción B (POR_HABITACION) — borrar la de arriba y usar estas si se arrienda por cuarto:
  # - codigo: PDS-HAB-1  (piso 2; comparte: cocina, baño, lavado)
  # - codigo: PDS-HAB-2  (piso 2; comparte: cocina, baño, lavado)

---

PENDIENTES DE CONSULTAR
  - Modo de arriendo: ¿casa completa o por habitación? (define nº de unidades).
  - Dirección, barrio, localidad, estrato.
  - Rentas / valores comerciales y catastrales.
  - Áreas reales por espacio.
