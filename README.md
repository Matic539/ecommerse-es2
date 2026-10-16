# Matex · Prototipo de tienda online con asesor IA

Prototipo funcional de la ES2 (E-Commerce, INACAP): storefront, ficha de producto optimizada para conversión, calculador de proyecto, carrito, checkout simulado en 1 clic, panel de KPIs de adopción y el asesor virtual **Max** conectado a un modelo de lenguaje vía API (OpenRouter).

## Estructura

```
index.html              Tienda (inicio, categorías, ficha de producto, KPIs)
assets/styles.css       Estilos
assets/app.js           Lógica del front (catálogo, calculador, carrito, quiz, chat, KPIs)
api/chat.js             Función serverless que llama a OpenRouter (aquí vive la key)
api/_system-prompt.js   System Prompt del asistente Max
dev-server.js           Servidor local para pruebas (node dev-server.js)
.env.example            Variables de entorno de ejemplo
```

## Por qué Vercel y no GitHub Pages

GitHub Pages solo sirve archivos estáticos. Si el chat llamara a OpenRouter desde el navegador, la API key quedaría expuesta en el código y cualquiera podría usarla. En Vercel, la carpeta `api/` se ejecuta en el servidor y la key se guarda como variable de entorno: el navegador nunca la ve.

## Publicar en Vercel (unos 5 minutos)

1. **Sube la carpeta a GitHub** (desde PowerShell, dentro de esta carpeta):
   ```powershell
   git init
   git add .
   git commit -m "Prototipo tienda Matex ES2"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/matex-ecommerce.git
   git push -u origin main
   ```
   Antes crea el repositorio vacío `matex-ecommerce` en github.com. El `.gitignore` evita que se suba el archivo `.env`.
2. Entra a **vercel.com**, inicia sesión con tu cuenta de GitHub y elige **Add New... > Project**.
3. Importa el repositorio `matex-ecommerce`. En *Framework Preset* deja **Other**. No hay comando de build.
4. En **Environment Variables** agrega:
   - `OPENROUTER_API_KEY` = tu key de OpenRouter
   - `OPENROUTER_MODEL` = `nex-agi/nex-n2.5-mini:free`
   - (opcional) `OPENROUTER_FALLBACK_MODELS` = modelos gratuitos de respaldo separados por coma
5. Presiona **Deploy**. Vercel entrega una URL del tipo `https://matex-ecommerce.vercel.app`. Esa es la URL para el profesor.
6. Prueba el chat. Si responde "no disponible", revisa en Vercel > Project > Logs el error de OpenRouter (key inválida, modelo inexistente o límite del plan gratuito) y cambia `OPENROUTER_MODEL` por otro modelo `:free` vigente en openrouter.ai/models. Después de cambiar variables, usa **Redeploy**.

## Probar en tu computador

```powershell
copy .env.example .env      # y pega tu key en .env
node dev-server.js
```
Abre http://localhost:3000. Requiere Node 18 o superior.

## Rutas útiles para la demo

- `/#/` Inicio con quiz "¿Qué quieres renovar?", Programa Maestro y reseñas.
- `/#/p/metal-siding` Ficha de producto principal (calculador, accesorios, sellos, compra en 1 clic).
- `/#/p/marmolisima` Muestra un color sin stock con "Avísame cuando llegue".
- `/#/kpis` Panel de adopción con conversión, abandono, tiempo de cierre y NPS de confianza (datos de este navegador).

## Notas

- Precios y stock son referenciales (inventario de septiembre 2026). Las reseñas son ilustrativas y las compras simuladas.
- Las imágenes de producto son texturas CSS; se pueden reemplazar por fotos reales o imágenes generadas con Leonardo.ai o Ideogram.
- La función `api/chat.js` limita el historial a 12 mensajes, recorta mensajes largos y aplica un límite simple de 15 consultas por minuto por IP para proteger la key.
