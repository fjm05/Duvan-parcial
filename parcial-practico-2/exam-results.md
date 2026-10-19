# Resultados del parcial práctico 2

Los códigos HTTP se obtuvieron levantando la aplicación NestJS con el controlador, los pipes y los servicios reales, pero con los repositorios de TypeORM simulados en memoria. No se ejecutó PostgreSQL ni Postman porque Docker no estaba disponible en el equipo. Por eso la persistencia de la cancelación en la base de datos queda pendiente de comprobar con `docker compose up -d --wait`.

| Petición y datos utilizados | Código esperado | Código obtenido | Observación |
| --- | --- | --- | --- |
| Crear una reserva con datos válidos y sala existente. `{ "purpose": "x", "participants": 6, "roomId": 1 }` | 201 | 201 | Se llamó a `save()` una vez. |
| Crear con participants como texto. `"participants": "6"` | 400 | 400 | `@IsInt()` rechaza el texto porque el pipe no convierte tipos. |
| Crear con una propiedad adicional, como status. `"status": "cancelled"` | 400 | 400 | `forbidNonWhitelisted` rechaza la propiedad. |
| Crear con una sala inexistente. `"roomId": 55` | 404 | 404 | Lo lanza `ReservationsService.create()`. |
| Cancelar una reserva activa y consultar el cambio guardado. `PATCH /api/reservations/1/cancel` | 200 | 200 | Se llamó a `save()` con estado `cancelled`. La lectura posterior en base de datos queda pendiente. |
| Cancelar de nuevo la misma reserva. Reserva con estado `cancelled` | 409 | 409 | No se llamó a `save()`. |
| Intentar cancelar con ID abc. `PATCH /api/reservations/abc/cancel` | 400 | 400 | `ParseIntPipe` rechaza antes de ejecutar el servicio. |
| Intentar cancelar con un ID entero inexistente. `PATCH /api/reservations/999/cancel` | 404 | 404 | Lo lanza `findOne()`. |

Validaciones adicionales del DTO: `purpose` vacío, `participants` igual a 21 y `purpose` de 81 caracteres devolvieron 400.

## Pruebas unitarias

Resultado de `npm test`: 2 suites y 3 pruebas, todas en verde.

| Caso | Resultado obtenido |
| --- | --- |
| 1. La regla real rechaza una reserva cancelada. | Pasa. `ensureCanCancel()` lanza `ConflictException`. |
| 2. El servicio cancela y guarda una reserva activa. | Pasa. Se llama a la regla, `save()` recibe el estado `cancelled` y se devuelve su resultado. |
| 3. Si la regla simulada rechaza, conserva active y no guarda. | Pasa. Se propaga `ConflictException`, el estado sigue `active` y `save()` no se llama. |

Resumen de ejecución: `Test Suites: 2 passed, 2 total` y `Tests: 3 passed, 3 total`. `npm run build` y `npm run typecheck` terminan sin errores.
