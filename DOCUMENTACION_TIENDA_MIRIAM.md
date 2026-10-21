# DOCUMENTACIÓN OFICIAL Y MANUAL TÉCNICO • PROYECTO TIENDA MIRIAM
## Arquitectura .NET 8 / ASP.NET Core MVC & Web API + POS Windows Forms Offline-First (SQLite)

---

## 1. RESUMEN EJECUTIVO Y FILOSOFÍA DEL SISTEMA
**Tienda Miriam** es un sistema ERP comercial y Punto de Venta (POS) de grado industrial y doble propósito, diseñado específicamente para operar de manera simultánea como:
1. **Punto de Venta de Restaurante & Comidas Rápidas:** Control de comandas, mesas, preparación de alimentos y escandallo automatizado.
2. **ERP de Mercancías & Abarrotes Comerciales:** Reventa de productos envasados, artículos de tienda, venta fraccionada por peso/unidad y trazabilidad de productos congelados por lote.

El sistema se compone de una **arquitectura híbrida (Offline-First + Web Cloud)**:
- **POS de Escritorio Windows Forms:** Opera 100% desconectado a internet contra una base de datos local SQLite (`tiendamiram.db`), garantizando cero caídas en mostrador.
- **Panel Web Empresarial ASP.NET Core MVC:** Interfaz corporativa oscura tipo SaaS accesible desde PC o móvil para la dueña (Doña Miriam Suárez), permitiendo monitoreo en tiempo real, ajuste dinámico de recetas/precios y auditoría forense inalterable.

---

## 2. QUÉ HACE Y QUÉ NO HACE EL SISTEMA

### ✅ LO QUE SÍ HACE EL SISTEMA:
1. **Unidades de Medida Libres y Conversión Matemática (Estilo Airontium):**
   - El dueño puede definir cualquier unidad base: masa (`kg`, `g`, `lb`, `oz`), volumen (`L`, `ml`) o discretas (`un`, `caja`, `paquete`, `blíster`, `porción`).
   - Conversión cruzada automática: Si un insumo (ej. carne) se compra en kilogramos pero la receta consume 150 gramos o 1 libra, el sistema calcula el factor matemático exacto y deduce el stock correcto en tiempo real.
2. **Presentaciones Múltiples por Producto (Caso Galletas Oreo):**
   - Un mismo producto puede venderse en unidad suelta, display/caja de 24 unidades o paquetes de 4, deduciendo proporcionalmente el inventario base.
3. **Bandera de Restricción de Venta Directa (`ShowInPOS = Sí / No`):**
   - **SÍ:** Se muestra en la pantalla táctil del cajero para cobro directo.
   - **NO:** Actúa exclusivamente como **Insumo o Materia Prima interna** (ej. sal, aceites, especias), ocultándose de la caja para evitar confusiones de cobro pero descontándose en las recetas.
4. **Productos Multifunción (Doble Rol):**
   - Un producto puede ser a la vez mercancía de venta al público y materia prima de recetas (ej. Coca-Cola para marinadas, Galleta Oreo en malteadas artesanales).
5. **Control de Congelados, Lotes y Venta por Peso:**
   - Registro de número de lote y fecha de vencimiento.
   - Posibilidad de cobro por peso fraccionado (ej. Pavos enteros vendidos por kilogramo exacto).
6. **Ventas en Horas Pico con Stock Negativo Permitido:**
   - Si el stock de un producto se agota en el sistema debido a demoras en el registro de compras, **el POS no bloquea la venta**; en su lugar, el inventario se muestra en números rojos (-1, -2, -3...), asegurando el flujo continuo de ingresos.
7. **Control Estricto de Acceso y Roles:**
   - **CAJERO:** Exclusivamente cobros, comandas de mesas, ventas en espera (F9) y arqueo físico de su turno. Bloqueado de recetas, costos y auditoría.
   - **DUEÑO (ADMIN):** Acceso total sin restricciones en el POS y control absoluto del Panel Web Empresarial.
8. **Auditoría Forense Inalterable:**
   - Cada cambio de precio, modificación de receta, ajuste manual de stock o apertura de turno queda registrado con usuario, marca de tiempo, valor anterior, valor nuevo y justificación obligatoria.

---

### ❌ LO QUE NO HACE EL SISTEMA (FRONTERAS DEL SOFTWARE):
1. **No bloquea las ventas cuando el stock llega a cero:** Está expresamente diseñado para no detener la caja durante horas pico (admite stock negativo temporal).
2. **No altera los registros de auditoría forense:** La bitácora es inmutable (`Append-Only`), impidiendo borrar o editar registros históricos.
3. **No depende de internet para cobrar:** Si la conexión a internet cae, el POS continúa operando al 100% contra SQLite y almacena las transacciones en una cola `Outbox` para sincronización posterior.
4. **No permite a los cajeros ver márgenes de ganancia ni costos de compra:** La información financiera confidencial está reservada exclusivamente para el rol Dueño.

---

## 3. ARQUITECTURA DE LA SOLUCIÓN .NET 8 (4 PROYECTOS MODULARES)

La solución `TiendaMiriam.sln` está estructurada en 4 capas desacopladas:

```
dotnet_solution/
│
├── TiendaMiriam.sln
│
├── TiendaMiriam.Core/                     # Capa de Dominio Puro
│   ├── Entities/                          # Product, RecipeItem, Presentation, Sale, User, etc.
│   ├── Enums/                             # ProductCategory, UnitType, UserRole, PaymentMethod
│   └── Services/
│       ├── IUnitConversionService.cs      # Motor de conversión de masa, volumen y unidades libres
│       └── IRecipeEngine.cs               # Escandallo automático y deducción atómica de inventario
│
├── TiendaMiriam.Infrastructure/           # Capa de Persistencia y Acceso a Datos
│   ├── Data/
│   │   ├── TiendaMiriamDbContext.cs       # EF Core 8 con SQLite (tiendamiram.db)
│   │   └── DbInitializer.cs               # Datos semilla con recetas precargadas y usuarios
│   └── Repositories/                      # Repositorios genéricos y específicos
│
├── TiendaMiriam.POS/                      # Aplicación de Escritorio (Windows Forms)
│   ├── Forms/
│   │   ├── MainPosForm.cs                 # Formulario principal de 3 columnas (Sidebar, Catálogo, Carrito)
│   │   └── MainPosForm.Designer.cs
│   └── Services/
│       └── PosCartManager.cs              # Gestión del carrito de compras y cobros rápidos
│
└── TiendaMiriam.WebDashboard/             # Panel Web Empresarial (ASP.NET Core MVC & Web API)
    ├── Controllers/
    │   ├── AccountController.cs           # Autenticación con cookies y roles
    │   ├── DashboardController.cs         # Métricas de ventas, COGS y margen bruto en tiempo real
    │   ├── ProductsController.cs          # Catálogo maestro, precios y flag de venta directa
    │   ├── RecipesController.cs           # Editor visual de escandallo con unidades libres
    │   ├── CashController.cs              # Control de arqueos y supervisión de cajas
    │   ├── AuditController.cs             # Bitácora forense de modificaciones
    │   └── Api/PosSyncApiController.cs    # Endpoints REST para sincronización nube-POS
    ├── Views/                             # Vistas Razor con diseño corporativo oscuro tipo SaaS
    └── Program.cs                         # Configuración de pipeline, autenticación y DI
```

---

## 4. DETALLE MATEMÁTICO DEL MOTOR DE ESCANDALLO Y CONVERSIONES

### A. Tabla de Factores a Unidades Base:
| Tipo | Unidad | Símbolo | Factor Base |
| :--- | :--- | :--- | :--- |
| **Masa** | Gramo | `g` | 1.0 (Base) |
| **Masa** | Kilogramo | `kg` | 1,000.0 g |
| **Masa** | Libra | `lb` | 453.59237 g |
| **Masa** | Onza | `oz` | 28.34952 g |
| **Volumen** | Mililitro | `ml` | 1.0 (Base) |
| **Volumen** | Litro | `L` | 1,000.0 ml |
| **Discreta** | Unidad | `un` | 1.0 (Base) |
| **Discreta** | Caja Display | `caja` | Multiplicador configurable (ej. 24) |

### B. Fórmula de Costo Unitario de Insumo:
$$\text{Costo Consumo} = \left(\text{Cantidad Consumida} \times \frac{\text{Factor Base}_{\text{Receta}}}{\text{Factor Base}_{\text{Stock}}}\right) \times \text{Costo Unitario Stock}$$

*Ejemplo Práctico:*
- Insumo: Carne Molida. Costo en almacén: **Bs. 32.00 por kg**.
- Receta consumida: **150 g**.
- Conversión: $150 \times \frac{1}{1000} = 0.15\text{ kg}$.
- Costo calculado: $0.15 \times 32.00 = \mathbf{Bs.\ 4.80}$.

---

## 5. INSTRUCCIONES DE COMPILACIÓN Y EJECUCIÓN

### Requisitos Previos:
- SDK de **.NET 8.0** instalado (`dotnet --version` >= 8.0.0).
- Windows 10/11 para la aplicación de escritorio `TiendaMiriam.POS` (Windows Forms).
- Cualquier sistema operativo (Linux, macOS, Windows) para `TiendaMiriam.WebDashboard` y las librerías `Core`/`Infrastructure`.

### Pasos para Ejecutar el Panel Web Empresarial:
```bash
cd dotnet_solution/TiendaMiriam.WebDashboard
dotnet run
```
Abra su navegador en: `https://localhost:5001` o `http://localhost:5000`.
- **Usuario Dueño:** `miriam`
- **Contraseña:** `Miriam2026!`
- **PIN Dueño:** `1234`

### Pasos para Ejecutar el POS de Escritorio:
```bash
cd dotnet_solution/TiendaMiriam.POS
dotnet run
```

---

## 6. CREDENCIALES Y DATOS SEMILLA PRECARGADOS
| Usuario | Rol | Contraseña | PIN | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `miriam` | **ADMIN (Dueña)** | `Miriam2026!` | `1234` | Control absoluto del POS y Panel Web |
| `cajero` | **CAJERO** | `Caja2026!` | `0000` | Operador de ventas y arqueo en POS |
