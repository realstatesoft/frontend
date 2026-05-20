import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";

// Función para cargar variables del archivo .env
function loadEnv() {
  const env = {};
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEquals = trimmed.indexOf("=");
          if (firstEquals !== -1) {
            const key = trimmed.substring(0, firstEquals).trim();
            const value = trimmed.substring(firstEquals + 1).trim().replace(/^['"]|['"]$/g, "");
            
            // Si la variable empieza con CYPRESS_, la guardamos sin el prefijo para Cypress.env()
            if (key.startsWith("CYPRESS_")) {
              const cleanKey = key.replace("CYPRESS_", "");
              env[cleanKey] = value;
            }
            env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.error("Error al cargar .env en Cypress config:", error);
  }
  return env;
}

export default defineConfig({
  e2e: {
    specPattern: "E2E/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "E2E/support/e2e.js",
    fixturesFolder: "E2E/fixtures",
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // Cargar variables de entorno del archivo .env
      const envVars = loadEnv();
      config.env = {
        ...config.env,
        ...envVars,
      };
      return config;
    },
  },
});

