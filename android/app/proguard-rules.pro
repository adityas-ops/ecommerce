# Project specific ProGuard rules to prevent Release build (app-release.apk) crashes

# 1. React Native Screens & Navigation
-keep class com.swmansion.rnscreens.** { *; }
-keep interface com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.rnscreens.ScreenFragment { *; }
-keep class com.swmansion.rnscreens.ScreenStackFragment { *; }
-keep class com.swmansion.rnscreens.ScreenContainer { *; }

# 2. React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# 3. Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# 4. React Native MMKV & Nitro Modules (C++ / JNI)
-keep class com.mrousavy.mmkv.** { *; }
-keep class com.margelo.nitro.** { *; }

# 5. Core React Native / Folly / Fbjni / Hermes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }

# 6. Keep Dynamic App Icon Module & Receivers
-keep class com.ecommerce.DynamicAppIconModule { *; }
-keep class com.ecommerce.AppIconHelper { *; }
-keep class com.ecommerce.AppIconAlarmReceiver { *; }
-keep class com.ecommerce.AppIconAlarmScheduler { *; }
-keep class com.ecommerce.BootReceiver { *; }
-keep class com.ecommerce.MainActivity { *; }
-keep class com.ecommerce.MainActivityDefault { *; }
-keep class com.ecommerce.MainActivityPromotional { *; }
