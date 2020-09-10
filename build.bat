echo off
title Android Release Build

echo Removing previous unsigned build...
del "app-release-unsigned.apk"

echo Removing previous signed build...
del "app-release-signed.apk"

call ionic build android --release

echo Copying the latest unsigned build...
copy "%~dp0platforms\android\build\outputs\apk\release\app-release-unsigned.apk" "%~dp0"

echo Jar Signing the apk...
call jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore radio-talky.keystore app-release-unsigned.apk alias_name

echo Zip aligning the apk...
call zipalign -v 4 app-release-unsigned.apk app-release.apk