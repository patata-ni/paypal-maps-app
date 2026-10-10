# PayPal + mapas (Ionic / Angular)

Aplicación Ionic con Angular y Capacitor con dos funciones en una pantalla:

- **Mi ubicación:** obtiene la posición actual con `@capacitor/geolocation` y la
  muestra en un mapa de [Leaflet](https://leafletjs.com/) con teselas de
  OpenStreetMap. No necesita ninguna clave.
- **Pagar con PayPal:** carga el botón oficial con `@paypal/paypal-js` y crea
  una orden de 10.00 USD.

## Pagos de prueba

[environment.ts](./src/environments/environment.ts) usa `sb`, el `client-id`
genérico de PayPal para el entorno de pruebas (sandbox). No hay dinero real.
Para usar tu propia app de PayPal, cambia `paypalClientId` por tu `client-id`.
Nunca pongas el *secret* de PayPal en una app de cliente.

## Ejecutar

Requisitos: Node.js 22.22.3 o superior (o 24.15+), que es lo que exige Angular 22.

```bash
npm install
npm start
```

Abre http://localhost:4200. El navegador pedirá permiso de ubicación.
Para compilar: `npm run build`.

## Tecnologías

Angular 22, Ionic 9, Capacitor 8, Leaflet, PayPal JS SDK.
