# React Native E-Commerce App

### Technical Assessment — Royal Brothers

## 1. Project Setup

Follow these steps to run the application on your local machine:

### Prerequisites

- **Node.js**: `v22.11.0` or higher (verified in `package.json` engines)
- **CocoaPods** (for iOS builds)
- **Android SDK & Build Tools** (for Android builds)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd ecommerce
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Install iOS CocoaPods:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

- **Start the Metro Bundler**:
  ```bash
  npm start
  ```
- **Run on Android**:
  ```bash
  npm run android
  ```
  _(Runs `react-native run-android --main-activity .MainActivityDefault`)_
- **Run on iOS**:
  ```bash
  npm run ios
  ```

---

## 2. Folder Structure & Architecture

### Folder Structure

```
ecommerce/
├── android/
│   └── app/src/main/java/com/ecommerce/
│       ├── AppIconAlarmReceiver.kt
│       ├── AppIconAlarmScheduler.kt
│       ├── AppIconHelper.kt
│       ├── BootReceiver.kt
│       ├── DynamicAppIconModule.kt
│       ├── DynamicAppIconPackage.kt
│       ├── MainActivity.kt
│       └── MainApplication.kt
├── ios/
└── src/
    ├── api/
    │   ├── axiosInstance.ts
    │   └── productApi.ts
    ├── components/
    │   ├── Home/
    │   │   ├── FilterBottomSheet.tsx
    │   │   └── ProductCard.tsx
    │   ├── cart/
    │   │   └── CartCard.tsx
    │   ├── productDetails/
    │   │   ├── ProductBottomBar.tsx
    │   │   ├── ProductDescription.tsx
    │   │   ├── ProductHeaderImage.tsx
    │   │   ├── ProductInfoList.tsx
    │   │   ├── ProductPriceBox.tsx
    │   │   ├── ProductReviews.tsx
    │   │   ├── ProductSpecifications.tsx
    │   │   └── ProductTitleInfo.tsx
    │   ├── InvalidLinkModal.tsx
    │   └── NoInternetModal.tsx
    ├── hooks/
    │   ├── useDebounce.ts
    │   └── useDynamicAppIcon.ts
    ├── navigations/
    │   ├── AppNav.tsx
    │   └── TabNav.tsx
    ├── screens/
    │   ├── tabs/
    │   │   ├── Cart.tsx
    │   │   ├── Home.tsx
    │   │   └── Profile.tsx
    │   ├── Checkout.tsx
    │   ├── Login.tsx
    │   └── ProductDetails.tsx
    ├── store/
    │   ├── slices/
    │   │   ├── cartSlice.ts
    │   │   ├── checkoutSlice.ts
    │   │   ├── deepLinkSlice.ts
    │   │   └── userSlice.ts
    │   └── store.ts
    ├── theme/
    │   └── colors.ts
    ├── types/
    │   ├── product.ts
    │   └── react-native-dynamic-app-icon.d.ts
    └── utils/
        ├── appIconManager.ts
        ├── appIconStorage.ts
        └── deepLinkHandler.ts
```

### Architecture

The project follows a **Layer-Based (Type-First) Architecture** — the top-level `src/` folders are organized by their **technical responsibility** (`screens/`, `components/`, `store/`, `api/`, `hooks/`, `utils/`, `types/`, `theme/`), not by individual feature folders.

- **`screens/`** — Contains all screen-level components. Each screen manages its own data fetching via direct API calls and local `useState`/`useEffect`. No ViewModel or controller layer sits in between.
- **`components/`** — Reusable UI pieces, further grouped into subfolders by the screen they serve (`Home/`, `cart/`, `productDetails/`).
- **`store/`** — Redux Toolkit slices handling only cross-screen shared state (cart, user, checkout, deepLink). API data is not cached in Redux — it lives in screen-local state. Persisted via MMKV for synchronous reads on cold start.
- **`api/`** — Thin Axios wrapper and service functions. Screens import and call these directly.
- **`utils/`** — Standalone helper modules for cross-cutting concerns (deep link parsing, app icon scheduling). Pure functions, independent of React lifecycle.
- **`hooks/`** — Custom hooks encapsulating reusable side-effect logic (`useDynamicAppIcon`, `useDebounce`).
- **`types/`** — Shared TypeScript interfaces and type declarations.
- **`theme/`** — Centralized color and styling constants.
- **`navigations/`** — Stack and Tab navigator configuration.

---

## 3. API Reference & Endpoints

The application utilizes **DummyJSON API** (`https://dummyjson.com/`) as its mock REST backend server. Connections are handled via a custom Axios client configuration featuring request timeouts:

### Configured Endpoints

- **`GET /products`**
  - _Purpose_: Fetches standard product catalogs.
  - _Parameters_: Supports `limit` (pagination page size), `skip` (offset), `sortBy` (sort field), and `order` (`asc`/`desc`).
- **`GET /products/{id}`**
  - _Purpose_: Retrieves detailed attributes for a single product.
  - _Validation Role_: Used in deep linking (`myapp://product/<id>`) to check if a product exists on the server before directing navigation.
- **`GET /products/search`**
  - _Purpose_: Queries products matching a text string.
  - _Parameters_: Takes query text `q` plus pagination parameters.
- **`GET /products/category-list`**
  - _Purpose_: Fetches list of categories.
  - _Validation Role_: Used in deep linking (`myapp://category/<name>`) to match the user's category parameter case-insensitively before loading.
- **`GET /products/category/{categoryName}`**
  - _Purpose_: Filters products by a specific category.

---

## 4. Tech Stack

The application utilizes a curated list of modern React Native packages, selected for efficiency, performance, and native feel:

| Package                             | Purpose                  | Why It Was Chosen                                                                                                                                                                                                   |
| :---------------------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React Native (v0.87.0)**          | Core Framework           | Enables cross-platform compilation to high-performing native components on Android and iOS.                                                                                                                         |
| **Redux Toolkit & React Redux**     | State Management         | Standardizes predictable global state across slices (`cart`, `user`, `checkout`, `deepLink`) with boilerplate-free syntax.                                                                                          |
| **Redux Persist (v6.0.0)**          | State Persistence        | Ensures user sessions, cart items, and checkout details survive app process death.                                                                                                                                  |
| **React Native MMKV (v4.3.2)**      | High-Performance Storage | A C++-based, synchronous key-value storage. Replaces slow asynchronous AsyncStorage to provide instantaneous reads at app launch. Serves as the storage adapter for Redux Persist and stores the App Icon schedule. |
| **React Navigation (v7.x)**         | Routing & Navigation     | Offers seamless native-like stack and bottom-tab transitions.                                                                                                                                                       |
| **Shopify FlashList (v2.3.2)**      | Highly-Optimized Lists   | Recycles views to provide extremely smooth 60 FPS list scrolling, crucial for product catalogs with heavy images.                                                                                                   |
| **React Native Dynamic App Icon**   | iOS App Icon Swapping    | Native bridge wrapper to change alternate icons on iOS.                                                                                                                                                             |
| **React Native Date Picker (v5.x)** | Native Date Picker       | Integrates platform-native date/time spinner wheels for scheduling promotions.                                                                                                                                      |
| **Confetti Cannon (v1.5.x)**        | Visual Reward / Feedback | Delights users upon checkout success with a lightweight canvas confetti animation.                                                                                                                                  |
| **NetInfo (v12.x)**                 | Network Listener         | Continuously monitors internet status to gracefully handle offline transitions.                                                                                                                                     |
| **Toast Message (v2.x)**            | Micro-Interactions       | Provides clean, non-blocking toast notifications (success, warning, info) for system changes.                                                                                                                       |

---

## 5. E-commerce Features

- **Product Catalog (`Home`)**:
  - Live product feed optimized with `FlashList` for smooth scrolling.
  - Category-based filtering and instant search capabilities.

<p align="center">
  <img src="./src/assets/screenshots/home.png" width="30%" />
  <img src="./src/assets/screenshots/homecat.png" width="30%" />
  <img src="./src/assets/screenshots/homesearch.png" width="30%" />
</p>

- **Product Details (`ProductDetails`)**:
  - Rich image galleries, ratings, and detailed specifications.
  - Automatically calculates and displays discount-adjusted pricing.

<p align="center">
  <img src="./src/assets/screenshots/productDetail.png" width="30%" />
  <img src="./src/assets/screenshots/productDetailCar.png" width="30%" />
</p>

- **Persistent Shopping Cart (`Cart`) & Seamless Checkout**:
  - Offline-persisted cart items with quantity controls.
  - Persistent shipping addresses, payment validation (COD / Card / UPI).
  - Visual checkout reward featuring a confetti explosion and order receipt.

<p align="center">
  <img src="./src/assets/screenshots/cart.png" width="30%" />
  <img src="./src/assets/screenshots/checkout.png" width="30%" />
  <img src="./src/assets/screenshots/success.png" width="30%" />
</p>

- **Secure Authentication (`Login` / `Profile`)**:
  - Clean regex validation for credentials.
  - Automatic redirect of pending deep links after successful login.
- **Network Safety Modal (`NoInternetModal`)**:
  - Full-screen connection block preventing network requests when offline, featuring an on-demand manual connection check.

---

## 6. Deep Linking

The app registers and normalizes the custom URL scheme: `myapp://`.

### Supported Routes

- `myapp://product/<productId>` - Navigates to a specific product's details page.
- `myapp://category/<categoryName>` - Opens the catalog pre-filtered by the given category name (case-insensitive).
- `myapp://cart` - Opens the user's cart (requires authentication).
- `myapp://profile` - Opens the user's profile settings page.

### Protected Route Flow (`myapp://cart`)

1. **Request Interception**: When a user opens `myapp://cart`, the `handleDeepLinkUrl` utility checks Redux for an authenticated email.
2. **Pending Registration**: If unauthenticated, the destination screen name `'cart'` is saved in the Redux store (`deepLink.pendingDeepLink`).
3. **Redirection & Alert**: The app displays an information toast ("Please log in to view your cart") and redirects the user to the `login` screen.
4. **Resuming Navigation**: Once the login details pass validation and the user is authenticated, the `Login` screen inspects `pendingDeepLink`. If it is `'cart'`, it clears the pending state and resets the stack navigation directly to the `Cart` tab.

### Invalid Deep Link Handling

If a deep link is unrecognized or contains invalid parameters, the application prevents navigation failures using the following validation rules:

1. **Invalid Product ID / ID Mismatch**:
   - If the URL structure is `myapp://product/<productId>` but the parameter is non-numeric (e.g., `myapp://product/abc`), zero/negative, or the backend product API queries fail (product ID not in database), the handler catches the error.
2. **Invalid Category / Missing Name**:
   - If the URL is `myapp://category/<categoryName>` but the category name parameter is missing or does not match any valid category retrieved from the category catalog, the check fails.
3. **Unrecognized Patterns**:
   - Any URL structure that does not map to registered routes (like `myapp://random-path`) is intercepted.

**Behavior on Failure**:

- The handler dispatches `setInvalidDeepLink` to store the invalid link metadata (`url`, error `title`, and descriptive `message`) in the Redux store.
- A full-screen overlay modal (**`InvalidLinkModal`**) is immediately presented to the user, displaying a detailed description of the error (e.g., _"Product #999 was not found or is no longer available"_).
- The modal features a prominent **Go to Home** button that resets the navigation stack to the Home tab and dismisses the overlay, preventing the user from getting stuck.

### How to Test Deep Linking

Ensure the simulator/emulator is booted and the app is running in the background.

#### Android (using ADB)

```bash
# Test Product Details navigation (valid product)
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/1" com.ecommerce

# Test Invalid Product ID (non-numeric name instead of ID)
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/noname" com.ecommerce

# Test Valid Category navigation
adb shell am start -W -a android.intent.action.VIEW -d "myapp://category/beauty" com.ecommerce

# Test Non-Existent Category
adb shell am start -W -a android.intent.action.VIEW -d "myapp://category/nocategory" com.ecommerce

# Test Protected Route Flow (will redirect to login, then cart upon authentication)
adb shell am start -W -a android.intent.action.VIEW -d "myapp://cart" com.ecommerce

# Test Unrecognized Route
adb shell am start -W -a android.intent.action.VIEW -d "myapp://invalidroute" com.ecommerce
```

#### iOS (using Simctl)

```bash
# Test Product Details navigation (valid product)
xcrun simctl openurl booted "myapp://product/1"

# Test Invalid Product ID (non-numeric name instead of ID)
xcrun simctl openurl booted "myapp://product/noname"

# Test Valid Category navigation
xcrun simctl openurl booted "myapp://category/beauty"

# Test Non-Existent Category
xcrun simctl openurl booted "myapp://category/nocategory"

# Test Protected Route Flow
xcrun simctl openurl booted "myapp://cart"

# Test Unrecognized Route
xcrun simctl openurl booted "myapp://invalidroute"
```

#### Deep Link Error Handling Screenshots

<p align="center">
  <img src="./src/assets/screenshots/deepActive.png" width="24%" />
  <img src="./src/assets/screenshots/deepPro404.png" width="24%" />
  <img src="./src/assets/screenshots/deepCat404.png" width="24%" />
  <img src="./src/assets/screenshots/deep404.png" width="24%" />
</p>

---

## 7. Dynamic App Icon

The app's most advanced utility allows marketers to schedule promotional application icons (e.g., during sales events) from the user profile screen.

### Approach Used

- **iOS**: Uses the `react-native-dynamic-app-icon` package which maps to Apple's native `setAlternateIconName` API. The alternate icon bundle is declared directly in iOS asset catalogs and target configuration. Evaluated when the app launches or returns to the foreground (Apple strictly restricts changing alternate icons without active user session / confirmation popup).
- **Android**: Custom native Kotlin architecture consisting of:
  - [AppIconHelper.kt](./android/app/src/main/java/com/ecommerce/AppIconHelper.kt) — Centralized icon switcher that applies atomic component state changes on Android 13+ (API 33+) via `PackageManager.setComponentEnabledSettings()`.
  - [AppIconAlarmScheduler.kt](./android/app/src/main/java/com/ecommerce/AppIconAlarmScheduler.kt) — Schedules exact alarms via Android's `AlarmManager` (`setExactAndAllowWhileIdle`) and mirrors schedules in native `SharedPreferences`.
  - [AppIconAlarmReceiver.kt](./android/app/src/main/java/com/ecommerce/AppIconAlarmReceiver.kt) — `BroadcastReceiver` that Android wakes up at the exact scheduled second, even when the app is completely closed or killed, switching the launcher alias in native code without waking the React Native JS runtime.
  - [BootReceiver.kt](./android/app/src/main/java/com/ecommerce/BootReceiver.kt) — Automatically restores pending exact alarms and verifies the active icon following a device reboot or application update.
  - [DynamicAppIconModule.kt](./android/app/src/main/java/com/ecommerce/DynamicAppIconModule.kt) — React Native bridge exposing `scheduleIconAlarms`, `cancelIconAlarms`, and `getIconName`.
  - Toggles between two `<activity-alias>` elements registered inside `AndroidManifest.xml`: `.MainActivityDefault` and `.MainActivityPromotional`.

### Background Switching (App Closed / Minimized)

- **Closed & Killed State Support**: Unlike pure JavaScript timers which die when the app process is terminated, Android's `AlarmManager` wakes up `AppIconAlarmReceiver` at the exact start and end timestamps.
- **Battery-Friendly**: Operates with zero persistent background services or battery-draining polling tasks. The receiver executes in under 5 milliseconds and releases execution immediately.
- **Reboot Resilience**: Alarms survive phone reboots via `BootReceiver` (`BOOT_COMPLETED`), which reads the persistent schedule from `SharedPreferences` and re-registers the exact alarms.

### Samsung One UI Duplicate Icon Mitigation

- **The Problem**: On Samsung devices (One UI Home launcher), when one activity-alias is enabled while another remains enabled even briefly, the launcher indexes both as distinct entry points, placing a duplicate/clone icon on the home screen.
- **The Solution**:
  - **Android 13+ (API 33+)**: We use Android's atomic `PackageManager.setComponentEnabledSettings(listOf(disableSetting, enableSetting))` in [AppIconHelper.kt](./android/app/src/main/java/com/ecommerce/AppIconHelper.kt). The old alias is disabled and the new alias is enabled in a single system transaction. Samsung's launcher receives only one package update event and never sees two enabled launcher icons simultaneously.
  - **Legacy Android (< 33)**: Disables the old alias first before enabling the new alias with `PackageManager.DONT_KILL_APP`.
  - **Defensive Sweeper**: The `cleanGhostAliases` routine checks if multiple aliases ever get marked active concurrently and aggressively forces the inactive alias to `COMPONENT_ENABLED_STATE_DISABLED`.

### MMKV & Native SharedPreferences Persistence

- The scheduled `startDate` and `endDate` boundaries are persisted as ISO-8601 strings in MMKV on the JavaScript side and mirrored in native `SharedPreferences` on Android.
- When the JS bundle loads or when the app returns to the foreground (`AppState === 'active'`), `useDynamicAppIcon` verifies synchronization between MMKV, the active OS alias, and background alarms.

### Platform-Specific Limitations & Mitigations

> [!IMPORTANT]
> **iOS System Dialog & Background Policy**:
> Apple's iOS strictly triggers a mandatory system dialog ("_You have changed the icon for..._") whenever the alternate icon changes, and does not support headless background icon switching without user interaction.
> _Mitigation_: On iOS, the manager uses the Launch & Foreground evaluation pattern and verifies `syncCurrentIconFromNative` to ensure the dialog only displays if there is a genuine state mismatch.

> [!NOTE]
> **Android Exact Alarm Permission**:
> On Android 12+ (API 31+), `SCHEDULE_EXACT_ALARM` permission is declared in `AndroidManifest.xml` to allow `AlarmManager.setExactAndAllowWhileIdle()` to trigger exact-second icon transitions.

### How to Test Dynamic App Icons

1. Navigate to the **Profile** screen.
2. Under the **Dynamic App Icon** section, tap the **"Test 1-Minute Promo (Starts Now)"** button (or pick custom dates via the date picker and tap **Save Schedule**).
   - This sets a promotional window starting immediately and expiring in 1 minute.
   - On Android, native exact alarms are scheduled via `AlarmManager`.
   - _iOS_: Accept the system popup.
3. **Test with App Closed (Android)**:
   - Go to your home screen.
   - Open **Recent Apps** and **swipe away / kill the app completely**.
   - Notice the icon is now the **Promotional** icon.
   - Wait **1 minute** on the home screen without opening the app.
   - Watch the home screen or app drawer: the icon will switch back to the **Default** icon automatically in the background.
4. **Samsung Duplicate Test**:
   - Switch back and forth between Default and Promotional icons.
   - Verify that Samsung One UI updates the existing icon tile in place without creating a duplicate/clone icon.

#### iOS Icon Change Screenshots

<p align="center">
  <img src="./src/assets/screenshots/ios/default.png" width="30%" />
  <img src="./src/assets/screenshots/ios/changing.png" width="30%" />
  <img src="./src/assets/screenshots/ios/promotional.png" width="30%" />
</p>

#### Android Icon Change Screenshots

<p align="center">
  <img src="./src/assets/screenshots/android/default.jpeg" width="40%" />
  <img src="./src/assets/screenshots/android/promotional.jpeg" width="40%" />
</p>

---

## 8. Edge Cases Handled

- **Invalid Date Configs**:
  - The UI prevents saving if the user sets `StartDate > EndDate`, displaying an error toast and preventing MMKV persistence.
  - The parser guards against invalid or corrupted dates (`isNaN` boundaries) and safely falls back to the default icon state.
- **Offline / Flaky Network**:
  - Real-time connection updates dynamically display a blocking screen overlay.
  - The retry button implements a loading indicator and visual toast feedback once connectivity resumes.
- **Device Restart & Cold Starts**:
  - `BootReceiver` catches `ACTION_BOOT_COMPLETED` and `ACTION_MY_PACKAGE_REPLACED` to immediately re-register `AlarmManager` alarms and reconcile the icon state even if the phone was powered off when the schedule expired.
- **Timezone Safety**:
  - All date schedules are stored as ISO-8601 UTC string formats (`toISOString()`). 
  - Comparisons and alarms utilize raw UTC epoch milliseconds (`Date.parse()`, `System.currentTimeMillis()`, and `AlarmManager.RTC_WAKEUP`), ensuring icon switches occur at the exact same physical moment worldwide regardless of device timezone changes.
  - Display formatting (`formatDisplayDate`) converts UTC timestamps to the user's current local device time for intuitive UI feedback.

---

## 9. Known Limitations

- **Custom Android Launchers Icon Cache & Latency (10–15s Delay)**:
  - When `PackageManager.setComponentEnabledSettings` or `AlarmManager` toggles the active `<activity-alias>` in native code, the Android operating system component state updates immediately. However, custom OEM home launchers (such as Samsung One UI, Xiaomi MIUI/HyperOS, Oppo ColorOS, Pixel Launcher, etc.) maintain an internal SQLite image bitmap cache for home screen shortcuts.
  - Depending on system load, launcher indexing background threads, or OS power-saving modes, the home launcher UI may take **10 to 15 seconds** (or until the home screen is swiped/refreshed) to read the new icon image resource from the APK and re-render it on the home screen.
  - _Native Optimization_: We utilize `AlarmManager.setAlarmClock()` to bypass Android Doze mode throttling for exact-second native execution, and run a 1-second JS boundary evaluation hook in `useDynamicAppIcon` for instant in-app state updates.
- **iOS Dialog Customization**:
  - iOS alternate icon confirmations are managed by Apple's core system UI. It is impossible to customize, style, or hide this confirmation popup.
