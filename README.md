# Cultiva

Cultiva es una aplicación personal para registrar y seguir cultivos, plantas, tareas, bitácoras, nutrición y fotografías, con asistencia de IA.

## Características

- Almacenamiento local en el navegador; no requiere cuenta ni sincronización en la nube.
- Exportación e importación de copias de seguridad JSON y exportaciones CSV.
- Aplicación web progresiva (PWA).
- Asistente Cultiva IA con Gemini a través del servidor Express.
- Interfaz adaptable con tema claro y oscuro.

## Requisitos

- Node.js compatible con las dependencias del proyecto.
- Una clave de Google Gemini en caso de querer respuestas reales de IA.

## Ejecución local

1. Instalar dependencias:

   `npm ci`

2. Crear un archivo `.env` a partir de `.env.example` y configurar `GEMINI_API_KEY`.

3. Iniciar la aplicación:

   `npm run dev`

## Validación

- `npm run lint` ejecuta la comprobación de TypeScript.
- `npm run build` construye el frontend y el servidor de producción.

## Datos y privacidad

Los registros de Cultiva se guardan en el almacenamiento local del navegador/dispositivo. Limpiar los datos del navegador o cambiar de navegador/dispositivo puede hacer que no estén disponibles; exportá periódicamente una copia desde Ajustes. Las funciones de IA envían al backend únicamente el contexto necesario para la consulta que se realiza.
