#!/bin/bash

# Función reutilizable para extraer modelos o enums
extract_by_type() {
   local type="$1"        # "model" o "enum"
   local file="$2"        # archivo a procesar
   local array_name="$3"  # nombre del array donde almacenar resultados
   
   local icon="📊"
   local type_plural="MODELOS"
   
   if [ "$type" = "enum" ]; then
       icon="📋"
       type_plural="ENUMS"
   fi
   
   echo -e "$icon $type_plural encontrados:\n"
   
   # Limpiar y crear array temporal
   TEMP_EXTRACT_RESULT=()
   
   while IFS= read -r line; do
       if [[ "$line" =~ ^${type}[[:space:]]+([A-Za-z_][A-Za-z0-9_]*) ]]; then
           local item_name="${BASH_REMATCH[1]}"
           TEMP_EXTRACT_RESULT+=("$item_name")
           echo "  - $item_name"
       fi
   done < "$file"
   
   if [ ${#TEMP_EXTRACT_RESULT[@]} -eq 0 ]; then
       echo "  (No se encontraron $type_plural)"
   fi
   
   echo ""
   
   # Asignar resultado según el tipo
   if [ "$array_name" = "models" ]; then
       EXTRACT_MODELS=("${TEMP_EXTRACT_RESULT[@]}")
   elif [ "$array_name" = "enums" ]; then
       EXTRACT_ENUMS=("${TEMP_EXTRACT_RESULT[@]}")
   fi
}

# Función para extraer todos los modelos y enums del archivo de texto
extract_all_models_and_enums() {
   echo -e "Extrayendo todos los modelos y enums de $MAIN_FILE...\n"
   
   # Usar la función reutilizable para extraer modelos
   extract_by_type "model" "$MAIN_FILE" "models"
   
   # Usar la función reutilizable para extraer enums
   extract_by_type "enum" "$MAIN_FILE" "enums"
   
   echo -e "Resumen: ${#EXTRACT_MODELS[@]} modelos y ${#EXTRACT_ENUMS[@]} enums encontrados\n"
   
   # Asignar a variables globales para que sean accesibles
   FOUND_MODELS=("${EXTRACT_MODELS[@]}")
   FOUND_ENUMS=("${EXTRACT_ENUMS[@]}")
}

# Función para extraer el contenido completo de un modelo o enum
extract_full_definition() {
   local type="$1"    # "model" o "enum"
   local name="$2"    # nombre del modelo/enum
   local file="$3"    # archivo donde buscar
   
   # Extraer la definición completa desde "type name {" hasta "}"
   awk "/^$type $name /,/^}$/" "$file"
}

# Función para reemplazar en la posición exacta donde se encontró
replace_at_exact_position() {
   local type="$1"           # "model" o "enum"
   local name="$2"           # nombre del modelo/enum
   local target_file="$3"    # archivo donde reemplazar
   local new_definition="$4" # nueva definición
   
   echo -e "  🔄 Reemplazando $type '$name' en posición exacta..."
   
   # Obtener el número de línea donde inicia la definición
   local start_line=$(grep -n "^$type $name " "$target_file" | cut -d: -f1)
   
   if [ -z "$start_line" ]; then
       echo -e "  ❌ Error: No se pudo encontrar la línea de inicio"
       return 1
   fi
   
   # Encontrar la línea donde termina la definición (siguiente "}" al mismo nivel)
   local end_line=$(awk "NR>=$start_line && /^}$/ {print NR; exit}" "$target_file")
   
   if [ -z "$end_line" ]; then
       echo -e "  ❌ Error: No se pudo encontrar la línea de cierre"
       return 1
   fi
   
   echo -e "     Reemplazando líneas $start_line-$end_line"
   
   # Crear archivo temporal con el reemplazo exacto
   {
       # Contenido antes de la definición
       head -n $((start_line - 1)) "$target_file"
       
       # Nueva definición
       echo "$new_definition"
       
       # Contenido después de la definición
       tail -n +$((end_line + 1)) "$target_file"
       
   } > "${target_file}.tmp"
   
   # Reemplazar el archivo original
   mv "${target_file}.tmp" "$target_file"
   
   echo -e "  ✅ Reemplazo completado en posición exacta"
   
   return 0
}

# Función generalizada para buscar y reemplazar modelos o enums en archivos prisma
search_and_replace_in_prisma() {
   local type="$1"        # "model" o "enum"
   local name="$2"        # nombre del modelo/enum
   
   echo -e "🔍 Buscando $type '$name'...\n"
   
   # Encontrar archivos prisma
   local other_files
   other_files=($(find . -maxdepth 1 -name "*.prisma" -o -name "*.schema" -o -name "*.txt" | grep -v "$MAIN_FILE"))
   
   if [ ${#other_files[@]} -eq 0 ]; then
       echo -e "  ❌ No hay archivos prisma para buscar\n"
       return 1
   fi
   
   local found=false
   local target_file=""
   
   for file in "${other_files[@]}"; do
       if grep -q "^$type $name " "$file"; then
           echo -e "  ✅ ENCONTRADO en $file"
           local line_number=$(grep -n "^$type $name " "$file" | cut -d: -f1)
           echo -e "     Línea: $line_number"
           
           found=true
           target_file="$file"
           break
       fi
   done
   
   if [ "$found" = false ]; then
       echo -e "  ❌ NO encontrado en archivos prisma\n"
       return 0
   fi
   
   # Extraer la definición nueva del archivo principal
   local new_definition
   new_definition=$(extract_full_definition "$type" "$name" "$MAIN_FILE")
   
   if [ -z "$new_definition" ]; then
       echo -e "  ❌ Error: No se pudo extraer la definición de $MAIN_FILE\n"
       return 1
   fi
   
   # Extraer la definición existente del archivo destino
   local existing_definition
   existing_definition=$(extract_full_definition "$type" "$name" "$target_file")
   
   # Comparar si son diferentes
   if [ "$new_definition" = "$existing_definition" ]; then
       echo -e "  ℹ️  Las definiciones son idénticas, removiendo del archivo principal\n"
       
       # Remover del archivo principal ya que es idéntico
       local temp_file="${MAIN_FILE}.tmp"
       awk "/^$type $name /,/^}$/ {next} {print}" "$MAIN_FILE" > "$temp_file"
       mv "$temp_file" "$MAIN_FILE"
       
       echo -e "  🗑️  $type '$name' removido del archivo principal\n"
       return 0
   fi
   
   # Realizar el reemplazo en la posición exacta
   if replace_at_exact_position "$type" "$name" "$target_file" "$new_definition"; then
       # Agregar a la lista de elementos movidos
       if [ "$type" = "model" ]; then
           MOVED_MODELS+=("$name:$target_file")
       else
           MOVED_ENUMS+=("$name:$target_file")
       fi
   fi
   
   echo ""
   return 0
}

# Función para remover elementos del archivo principal que fueron movidos
remove_moved_from_main() {
   echo -e "🗑️  Removiendo elementos movidos del archivo principal...\n"
   
   local temp_file="${MAIN_FILE}.tmp"
   cp "$MAIN_FILE" "$temp_file"
   
   # Remover modelos movidos
   for item in "${MOVED_MODELS[@]}"; do
       local model_name="${item%:*}"
       echo -e "  🗑️  Removiendo modelo '$model_name'"
       awk "/^model $model_name /,/^}$/ {next} {print}" "$temp_file" > "${temp_file}.new"
       mv "${temp_file}.new" "$temp_file"
   done
   
   # Remover enums movidos
   for item in "${MOVED_ENUMS[@]}"; do
       local enum_name="${item%:*}"
       echo -e "  🗑️  Removiendo enum '$enum_name'"
       awk "/^enum $enum_name /,/^}$/ {next} {print}" "$temp_file" > "${temp_file}.new"
       mv "${temp_file}.new" "$temp_file"
   done
   
   # Reemplazar el archivo principal
   mv "$temp_file" "$MAIN_FILE"
   
   echo -e "  ✅ Elementos removidos del archivo principal\n"
}

# Función para concatenar archivos
concatenate_files() {
   echo -e "📁 Concatenando archivos en $MAIN_FILE...\n"
   
   rm -f "$MAIN_FILE"
   
   find . -type f ! -name "$MAIN_FILE" ! -name "$SCRIPT_FILE" \
       -exec bash -c ' \
           cat "$0" >> el_nuevo.txt && \
           echo -e "\n\n" >> el_nuevo.txt' \
       {} \;
   
   echo -e "  ✅ Archivos concatenados exitosamente\n"
}

# Funciones wrapper para mantener compatibilidad
search_model_in_prisma() {
   search_and_replace_in_prisma "model" "$1"
}

search_enum_in_prisma() {
   search_and_replace_in_prisma "enum" "$1"
}

# Función principal que busca y reemplaza todos los modelos y enums
search_all_in_prisma() {
   echo -e "=== BÚSQUEDA Y REEMPLAZO COMPLETO ===\n"
   
   # Verificar que existe el archivo
   if [ ! -f "$MAIN_FILE" ]; then
       echo "Error: No se encontro el archivo $MAIN_FILE"
       return 1
   fi
   
   # Limpiar arrays de elementos movidos
   MOVED_MODELS=()
   MOVED_ENUMS=()
   
   # Extraer todos los modelos y enums
   extract_all_models_and_enums
   
   echo -e "=== BUSCANDO Y REEMPLAZANDO MODELOS ===\n"
   
   # Buscar y reemplazar cada modelo
   for model in "${FOUND_MODELS[@]}"; do
       search_and_replace_in_prisma "model" "$model"
   done
   
   echo -e "=== BUSCANDO Y REEMPLAZANDO ENUMS ===\n"
   
   # Buscar y reemplazar cada enum
   for enum in "${FOUND_ENUMS[@]}"; do
       search_and_replace_in_prisma "enum" "$enum"
   done
   
   # Remover elementos movidos del archivo principal
   if [ ${#MOVED_MODELS[@]} -gt 0 ] || [ ${#MOVED_ENUMS[@]} -gt 0 ]; then
       remove_moved_from_main
   fi
   
   # Mostrar resumen
   echo -e "=== RESUMEN FINAL ===\n"
   
   if [ ${#MOVED_MODELS[@]} -gt 0 ]; then
       echo -e "📊 MODELOS reemplazados:\n"
       for item in "${MOVED_MODELS[@]}"; do
           echo "  ✅ ${item%:*} → ${item#*:}"
       done
       echo ""
   fi
   
   if [ ${#MOVED_ENUMS[@]} -gt 0 ]; then
       echo -e "📋 ENUMS reemplazados:\n"
       for item in "${MOVED_ENUMS[@]}"; do
           echo "  ✅ ${item%:*} → ${item#*:}"
       done
       echo ""
   fi
   
   # Mostrar elementos que no se encontraron
   local not_found_models=()
   local not_found_enums=()
   
   for model in "${FOUND_MODELS[@]}"; do
       local found_in_moved=false
       for moved in "${MOVED_MODELS[@]}"; do
           if [[ "${moved%:*}" == "$model" ]]; then
               found_in_moved=true
               break
           fi
       done
       if [ "$found_in_moved" = false ]; then
           not_found_models+=("$model")
       fi
   done
   
   for enum in "${FOUND_ENUMS[@]}"; do
       local found_in_moved=false
       for moved in "${MOVED_ENUMS[@]}"; do
           if [[ "${moved%:*}" == "$enum" ]]; then
               found_in_moved=true
               break
           fi
       done
       if [ "$found_in_moved" = false ]; then
           not_found_enums+=("$enum")
       fi
   done
   
   if [ ${#not_found_models[@]} -gt 0 ]; then
       echo -e "❌ MODELOS no encontrados:\n"
       for model in "${not_found_models[@]}"; do
           echo "  - $model"
       done
       echo ""
   fi
   
   if [ ${#not_found_enums[@]} -gt 0 ]; then
       echo -e "❌ ENUMS no encontrados:\n"
       for enum in "${not_found_enums[@]}"; do
           echo "  - $enum"
       done
       echo ""
   fi
   
   if [ ${#MOVED_MODELS[@]} -eq 0 ] && [ ${#MOVED_ENUMS[@]} -eq 0 ] && [ ${#not_found_models[@]} -eq 0 ] && [ ${#not_found_enums[@]} -eq 0 ]; then
       echo -e "ℹ️  No se encontraron elementos para procesar\n"
   fi
   
   echo -e "=== PROCESO COMPLETADO ===\n"
}

# Función para mostrar menú de opciones
show_menu() {
   echo "=== MENÚ DE OPCIONES ==="
   echo "1. Concatenar archivos"
   echo "2. Buscar y reemplazar todos los modelos/enums"
   echo "3. Solo extraer modelos y enums"
   echo "4. Salir"
   echo ""
   read -p "Selecciona una opción (1-4): " choice
   
   case $choice in
       1)
           concatenate_files
           ;;
       2)
           search_all_in_prisma
           ;;
       3)
           extract_all_models_and_enums
           ;;
       4)
           echo "Saliendo..."
           exit 0
           ;;
       *)
           echo "Opción inválida. Intenta de nuevo."
           show_menu
           ;;
   esac
}

# Variables globales para almacenar los resultados
FOUND_MODELS=()
FOUND_ENUMS=()
EXTRACT_MODELS=()
EXTRACT_ENUMS=()
TEMP_EXTRACT_RESULT=()
MOVED_MODELS=()
MOVED_ENUMS=()
MAIN_FILE="el_nuevo.txt"
SCRIPT_FILE="control.sh"

# Ejecutar menú si el script se ejecuta directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
   show_menu
fi