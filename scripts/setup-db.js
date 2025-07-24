/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const schemaPath = path.join(__dirname, "../prisma/schema.prisma");

console.log(`🔧 Configurando base de datos para: ${isProd ? "PRODUCCIÓN" : "DESARROLLO"}`);

try {
  // Leer el schema actual
  const schemaContent = fs.readFileSync(schemaPath, "utf8");

  // Configurar provider y url según el entorno
  let updatedSchema = schemaContent;

  if (isProd) {
    // Configuración para PostgreSQL en producción
    updatedSchema = updatedSchema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    console.log("✅ Configurado para PostgreSQL (Producción)");
  } else {
    // Configuración para SQLite en desarrollo
    updatedSchema = updatedSchema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    console.log("✅ Configurado para SQLite (Desarrollo)");
  }

  // Escribir el schema actualizado
  fs.writeFileSync(schemaPath, updatedSchema);

  console.log("📄 Schema actualizado correctamente");
} catch (error) {
  console.error("❌ Error configurando base de datos:", error.message);
  process.exit(1);
}
