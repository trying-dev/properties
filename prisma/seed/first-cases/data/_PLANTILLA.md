# Plantilla de propiedad → seed

Copia este archivo como `data/<nombre-casa>.md` y llénalo. De aquí genero el
`seed-casa-<nombre>.ts`. Es la **fuente de verdad**: se edita el .md, no el .ts.

## Convenciones
- `*`          = **requerido** por el modelo (debe tener valor; si no, se usa un fallback).
- `(est)`      = valor estimado por mí; corrígelo cuando tengas el real.
- `???`        = dato que falta por saber (no bloquea; se completa después).
- `[CONSULTAR]`= dato que **requiere hablar con el dueño/gestor** para obtenerlo o decidirlo
                 (rentas, valores comerciales, modo de arriendo…). Se listan todos al final.
- Las **imágenes** y el **QR** se autogeneran; no los escribas.
- Lo que dejes en blanco toma el default indicado.

## Leyenda (palabra → enum/campo del modelo)
- **tipo:** CASA=HOUSE · EDIFICIO=BUILDING · APARTAMENTO=APARTMENT · LOCAL=COMMERCIAL_SPACE · OFICINA=OFFICE · LOTE=LAND
- **estado propiedad:** ACTIVA=ACTIVE · INACTIVA=INACTIVE · MANTENIMIENTO=MAINTENANCE · VENDIDA=SOLD
- **estado unidad:** LIBRE=VACANT · OCUPADA=OCCUPIED · RESERVADA=RESERVED · MANTENIMIENTO=MAINTENANCE · NO_DISPONIBLE=UNAVAILABLE
- **modo_arriendo:** COMPLETA (toda la casa = 1 unidad) · POR_UNIDAD (apartamentos/locales) · POR_HABITACION (inquilinato, comparten cocina/baño) · MIXTO
- **tiene:** privados → cocina=kitchen · baño=bathroom · sala-comedor=livingDiningRoom · sala=livingRoom · comedor=diningRoom · lavado=laundry · balcón=balcony · parqueo=parking · depósito=storage
- **comparte:** compartidos → cocina=sharedKitchen · baño=sharedBathroom · lavado=sharedLaundry · sala-comedor=sharedLivingDiningRoom
- **servicios_incluidos:** internet · tv=cableTV · agua=waterIncluded · gas=gasIncluded

## Reglas de modelado
1. 1 Unidad = 1 espacio que se arrienda con contrato independiente.
2. Habitación de piso compartido = Unidad. Espacios privados en `tiene:`, compartidos en
   `comparte:` (mapean a los flags `shared*`).
3. Zonas comunes del inmueble (escaleras, patio, terraza) → `zonas_comunes:` a nivel
   PROPIEDAD (campo `commonZones`). Solo son Unidad si esa zona se **arrienda** aparte.
4. Espacios de zona común con medidor/dispositivo/documento propios → `unitId = null`
   (no requieren Unidad; se definen en las fases de módulos).

---

PROPIEDAD
  # — Identificación —
  nombre:*         ???
  tipo:*           ???            # CASA | EDIFICIO | APARTAMENTO | LOCAL | OFICINA | LOTE
  estado:          ACTIVA
  modo_arriendo:   ???            # COMPLETA | POR_UNIDAD | POR_HABITACION | MIXTO
  descripcion:     ???
  gestor:          ???            # admin/dueño que la gestiona

  # — Dirección —
  direccion:*      ???            # calle y número
  barrio:*         ???
  localidad:       ???            # (district) distinta de barrio, ej. Suba
  ciudad:*         Bogotá
  departamento:*   Bogotá
  pais:            Colombia
  codigo_postal:*  ???            # requerido; fallback 00000
  estrato:         ???            # 1–6
  gps:             ???            # lat,lon

  # — Estructura —
  pisos:           1
  area_construida:* ??? m2
  area_lote:       ??? m2
  edad:*           ??? años
  año_construccion: ???
  material:        ???            # material estructural (concreto, ladrillo…)
  conjunto:        ???            # solo si es conjunto multi-torre
  edificio:        ???            # solo si aplica

  # — Valores (típicamente [CONSULTAR]) —
  valor_comercial: ???            # [CONSULTAR]
  valor_catastral: ???            # [CONSULTAR] — base del predial

  # — Exterior y zonas comunes —
  parqueaderos:    0              # nº de parqueaderos de la propiedad
  ubicacion_parqueo: ???
  patio_jardin:    ???
  balcones_terrazas: ???
  areas_recreativas: ???
  zonas_comunes:   ???            # escaleras, patio, terraza, portería, piscina…

UNIDADES                          # una por espacio ARRENDABLE
  - codigo:*     ???              # ej. C1-LOCAL-A, APTO-201, HAB-1
    codigo_interno: ???           # opcional
    piso:        ???
    area:        ??? m2
    area_privada: ??? m2          # opcional
    area_comun:  ??? m2           # opcional (parte proporcional de comunes)
    habitaciones: 0
    baños:       0
    tiene:       ???              # privados: cocina, baño, sala-comedor, lavado, balcón, parqueo, depósito
    comparte:    ???              # compartidos: cocina, baño, lavado, sala-comedor (o vacío)
    servicios_incluidos: ???      # internet, tv, agua, gas (o vacío)
    amoblado:    no
    mascotas:    no
    fumar:       no
    estado:      LIBRE
    renta:       ???              # [CONSULTAR]
    deposito:    ???              # si no, se asume = 1 mes de renta
    destacados:  ???              # opcional (bullets para ficha)
    descripcion: ???

---

PENDIENTES DE CONSULTAR            # se llena solo con lo marcado [CONSULTAR]
  - (rentas / valores / modo de arriendo que falten por confirmar con el dueño)
