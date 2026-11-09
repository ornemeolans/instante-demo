# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Fotógrafos de eventos** (cualquier tipo: deportivos, sociales, escolares/institucionales). Crean un evento, suben cientos de fotos desde la computadora después del evento, publican la galería y comparten el enlace. Revisan ventas por evento.
- **Compradores**: asistentes al evento o sus familias. Llegan desde un enlace compartido (WhatsApp, redes), casi siempre en el celular, buscan *sus* fotos entre muchas, eligen varias y pagan.
- **Audiencia de la demo**: visitantes del portfolio de la autora (posibles clientes o empleadores) que prueban el flujo completo de punta a punta.

## Product Purpose

Plataforma para vender fotografías de eventos: el fotógrafo publica vistas previas protegidas con marca de agua y el cliente compra y descarga el original en alta resolución. Éxito = el comprador encuentra y paga sus fotos sin fricción, y el fotógrafo nunca expone sus originales.

Estado actual: **demo de portfolio**, no un servicio real. Pagos en sandbox de Mercado Pago; límites de uso (3 eventos, 20 fotos por evento, 15 MB por foto).

## Positioning

- Los originales nunca llegan al navegador: vistas previas de 1000 px con marca de agua en varias capas, distinta en cada foto, pensada para resistir el borrado con IA.
- Pago local con Mercado Pago Checkout Pro y entrega automática por correo con enlace que vence en 48 h.

## Operating Context

- Fotógrafo: escritorio, carga masiva por arrastrar y soltar, panel de eventos/ventas.
- Comprador: móvil primero, galería en grilla, visor a pantalla completa, carrito persistente, checkout que redirige a Mercado Pago, correo con enlace de descarga.
- Mercado Argentino: pesos (ARS), español rioplatense (voseo).

## Capabilities and Constraints

- Next.js 16 (App Router, TypeScript), Firebase Auth + Firestore, Supabase Storage (demo) o Firebase Storage (local/emuladores), sharp, Mercado Pago, correo SMTP.
- Pantallas: landing, login/registro, panel (eventos, detalle de evento con carga y regeneración de vistas previas, ventas, perfil), galería pública `/e/[slug]`, resultado de pago, descarga `/descarga/[token]`.
- Precio único por foto por evento. Sin búsqueda por dorsal ni reconocimiento facial (pendiente).
- Nombre del producto: **Instante** (reemplaza al provisorio "Fotoventa").

## Brand Commitments

- Nombre: **Instante**.
- Identidad propia como producto, independiente de la identidad del portfolio de la autora.
- Voz: español rioplatense, cercano y claro.
- Debe quedar explícito en todo el sitio que es una demo.

## Evidence on Hand

- No hay testimonios, clientes, métricas ni fotos de stock reales. No inventarlos.
- Las fotos de ejemplo las sube quien prueba la demo.

## Product Principles

1. Las fotos son las protagonistas; la interfaz se corre del medio.
2. El comprador llega desde el celular con poco contexto: encontrar, elegir y pagar en pocos toques.
3. Nunca exponer un original; la protección se ve pero no arruina la foto.
4. Honestidad de demo: nada simula ser un servicio real.
