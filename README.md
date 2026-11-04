# RightCom XP

Application mobile de démonstration RightCom XP destinée à illustrer trois modes d’intégration de `@rightcom/righttime-sdk` : widget RightTime dans une WebView, parcours natif React Native construit avec les API du SDK et page de réservation hébergée dans une WebView.

L’interface adopte l’identité visuelle RightCom XP et présente une expérience de réservation cohérente sur l’ensemble des écrans. Les paramètres techniques ne sont pas affichés dans l’application : ils sont fournis à l’exécution par l’environnement Expo.

## Prérequis et démarrage

- Bun 1.3 ou plus récent.
- Un checkout du SDK à côté du projet : `../sdk-frontend-feature-SE-e2e/packages/sdk`.
- Expo Go ou un émulateur Android/iOS. iOS nécessite macOS et Xcode.

```bash
bun install
bun run start
```

Lancer directement sur une plateforme : `bun run android` ou `bun run ios`.
Après une modification de Metro ou du SDK local, vider son cache :

```bash
bun run start -- --clear
```

## Build APK sur GitHub

Le workflow `.github/workflows/android-apk.yml` se déclenche à chaque push et construit un APK Android debug signé avec la clé debug, puis publie l’APK comme artefact GitHub Actions pendant 14 jours. Après un run réussi, télécharge `rightcom-xp-android-<commit>` dans l’onglet Actions du dépôt.

Le SDK est hébergé dans le dépôt privé GitLab. Ajouter dans **Settings → Secrets and variables → Actions** un secret `GITLAB_READ_TOKEN` disposant de `read_repository`. Sans ce secret, le workflow s’arrête à l’étape de récupération du SDK.

Pour que l’APK charge les services RightTime, configurer aussi le secret `RIGHTTIME_PUBLIC_KEY` et les variables `RIGHTTIME_COMPANY`, `RIGHTTIME_API_URL` et `RIGHTTIME_HOST_ORIGIN` dans GitHub. Ces valeurs sont intégrées au bundle mobile au moment du build. Ne pas utiliser une adresse `localhost` pour l’API dans un APK installé sur un téléphone.

## Configuration RightTime

Ajouter ces variables au fichier `.env` local (il peut déjà contenir d’autres réglages), puis renseigner les valeurs fournies pour l’environnement RightTime de l’entreprise :

```dotenv
EXPO_PUBLIC_RIGHTTIME_PUBLIC_KEY=pk_...
EXPO_PUBLIC_RIGHTTIME_COMPANY=identifiant-entreprise
EXPO_PUBLIC_RIGHTTIME_API_URL=https://api...
EXPO_PUBLIC_RIGHTTIME_HOST_ORIGIN=https://site-autorise...
EXPO_PUBLIC_RIGHTTIME_SDK_CDN_URL=https://cdn.../righttime.global.js
EXPO_PUBLIC_RIGHTTIME_WIDGET_URL=https://site-autorise.../booking
```

La clé doit être une clé publique autorisée pour l’origine configurée. Ne placer aucun secret privé dans une variable `EXPO_PUBLIC_*` : Expo intègre ces valeurs dans l’application. Redémarrer Expo après toute modification du fichier `.env`.

Pour un serveur local, l’émulateur Android accède à l’ordinateur via `10.0.2.2`, le simulateur iOS via `127.0.0.1`, et un téléphone physique via l’adresse IP locale de l’ordinateur. Utiliser HTTPS en production.

## Comment le SDK est intégré

### Client partagé pour les API natives

`src/lib/rightcare-context.tsx` lit les variables d’environnement, crée le client avec `createRightTimeClient` et partage sa configuration avec les écrans. `src/app/_layout.tsx` installe `RightCareProvider` autour des routes.

L’accueil (`src/app/index.tsx`) affiche uniquement des cartes de services fictifs pour la démonstration ; il ne charge aucune donnée du SDK. Le bouton de réservation ouvre `src/components/booking-bottom-sheet.tsx`, qui affiche le parcours de `src/components/booking-flow.tsx`. C’est dans ce parcours que le SDK charge les calendriers et services, les agents et les disponibilités, puis crée le rendez-vous. La route `src/app/booking.tsx` réutilise le même parcours en plein écran.

### Widget fourni par le SDK

`src/app/widget.tsx` charge le bundle global RightTime dans `react-native-webview`, initialise `window.RightTime` et monte le widget. Les événements de réservation remontent à l’application avec le canal `postMessage` de la WebView.

Le navigateur embarqué doit pouvoir accéder au CDN, à l’API et à l’hôte du widget. L’origine utilisée doit être autorisée par la clé publique.

### Page de réservation hébergée dans une WebView

`src/app/webview.tsx` ouvre la page hébergée configurée par `EXPO_PUBLIC_RIGHTTIME_WIDGET_URL`. Cette méthode convient lorsqu’une entreprise possède déjà une page web de réservation responsive et souhaite la présenter dans l’application sans reconstruire son interface mobile.

L’écran d’accueil ouvre directement le widget RightTime depuis le bouton principal « Prendre rendez-vous ». Le parcours natif et la page WebView sont également accessibles depuis l’écran « Explorer les intégrations ».

### Résolution du paquet SDK local

La dépendance Bun est déclarée comme `file:../sdk-frontend-feature-SE-e2e/packages/sdk`. `tsconfig.json` pointe les imports TypeScript vers `packages/sdk/src/index.ts`, et `metro.config.js` surveille le checkout voisin. Pour reprendre le projet dans une autre arborescence, mettre à jour le chemin de la dépendance, l’alias TypeScript et les dossiers surveillés par Metro.

## Interface

- `src/app/index.tsx` : accueil RightCom XP avec services de démonstration fictifs.
- `src/app/booking.tsx` : route plein écran réutilisant le parcours SDK.
- `src/components/booking-bottom-sheet.tsx` : bottom sheet de réservation ouvert depuis l’accueil.
- `src/components/booking-flow.tsx` : formulaire complet de réservation connecté au SDK.
- `src/app/widget.tsx` : widget RightTime.
- `src/app/webview.tsx` : page web de réservation intégrée en WebView.
- `src/app/integrations.tsx` : catalogue des trois méthodes d’intégration.
- `src/components/app-tabs.tsx` : navigation basse Accueil, Réserver et Widget.
- `src/components/animated-icon.tsx` : animation du logo RightTime au démarrage.

La barre d’état est configurée dans `src/app/_layout.tsx`. La police utilise la sans-serif native de la plateforme (Roboto sur Android, police système sans-serif sur iOS).

## Ressources visuelles

`app.json` définit le nom `RightCom XP` et utilise `assets/imgi_7_righttime-256x256.png` pour l’écran de démarrage natif. Le header et le splash animé réutilisent cette même image. Les variantes PNG plus petites sont disponibles dans `assets/` pour les usages d’icône.

