# Keep Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.chatter3.app.** { *; }

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Google Auth (reflection-based)
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }

# WebRTC
-keep class org.webrtc.** { *; }

# Capacitor Cordova
-keep class org.apache.cordova.** { *; }

# HMS (if added later)
-keep class com.huawei.hms.** { *; }
-keep class com.huawei.agconnect.** { *; }
