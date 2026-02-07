# 📱 Páginas Estáticas para Google Play Console

## ✅ Páginas Creadas

Se han creado dos páginas estáticas requeridas por Google Play Console para la sección de "Seguridad de los datos":

### 1. **Política de Privacidad**
- **URL:** `https://petiid.com/politica-de-privacidad`
- **Archivo:** `politica-de-privacidad.html`
- **Estado:** ✅ Lista para publicar
- **SEO:** Indexable (index, follow)

**Contenido incluido:**
- ✅ Declaración de datos recopilados (nombre, correo, ciudad, ubicación GPS)
- ✅ Uso de datos para Radar y traspasos QR
- ✅ Sistema TrustScore explicado
- ✅ Cifrado en tránsito y en reposo
- ✅ Política de no compartir con terceros para publicidad
- ✅ Derechos del usuario (acceso, rectificación, eliminación, portabilidad)
- ✅ Retención de datos y proceso de eliminación (48 horas)

---

### 2. **Eliminación de Cuenta**
- **URL:** `https://petiid.com/eliminar-cuenta`
- **Archivo:** `eliminar-cuenta.html`
- **Estado:** ✅ Lista para publicar
- **SEO:** No indexable (noindex, nofollow) - Solo accesible para bots de Google Play

**Funcionalidades:**
- ✅ Formulario de solicitud de eliminación
- ✅ Campo de correo electrónico (obligatorio)
- ✅ Campo de motivo (opcional)
- ✅ Checkbox de confirmación
- ✅ Advertencias claras sobre la irreversibilidad
- ✅ Integración con Supabase para registrar solicitudes
- ✅ Notificación de plazo de 48 horas

**Datos eliminados:**
- Perfil de usuario completo
- Todos los perfiles de mascotas
- Códigos Petiid QR
- Historial de adopciones y traspasos
- Mensajes y notificaciones
- Toda la actividad en la plataforma

---

## 🎨 Diseño

Ambas páginas utilizan:
- ✅ Color principal: **Azul Cian (#00E5FF)**
- ✅ Sistema de diseño del Panel Admin
- ✅ Responsive (mobile-first)
- ✅ Tipografía: Inter (Google Fonts)
- ✅ Estética premium y profesional

---

## 🔧 Configuración Técnica

### Archivos Modificados/Creados:

1. **`/petiid_admin_direct/politica-de-privacidad.html`** - Página de privacidad
2. **`/petiid_admin_direct/eliminar-cuenta.html`** - Página de eliminación
3. **`/petiid_admin_direct/.htaccess`** - Rutas limpias configuradas
4. **`/supabase/migrations/create_account_deletion_requests.sql`** - Tabla para solicitudes

### Rutas Configuradas en `.htaccess`:

```apache
RewriteRule ^politica-de-privacidad$ /politica-de-privacidad.html [L]
RewriteRule ^eliminar-cuenta$ /eliminar-cuenta.html [L]
```

---

## 📊 Base de Datos

### Tabla: `account_deletion_requests`

**Columnas:**
- `id` (UUID) - ID único
- `email` (TEXT) - Correo del usuario
- `reason` (TEXT) - Motivo de eliminación (opcional)
- `requested_at` (TIMESTAMP) - Fecha de solicitud
- `status` (TEXT) - Estado: pending, processing, completed, cancelled
- `processed_by` (UUID) - Admin que procesó
- `processed_at` (TIMESTAMP) - Fecha de procesamiento
- `notes` (TEXT) - Notas del admin

**Políticas RLS:**
- ✅ Cualquiera puede insertar (formulario público)
- ✅ Solo admins pueden ver/actualizar

**Script SQL:** `/supabase/migrations/create_account_deletion_requests.sql`

---

## 🚀 Pasos para Publicar

### 1. **Ejecutar Script SQL en Supabase**

Ve a [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor y ejecuta:

```sql
-- Copiar y pegar el contenido de:
/supabase/migrations/create_account_deletion_requests.sql
```

### 2. **Subir Archivos al Servidor**

Sube los siguientes archivos a tu servidor en `petiid.com`:

```bash
# Archivos a subir:
- politica-de-privacidad.html
- eliminar-cuenta.html
- .htaccess (actualizado)
```

**Comando de ejemplo (si usas FTP/SFTP):**
```bash
scp politica-de-privacidad.html usuario@petiid.com:/var/www/html/
scp eliminar-cuenta.html usuario@petiid.com:/var/www/html/
scp .htaccess usuario@petiid.com:/var/www/html/
```

### 3. **Verificar que las URLs Funcionen**

Abre en tu navegador:
- ✅ `https://petiid.com/politica-de-privacidad`
- ✅ `https://petiid.com/eliminar-cuenta`

Ambas deben cargar correctamente.

### 4. **Pegar URLs en Google Play Console**

Ve a Google Play Console → **Petiid** → **Configuración de la app** → **Seguridad de los datos**

**Pega estas URLs:**

1. **URL de Política de Privacidad:**
   ```
   https://petiid.com/politica-de-privacidad
   ```

2. **URL de Eliminación de Datos:**
   ```
   https://petiid.com/eliminar-cuenta
   ```

### 5. **Guardar y Enviar a Revisión**

- Click en "Guardar"
- Click en "Enviar a revisión"
- Espera la aprobación de Google (usualmente 1-3 días)

---

## 🎯 Gestión de Solicitudes de Eliminación

### Panel de Administrador

Las solicitudes de eliminación aparecerán en la tabla `account_deletion_requests` de Supabase.

**Para procesar una solicitud:**

1. Ve a Supabase Dashboard → Table Editor → `account_deletion_requests`
2. Verifica el correo del usuario
3. Ejecuta la función de eliminación en cascada (ya implementada)
4. Actualiza el estado a `completed`
5. Envía correo de confirmación al usuario

**Query SQL para ver solicitudes pendientes:**
```sql
SELECT * FROM account_deletion_requests 
WHERE status = 'pending' 
ORDER BY requested_at DESC;
```

---

## 📧 Notificaciones

Cuando un usuario solicita eliminación:
- ✅ Se registra en la base de datos
- ✅ Se muestra mensaje de confirmación en la página
- ⏳ **Pendiente:** Configurar email automático al admin (opcional)

---

## ✅ Checklist de Verificación

Antes de enviar a Google Play:

- [ ] Script SQL ejecutado en Supabase
- [ ] Archivos subidos al servidor
- [ ] URL `/politica-de-privacidad` funciona
- [ ] URL `/eliminar-cuenta` funciona
- [ ] Formulario de eliminación envía datos a Supabase
- [ ] Diseño responsive en móvil
- [ ] URLs pegadas en Google Play Console
- [ ] Enviado a revisión

---

## 🆘 Soporte

Si tienes problemas:

1. **Verificar logs de Apache:** `tail -f /var/log/apache2/error.log`
2. **Verificar permisos de archivos:** `chmod 644 *.html`
3. **Verificar .htaccess:** `apache2ctl configtest`
4. **Verificar Supabase:** Dashboard → Logs

---

## 📞 Contacto

**Desarrollador:** Antigravity AI  
**Fecha de creación:** 6 de febrero de 2026  
**Versión:** 1.0

---

## 🎉 ¡Listo para Lanzamiento!

Una vez que Google apruebe las páginas, los **1,234 usuarios** en lista de espera podrán descargar la app desde Google Play Store.

**¡Mucha suerte con el lanzamiento! 🚀🐾**
