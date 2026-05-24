# InteFin — Manual de Uso

> Guía paso a paso de todas las funcionalidades de la plataforma.
> URL: **https://intefin.vercel.app**

---

## Índice

- [Para Coaches](#para-coaches)
  - [1. Crear tu cuenta](#1-crear-tu-cuenta)
  - [2. Completar tu onboarding](#2-completar-tu-onboarding)
  - [3. Personalizar tu perfil público](#3-personalizar-tu-perfil-público)
  - [4. Invitar clientes](#4-invitar-clientes)
  - [5. Ver tu lista de clientes](#5-ver-tu-lista-de-clientes)
  - [6. Ver el detalle de un cliente](#6-ver-el-detalle-de-un-cliente)
  - [7. Editar los targets de las 4 cuentas](#7-editar-los-targets-de-las-4-cuentas)
  - [8. Activar el seguro de retiro](#8-activar-el-seguro-de-retiro)
  - [9. Tomar notas privadas del cliente](#9-tomar-notas-privadas-del-cliente)
  - [10. Registrar una sesión de coaching](#10-registrar-una-sesión-de-coaching)
  - [11. Compartir tu link público](#11-compartir-tu-link-público)
  - [12. Gestionar leads del test gratuito](#12-gestionar-leads-del-test-gratuito)
- [Para Clientes](#para-clientes)
  - [1. Recibir tu invitación](#1-recibir-tu-invitación)
  - [2. Completar tu diagnóstico inicial](#2-completar-tu-diagnóstico-inicial)
  - [3. Ver tu dashboard financiero](#3-ver-tu-dashboard-financiero)
  - [4. Actualizar tus saldos mensualmente](#4-actualizar-tus-saldos-mensualmente)
  - [5. Ver tu evolución histórica](#5-ver-tu-evolución-histórica)
  - [6. Ver tus sesiones con el coach](#6-ver-tus-sesiones-con-el-coach)
- [Para Visitantes Públicos](#para-visitantes-públicos)
  - [1. Hacer el test gratuito de salud financiera](#1-hacer-el-test-gratuito-de-salud-financiera)
  - [2. Contactar al coach](#2-contactar-al-coach)
- [Conceptos clave](#conceptos-clave)
- [Solución de problemas](#solución-de-problemas)

---

## Para Coaches

### 1. Crear tu cuenta

1. Entra a **https://intefin.vercel.app/auth/login**
2. Escribe tu correo electrónico → click **"Enviar link de acceso"**
3. Revisa tu bandeja de entrada — te llegó un correo de **InteFin** con un link
4. Haz click en el link → entras automáticamente sin necesidad de contraseña

> **Magic link:** No usamos contraseñas. Cada vez que quieras entrar, te enviamos un link de acceso por correo.

---

### 2. Completar tu onboarding

La primera vez que ingreses, te lleva al onboarding:

1. Llena **Tu nombre completo** (ej: "Mabel Álvarez")
2. Llena **Nombre de tu práctica / organización** (puede ser tu nombre o "Mabel Álvarez Coaching")
3. Click **Continuar →**
4. Te lleva al panel del coach (`/coach/overview`)

> Tu organización tiene un **slug único** que se genera automáticamente del nombre. Ej: `mabel-alvarez`. Este slug es tu URL pública.

---

### 3. Personalizar tu perfil público

En el menú lateral, click en **⚙️ Ajustes**.

Aquí puedes editar:

| Campo | Para qué sirve |
|-------|----------------|
| **Tagline** | Frase corta debajo de tu nombre. Ej: "Te ayudo a transformar tu relación con el dinero" |
| **Sobre ti** | Bio extendida — quién eres, tu historia, tu método (máx 500 caracteres) |
| **Email de contacto** | Correo que aparece como contacto. Puede ser distinto al de tu cuenta. |
| **WhatsApp** | Número con código país (ej: `+57 300 123 4567`). Aparece como botón de contacto. |
| **Color de marca** | Color que se usa en tu perfil público y el test |

Click **Guardar cambios** cuando termines.

Verás tu **link público** arriba (ej: `https://intefin.vercel.app/mabel-alvarez`). Click en **"Ver →"** para previsualizar cómo lo ven tus clientes.

---

### 4. Invitar clientes

En el menú lateral, click en **✉️ Invitar**.

1. Llena **Nombre completo del cliente** (ej: "María García")
2. Llena **Correo electrónico**
3. Click **"Enviar invitación ✉️"**

**Lo que pasa después:**
- Se envía un email al cliente automáticamente con su link de acceso
- Te aparece el link copiable para que puedas compartirlo tú también:
  - **📋 Copiar link** — al portapapeles
  - **💬 WhatsApp** — abre WhatsApp con mensaje listo para enviar

> ⚠️ **El link expira en 1 hora** y funciona una sola vez. Si tu cliente no lo usa a tiempo, vuelve a invitarlo.

---

### 5. Ver tu lista de clientes

En el menú lateral, click en **👥 Clientes**.

Verás una tabla con todos tus clientes:
- **Foto/iniciales** + nombre
- **Ocupación**
- **Estado:** Lead / Activo / Pausado / Completado
- Botón **"Ver →"** para ir al detalle

Si no tienes clientes aún, verás un empty state con CTA para invitar el primero.

---

### 6. Ver el detalle de un cliente

Desde la lista de clientes, click en **"Ver →"** en cualquier fila.

El detalle te muestra:

| Sección | Contenido |
|---------|-----------|
| **Header** | Avatar + nombre + estado + score de salud financiera |
| **🔒 Notas privadas** | Notas generales tuyas sobre el cliente (solo tú las ves) |
| **Perfil personal** | Ocupación, edad, dependientes, ingresos, gastos |
| **Diagnóstico** | Activos, deudas, patrimonio neto, salud/pensión, meta principal |
| **Las 4 Cuentas** | Con barras de progreso editables |
| **Sesiones** | Historial de sesiones registradas + botón para nueva |

---

### 7. Editar los targets de las 4 cuentas

En el detalle del cliente, en la sección **"Las 4 Cuentas"**:

1. Click en el monto del target (ej: `$5.000.000 ✎`)
2. Aparece un input editable
3. Escribe el nuevo monto y presiona **Enter** (o click ✓)
4. **Esc** o ✕ para cancelar

**Casos de uso típicos:**
- **Imprevisto/Oxígeno:** se calculan automáticamente del ingreso del cliente, pero puedes ajustarlos manualmente
- **Inversiones:** comienza en `$0`. Cuando el cliente esté listo, define un target — esto activa automáticamente la cuenta

---

### 8. Activar el seguro de retiro

En el detalle del cliente, en la fila **"🏦 Retiro"**:

1. Click en el botón **"Activar"** (si está inactivo) o **"✓ Activo"** (para desactivar)
2. Cambio inmediato

La cuenta de retiro funciona binaria: o el cliente tiene seguro de vida activo, o no.

---

### 9. Tomar notas privadas del cliente

En el detalle del cliente, sección **"🔒 Notas privadas"** (bloque ámbar arriba):

1. Click en **"+ Agregar"** o **"Editar"** si ya hay notas
2. Escribe contexto general del cliente: su historia, observaciones, recordatorios
3. Click **"Guardar"**

> **Importante:** Estas notas son **solo tuyas**. El cliente nunca las ve, ni siquiera mediante errores de la app — el campo nunca se envía al cliente.

Estas notas son diferentes a las notas por sesión (que están atadas a una sesión específica).

---

### 10. Registrar una sesión de coaching

En el detalle del cliente, sección **"Sesiones"** abajo:

1. Click en **"+ Nueva sesión"**
2. Llena:
   - **Fecha de la sesión**
   - **Resumen** — visible para el cliente (lo verá en su portal)
   - **Notas privadas** — solo tú las ves
   - **Tareas para el cliente** — checklist de acción (opcional, agregas las que quieras)
3. Click **"Registrar sesión"**

La sesión queda guardada con un número auto-incremental (#1, #2, #3...).

Para ver el detalle de una sesión anterior, click en su fila para expandirla.

---

### 11. Compartir tu link público

Tu URL pública es: `https://intefin.vercel.app/<tu-slug>` (ej: `mabel-alvarez`).

Encuéntrala en **Ajustes** o cópiala manualmente.

**Cómo compartirla:**
- **Instagram/redes sociales:** ponla en tu bio o stories
- **WhatsApp:** mándala a contactos interesados
- **Tarjeta de presentación digital:** sirve como tu portafolio mínimo

Cuando alguien la visite, verá:
1. Tu nombre, tagline y bio
2. El método de las 4 cuentas explicado
3. CTAs para contactarte por WhatsApp/email
4. **CTA principal:** **"📊 Hacer mi test gratuito (3 min)"**

---

### 12. Gestionar leads del test gratuito

Cuando alguien hace el test desde tu link público, llega a tu lista de leads.

En el menú lateral, click en **🎯 Leads**.

Verás 2 secciones:

| Sección | Qué muestra |
|---------|-------------|
| **Pendientes** | Leads que aún no has contactado. Score color-coded (rojo/ámbar/verde) |
| **Contactados** | Leads ya marcados como contactados (en gris atenuado) |

**Cada lead muestra:**
- Su score (ej: `42/100`)
- Su nombre
- Cuándo lo hizo
- Email y/o WhatsApp para contactar (click para abrir)
- Botón **"Marcar como contactado ✓"**

**Flujo típico:**
1. Llega un lead nuevo → click en su email o WhatsApp para contactarlo
2. Una vez le escribiste, click en **"Marcar como contactado ✓"** → pasa a la sección de abajo
3. Si decide trabajar contigo, vas a **✉️ Invitar** y lo conviertes en cliente formal

---

## Para Clientes

### 1. Recibir tu invitación

Tu coach te invita por dos vías:

**A. Por email automático:**
- Te llega un correo de **InteFin** con un link de acceso
- Click en el link → te lleva directamente al portal

**B. Por WhatsApp (link directo):**
- Tu coach te envía un link único
- Click en el link → te lleva directamente al portal

> ⚠️ **El link expira en 1 hora.** Si no lo usas a tiempo, pídele a tu coach que vuelva a generártelo.

---

### 2. Completar tu diagnóstico inicial

Después de hacer click en el link, te lleva al **wizard de diagnóstico** en 4 secciones:

#### Sección 1 — Tu perfil
- Nombre completo
- Año de nacimiento
- Ocupación
- ¿Con quién vives? (solo/pareja/familia)
- Número de dependientes
- ¿Cotizas salud y pensión?

#### Sección 2 — Situación actual
- Ingreso mensual promedio
- Gastos fijos mensuales
- Ahorros actuales
- ¿Tienes seguro de vida activo?

> Mientras llenas esto, verás un hint en vivo: "Tu fondo de emergencia ideal sería $X y tu oxígeno $Y" — son los targets de tus 4 cuentas calculados a partir de tu ingreso.

#### Sección 3 — Activos y deudas
- Activos líquidos (efectivo, cuentas bancarias)
- Activos de valor alto (finca, carro, moto, equipo)
- Total deudas
- Tipo de deudas (opcional)

> También aquí verás tu **patrimonio neto** calculado en tiempo real.

#### Sección 4 — Tus metas
- Objetivo principal (salir de deudas / ahorrar / invertir / comprar vivienda / otro)
- ¿Qué te genera más angustia financiera hoy?
- Horizonte de tiempo (6 meses / 1 año / 3 años / 5+ años)

**Al final:** click en **"Ver mi diagnóstico ✓"** y te lleva a tu dashboard.

---

### 3. Ver tu dashboard financiero

Tu dashboard en `/app/dashboard` te muestra:

**Hero arriba:**
- **Patrimonio Neto** — número grande (activos − deudas)
- **Score de salud financiera** — badge circular 0-100
- 3 mini-stats: Activos / Deudas / Gastos por mes

**Las 4 Cuentas:**
Cada card tiene:
- Color identificativo (rojo/naranja/violeta/verde)
- Saldo actual / Target
- Barra de progreso + porcentaje
- Botón **"Actualizar"** para editar el saldo

**Tu evolución:**
Gráfica de línea con tu historial mensual por cuenta (se va llenando a medida que actualizas tus saldos).

**Inversiones bloqueada:**
La cuenta de Inversiones aparece bloqueada hasta que tu Imprevisto y Oxígeno superen el 50% de su target. Esto refuerza el método: primero tu base, después crecer.

---

### 4. Actualizar tus saldos mensualmente

En tu dashboard, para cada cuenta:

1. Click en **"Actualizar"**
2. Escribe el nuevo saldo y presiona **Enter** (o click "Guardar")
3. **Esc** o ✕ para cancelar

> Tu progreso se calcula automáticamente y se guarda un snapshot mensual. Idealmente, actualiza tus saldos al inicio de cada mes para que tu gráfica histórica sea precisa.

**Cuenta de retiro:** Funciona binaria — o tiene seguro activo, o no. Tu coach es quien la marca como activa.

---

### 5. Ver tu evolución histórica

Debajo de las 4 cuentas, verás la gráfica **"Tu evolución"** con líneas de color por cuenta a lo largo del tiempo.

**Lo que muestra:**
- Saldo de cada cuenta mes por mes
- Solo dibuja líneas para cuentas que tienen al menos un snapshot
- Click sobre cualquier punto para ver el monto exacto

**El primer mes solo verás un punto** — la gráfica se vuelve más interesante a partir del 2do mes cuando ya tienes evolución.

---

### 6. Ver tus sesiones con el coach

En el menú superior, click en **Sesiones** (`/app/sessions`).

Verás cada sesión con:
- **Número de sesión** (Sesión #1, #2, etc.)
- **Fecha**
- **Resumen** — lo que tu coach escribió como compartido
- **Tus tareas** — checklist de acciones que debes ejecutar antes de la próxima sesión

> Las notas privadas del coach **nunca aparecen aquí**. Solo ves lo que el coach decidió compartir contigo.

---

## Para Visitantes Públicos

### 1. Hacer el test gratuito de salud financiera

1. Entra al link público del coach (ej: `https://intefin.vercel.app/mabel-alvarez`)
2. Click en **"📊 Hacer mi test gratuito (3 min)"**
3. Lee la intro → click **"Empezar el test →"**
4. Responde 10 preguntas (una a la vez, barra de progreso arriba)
5. Al final ves tu **score de salud financiera** (0-100)

**El resultado:**
- **Score grande** con tu nivel (crítico / necesita trabajo / decente / fuerte)
- Detalle por área **parcialmente visible** (las primeras 2 categorías) — el resto está borroso
- Para ver el análisis completo: click en **"Quiero mi análisis completo →"**

---

### 2. Contactar al coach

Si quieres tu análisis completo:

1. Llena tus datos:
   - **Nombre**
   - **Email** y/o **WhatsApp** (mínimo uno de los dos)
2. Click en **"Enviar mis resultados →"**

**Lo que pasa:**
- Tus resultados llegan al panel del coach
- El coach te contactará para una sesión

**Si prefieres contactar directo** sin dejar tus datos:
- Aparecen botones de WhatsApp y email del coach al final del formulario

---

## Conceptos clave

### Las 4 Cuentas (el método)

| Cuenta | Color | Target | Propósito |
|--------|-------|--------|-----------|
| **🛡 Imprevisto** | Rojo | 1× ingreso mensual | Fondo de emergencia para gastos no planeados |
| **💨 Oxígeno** | Naranja | 6× ingreso mensual | Sostenerte 6 meses sin trabajo |
| **🏦 Retiro** | Violeta | Booleano (activo?) | Seguro de vida y protección a largo plazo |
| **📈 Inversiones** | Verde | Definido por el coach | Crecimiento de capital — última en activarse |

**Reglas:**
- Empiezas construyendo Imprevisto
- Luego Oxígeno
- Retiro siempre debería estar activo (seguro de vida)
- Inversiones **se desbloquea cuando Imprevisto + Oxígeno cada una superan el 50%**

### Score de salud financiera

Número entre 0 y 100 que resume tu situación. Se calcula con esta fórmula:

```
score = (
  progreso_imprevisto  * 0.25 +   // 25% peso
  progreso_oxígeno     * 0.30 +   // 30% peso
  retiro_activo        * 0.20 +   // 20% (binario)
  progreso_inversiones * 0.15 +   // 15%
  ratio_deudas         * 0.10     // 10% (penaliza alto endeudamiento)
) * 100
```

Se actualiza cada vez que cambias un saldo.

### Diagnóstico inmutable

Cada vez que tu coach o tú completan un diagnóstico, se guarda un **snapshot inmutable**. Esto permite comparar tu "antes" vs "ahora" con datos reales — el diagnóstico anterior nunca se sobrescribe.

### Roles del sistema

| Rol | Acceso |
|-----|--------|
| **Coach** | Su organización: clientes, sesiones, leads, ajustes |
| **Cliente** | Solo su propio dashboard, metas, sesiones |
| **Super Admin** | Toda la plataforma (gestión interna de InteFin) |
| **Público** | Landing + perfiles públicos + tests gratuitos |

### Aislamiento de datos (multi-tenant)

InteFin es una plataforma para múltiples coaches. **Tus datos están aislados** — ningún otro coach puede ver tus clientes, ni un cliente de otro coach puede ver los tuyos. Esto está garantizado a nivel de base de datos con Row-Level Security (RLS).

---

## Solución de problemas

### "Email rate limit exceeded" al invitar
Pasó porque el servicio de email estaba limitado. Ya está resuelto con SMTP propio (Resend). Si vuelve a aparecer:
1. Verifica que el cliente no exista ya con ese email
2. Intenta otra vez en 1 hora

### El cliente no recibe el email
1. Revisa la **carpeta de spam**
2. Verifica que el email esté bien escrito
3. Si no llega, copia el link directamente desde el panel de invitación y compártelo por WhatsApp

### El link de invitación dice "expirado"
Los links expiran en **1 hora**. Pídele al coach que genere uno nuevo desde `/coach/invite`.

### "No se pudo crear la organización"
Verifica que el nombre no esté vacío. Si persiste, revisa que las migraciones de base de datos estén aplicadas (consulta a soporte técnico).

### El dashboard del cliente está vacío
El cliente debe completar primero el diagnóstico (los 4 pasos). Si lo completó pero no ve nada, recarga la página o cierra sesión y vuelve a entrar.

### La gráfica de evolución está vacía
Necesitas **al menos 1 snapshot por cuenta**. Cuando el cliente actualice su saldo por primera vez en una cuenta, aparecerá un punto. La gráfica se llena mes a mes.

### El test público no se ve bien
Verifica que tu organización tenga todos los campos llenos en **/coach/settings** (tagline, bio, contact_email, whatsapp, brand_color).

---

## Referencias rápidas

| Acción | URL |
|--------|-----|
| Landing pública | `https://intefin.vercel.app/` |
| Login | `https://intefin.vercel.app/auth/login` |
| Tu perfil público | `https://intefin.vercel.app/<tu-slug>` |
| Test gratuito (para visitantes) | `https://intefin.vercel.app/<tu-slug>/test` |
| Panel del coach | `https://intefin.vercel.app/coach/overview` |
| Dashboard del cliente | `https://intefin.vercel.app/app/dashboard` |

---

**¿Falta algo en este manual?** Avísale al equipo de desarrollo o agrega un issue en el repositorio.
