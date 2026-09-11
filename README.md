# Crypto Explorer

App móvil para explorar en tiempo real el mercado de criptomonedas y guardar tus monedas favoritas en el dispositivo, incluso para consultarlas sin conexión.

> **Estado:** en desarrollo. Las instrucciones de instalación y las capturas se agregan cuando exista el proyecto base.

## Contexto académico

Proyecto Programado 2, **Explorador de Datos y Consumo de APIs**, del curso **Programación para Dispositivos Móviles (TPA-4001)**, semanas 7 a 10.

Objetivos del proyecto:

- Consumir una API RESTful y manejar correctamente los estados de carga y de error.
- Implementar almacenamiento persistente local con SQLite.
- Manejar con estado global (Context API) la información que viene de la base de datos local.
- Separar la lógica de red, la lógica de base de datos y las vistas.

## Funcionalidades

| Pantalla | Qué hace |
|---|---|
| **Mercado** | Lista las 50 criptomonedas con mayor capitalización, con precio en USD y variación de 24 h. Incluye búsqueda por nombre o símbolo, pull-to-refresh y mensajes claros ante errores (sin conexión, tiempo agotado, límite de consultas) con opción de reintentar. |
| **Detalle** | Muestra datos ampliados de una moneda: ranking, capitalización, volumen, máximo y mínimo de 24 h y última actualización. Desde aquí se marca o desmarca como favorita. |
| **Favoritos** | Lista las monedas guardadas en el dispositivo, actualiza sus precios y permite eliminarlas con confirmación. Sin conexión muestra el último precio guardado. |

Los favoritos se conservan al cerrar la app, y cualquier cambio se refleja al instante en todas las pantallas.

## Tecnologías

- **React Native + Expo** (TypeScript), con **Expo Router** para la navegación
- **CoinGecko API v3** como fuente de datos de mercado
- **SQLite** (`expo-sqlite`) para la persistencia local
- **Context API + `useReducer`** para el estado global de favoritos
- **Jest** (`jest-expo`), **ESLint** y **Prettier** para calidad de código

Plataformas: iOS y Android.

## Arquitectura

La app se organiza en capas con dependencias en un solo sentido: **vistas → hooks/contexto → red/base de datos**.

```
app/                 Rutas (Expo Router): solo declaran la navegación
src/
  api/               Capa de red: cliente HTTP, errores tipados, DTO y mappers
  db/                Capa de datos local: conexión SQLite, migraciones y repositorio
  context/           Estado global de favoritos (Context API + reducer)
  hooks/             Estado de las peticiones remotas (carga, error, refresco)
  models/            Modelos de dominio
  screens/           Pantallas
  components/        Componentes de UI reutilizables
  utils/             Formato de valores y mensajes de error
```

### API consumida

| Uso | Endpoint |
|---|---|
| Listado de mercado | `GET /coins/markets` |
| Detalle de una moneda | `GET /coins/{id}` |
| Precios de favoritos | `GET /simple/price` |

La API pública de CoinGecko se puede usar sin API key, pero tiene límite de peticiones. Opcionalmente se puede configurar una demo key gratuita en la variable de entorno `EXPO_PUBLIC_COINGECKO_API_KEY`.

### Base de datos local

```sql
CREATE TABLE favorites (
  coin_id        TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  symbol         TEXT NOT NULL,
  image_url      TEXT,
  last_price_usd REAL,
  saved_at       INTEGER NOT NULL
);
```

## Flujo de trabajo

- **Planificación**: metodología Spec-Driven. El avance se sigue en Linear, con un issue por cada grupo de tareas.
- **Ramas**:
  - `main` es la versión de entrega.
  - `develop` es la rama de integración.
  - Cada issue se trabaja en su propia rama con el número del issue, por ejemplo `joe-132-capa-de-red`, y se integra a `develop` mediante un pull request.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) con el id del issue, por ejemplo `feat(api): cliente HTTP con timeout [JOE-132]`.

## Hoja de ruta

- [ ] Configuración del proyecto y repositorio
- [ ] Modelos y capa de red
- [ ] Base de datos local (SQLite)
- [ ] Estado global de favoritos
- [ ] Navegación y componentes compartidos
- [ ] Pantalla Mercado
- [ ] Pantalla Detalle
- [ ] Pantalla Favoritos
- [ ] Verificación y documentación final

## Instalación y ejecución

_Próximamente._ Se documenta cuando el proyecto base de Expo esté creado.
