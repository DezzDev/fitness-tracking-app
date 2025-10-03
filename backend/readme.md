📦 Explicación de los paquetes
1. dotenv

👉 Sirve para manejar variables de entorno en tu proyecto.
Esto es fundamental para no exponer claves sensibles (ej: credenciales de BD, tokens, claves API).

// index.js
require('dotenv').config(); // carga el archivo .env

console.log(process.env.DB_USER); // imprime usuario de la BD definido en .env


Ejemplo de .env

DB_USER=admin
DB_PASSWORD=supersecret
PORT=4000


✅ Buenas prácticas

Nunca subas el archivo .env a GitHub (usa .gitignore).

Define valores por defecto en tu código por si falta una variable.

2. cors

👉 Controla el Cross-Origin Resource Sharing, es decir, qué dominios pueden acceder a tu API.
Por defecto, un navegador bloquea peticiones AJAX a otro dominio distinto (por seguridad). Con CORS lo habilitas selectivamente.

const express = require('express');
const cors = require('cors');
const app = express();

// Permitir solo a un dominio
app.use(cors({ origin: 'https://mi-frontend.com' }));

// Permitir a todos (no recomendado en producción)
app.use(cors());


✅ Buenas prácticas

Permite solo dominios específicos en producción.
❌ Error común: dejar app.use(cors()) abierto en producción → cualquier dominio puede consumir tu API.

3. helmet

👉 Añade cabeceras HTTP de seguridad automáticamente.
Protege contra ataques comunes como XSS, clickjacking, sniffing de contenido.

const helmet = require('helmet');
app.use(helmet());


✅ Buenas prácticas

Siempre actívalo en producción.

Se puede configurar cada cabecera si tu app necesita ajustes (ejemplo: permitir iframes en un dominio específico).

4. express-rate-limit

👉 Limita el número de solicitudes que un cliente puede hacer en un tiempo determinado → protege contra ataques de fuerza bruta y DoS.

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // máximo 100 peticiones por IP
  message: 'Demasiadas solicitudes, inténtalo más tarde'
});

app.use(limiter);


✅ Buenas prácticas

Úsalo en rutas sensibles (ej: login, registro).

Ajusta max y windowMs según tu caso.

5. compression

👉 Comprime las respuestas HTTP con Gzip o Brotli, reduciendo el tamaño de los datos enviados y acelerando la carga.

const compression = require('compression');
app.use(compression());


✅ Buenas prácticas

Muy útil en APIs con mucho JSON.

Evita comprimir respuestas pequeñas (consume CPU innecesaria).

6. morgan

👉 Middleware para logs de peticiones HTTP (quién entra a tu API, método, estado, tiempo de respuesta).

const morgan = require('morgan');
app.use(morgan('dev')); // formato corto y colorido para desarrollo


Ejemplo de salida:

GET /api/users 200 12.345 ms - 512


✅ Buenas prácticas

Usa dev en desarrollo y combined en producción (más detallado).

Redirige logs a un archivo en producción en lugar de consola.