# CarApp — ejecutar y probar

## 1. Vista previa sin cobros (recomendada para empezar)

1. Usa Node.js LTS (Node 22 está bien) y abre una terminal en la carpeta del proyecto.
2. Copia `.env.example` a `.env` si aún no tienes uno. Deja `EXPO_PUBLIC_BILLING_MODE=demo`.
3. Instala dependencias:
   ```bash
   npm ci
   ```
4. Abre la vista web:
   ```bash
   npx expo start --web --clear
   ```
   O inicia Metro para un cliente compatible:
   ```bash
   npx expo start --clear
   ```
5. En la pantalla inicial, pulsa **Probar paywall**. El botón **Simular compra** demuestra el flujo de navegación, pero no realiza cobros ni crea una suscripción real.

El modo demo usa precios ilustrativos. No los publiques como precios comerciales.

## 2. Probar compras reales con RevenueCat

Las compras reales requieren una API key pública de RevenueCat correcta, productos y un Offering configurados en el dashboard, el entitlement llamado `premium`, y una compilación nativa de desarrollo. Expo Go puede servir para previsualizar interfaces, pero no procesa compras reales de App Store / Google Play.

1. En `.env`, establece `EXPO_PUBLIC_BILLING_MODE=revenuecat`.
2. Rellena `EXPO_PUBLIC_RC_IOS_KEY` y/o `EXPO_PUBLIC_RC_ANDROID_KEY` con las claves públicas de la app/plataforma correspondiente. No pongas claves secretas del servidor en variables `EXPO_PUBLIC_*`.
3. En RevenueCat, comprueba que exista el Offering `default` (o que sea el Offering actual), que incluya los paquetes/productos de suscripción y que el entitlement se llame exactamente `premium`.
4. Reinstala dependencias y valida el proyecto:
   ```bash
   npm ci
   npx expo install --check
   npx expo-doctor
   ```
5. Como el proyecto incluye `expo-dev-client` y RevenueCat, crea e instala una development build compatible con tu teléfono. Con EAS:
   ```bash
   npx eas-cli login
   npx eas-cli build --profile development --platform android
   ```
   Para iPhone, usa `--platform ios` (la compilación iOS requiere el entorno/cuenta de Apple adecuados). Una vez instalada la build, inicia el servidor con `npx expo start --dev-client --clear` y abre la app de desarrollo, no Expo Go.

## Si aparece un error

- `Network request failed` o no aparecen productos: revisa internet, las claves, el Offering, productos y la configuración de tienda.
- `No offerings` o lista vacía: revisa que los productos estén asociados al Offering y que este esté publicado/activo en RevenueCat.
- `Native module` / `new NativeEventEmitter`: instala y abre una development build después de añadir/actualizar RevenueCat; reiniciar Metro por sí solo no instala código nativo.
- Si solo quieres revisar diseño y navegación, vuelve a `EXPO_PUBLIC_BILLING_MODE=demo`.
