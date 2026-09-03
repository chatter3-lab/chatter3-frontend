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

# Keep Google OAuth
-keep class com.google.android.gms.** { *; }
