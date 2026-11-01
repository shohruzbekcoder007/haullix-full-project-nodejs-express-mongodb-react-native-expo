@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0haullix-mobile-expo"

rem --- Android SDK va Java (Android Studio ichidagi JBR) ---
if exist "%LOCALAPPDATA%\Android\Sdk" (set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk") else (set "ANDROID_HOME=C:\Android\Sdk")
if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
echo ANDROID_HOME=%ANDROID_HOME%
echo JAVA_HOME=%JAVA_HOME%
java -version || goto nojava

set CI=1
set EXPO_NO_GIT_STATUS=1

echo.
echo ===== 1/3  Android loyihasini app.json asosida qayta yaratish =====
if not exist node_modules call npm install
call npx expo prebuild -p android --clean
if errorlevel 1 goto fail
> android\local.properties echo sdk.dir=%ANDROID_HOME:\=\\%

echo.
echo ===== 2/3  APK yig'ilmoqda (birinchi marta 10-20 daqiqa olishi mumkin) =====
cd android
call gradlew.bat assembleRelease
if errorlevel 1 goto fail
cd ..

echo.
echo ===== 3/3  Tayyor =====
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "%~dp0haullix-release.apk" >nul
echo APK: %~dp0haullix-release.apk
explorer /select,"%~dp0haullix-release.apk"
pause
exit /b 0

:nojava
echo [XATO] Java topilmadi. Android Studio o'rnatilganini tekshiring.
pause
exit /b 1

:fail
echo [XATO] Yig'ishda xatolik. Yuqoridagi xabarni tekshiring.
pause
exit /b 1
