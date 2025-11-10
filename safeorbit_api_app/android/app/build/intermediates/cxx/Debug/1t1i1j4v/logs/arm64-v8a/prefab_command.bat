@echo off
"C:\\Program Files\\Java\\jdk-21\\bin\\java" ^
  --class-path ^
  "C:\\Users\\akinm\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\akinm\\AppData\\Local\\Temp\\agp-prefab-staging7859599447825735462\\staged-cli-output" ^
  "C:\\Users\\akinm\\Files\\Codes\\safeorbit\\expo\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-vision-camera\\t3fw3g4h" ^
  "C:\\Users\\akinm\\.gradle\\caches\\8.14.3\\transforms\\8bca444e06763d64457172ec6b80f8aa\\transformed\\react-android-0.81.5-debug\\prefab" ^
  "C:\\Users\\akinm\\Files\\Codes\\safeorbit\\expo\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-reanimated\\3v432s5z" ^
  "C:\\Users\\akinm\\Files\\Codes\\safeorbit\\expo\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-worklets\\4f541083" ^
  "C:\\Users\\akinm\\Files\\Codes\\safeorbit\\expo\\android\\app\\build\\intermediates\\cxx\\refs\\react-native-worklets-core\\2f6l5a4n" ^
  "C:\\Users\\akinm\\.gradle\\caches\\8.14.3\\transforms\\e5d19bd6b3826afe5eb577927188e196\\transformed\\hermes-android-0.81.5-debug\\prefab" ^
  "C:\\Users\\akinm\\.gradle\\caches\\8.14.3\\transforms\\e2ac816cc322e0622c8e36eeb217f096\\transformed\\fbjni-0.7.0\\prefab"
