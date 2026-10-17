# Cultiva

Cultiva es una aplicación personal para registrar y seguir cultivos, plantas, tareas, bitácoras, nutrición y fotografías, sin cuentas ni servicios de inteligencia artificial externos.

## Características

- Almacenamiento local en el navegador; no requiere cuenta ni sincronización en la nube.
- Exportación e importación de copias de seguridad JSON y exportaciones CSV.
- Aplicación web progresiva (PWA).
- Seguimiento de cultivos, plantas, tareas, diario, nutrición y galería fotográfica.
- Interfaz adaptable con tema claro y oscuro.
- Comparación local de ciclos de cultivo a partir de los registros guardados.

## Requisitos

- Node.js compatible con las dependencias del proyecto.

## Ejecución local

1. Instalar dependencias:

   `npm ci`

2. Iniciar la aplicación:

   `npm run dev`

## Validación

- `npm run lint` ejecuta la comprobación de TypeScript.
- `npm run build` construye el frontend y el servidor de producción.

## Datos y privacidad

Los registros de Cultiva se guardan en el almacenamiento local del navegador/dispositivo. Limpiar los datos del navegador o cambiar de navegador/dispositivo puede hacer que no estén disponibles; exportá periódicamente una copia desde Ajustes. La aplicación no envía registros de cultivo a un proveedor de IA.
