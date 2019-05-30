---
id: Introduction.Android
title: Detox for Android
---

## Breaking Changes :warning:

> If you are installing Detox for Android for the first time, you can skip right over to the setup section.

> Follow our [Migration Guide](Guide.Migration.md) for instructions on how to upgrade from older versions.

* **In version 11 we switched to using Android Espresso of Android's new [androidx.\*  support libraries](https://developer.android.com/jetpack/androidx/).** We did this in order to stay up to date with Google's latest features and bug fixes, in the hopes of using them to improve our own Android support (which gets better every day!).

* **In version 10, we've made [Kotlin](https://kotlinlang.org/) mandatory for integrating Detox into your Android project.** In the very least, you must include the Kotlin gradle plugin in your project, as we shall see later on. Nevertheless, this is a breaking change so bear that in mind when upgrading. In any case, worry not of the impact on your app, as - unless you effectively use Kotlin in your own native code, **there will be no impact on the final APK**, in terms of size and methods count.

* **As of version 7** we require Android gradle plugin 3.0.0 or newer. This is a breaking change that makes it impossible to support previous Android gradle plugin versions.

  https://developer.android.com/studio/build/gradle-plugin-3-0-0-migration.html

  For older Android gradle plugin support use `detox@6.x.x` instead ([previous setup guide here](https://github.com/wix/detox/blob/97654071573053def90e8207be8eba011408f977/docs/Introduction.Android.md)).<br>

  **Note: As a rule of thumb, we consider all old major versions discontinued; We only support the latest Detox major version.**



## Setup :gear:

### 1. Run through the initial _Getting Started_ Guide

- [Getting Started](Introduction.GettingStarted.md)



### 2. Add Detox dependency to an Android project

> **Starting Detox 12.5.0, Detox is shipped as a precompiled `.aar`.**
> To configure Detox as a _compiling dependency_, nevertheless -- refer to the _Setting Detox up as a compiling dependency_ section at the bottom.

In your *root* buildscript (i.e. `build.gradle`), register both `google()` _and_ detox as repository lookup points in all projects:

```groovy
// Note: add the 'allproject' section if it doesn't exist
allprojects {
    repositories {
        // ...
        google()
        maven {
            // All of Detox' artifacts are provided via the npm module
            url "$rootDir/../node_modules/detox/Detox-android"
        }
    }
}
```



In your app's buildscript (i.e. `app/build.gradle`) add this in `dependencies` section:

```groovy
dependencies {
	  // ...
    androidTestImplementation('com.wix:detox:+') { transitive = true } 
    androidTestImplementation 'junit:junit:4.12'
}
```



In your app's buildscript (i.e. `app/build.gradle`)  add this to the `defaultConfig` subsection:

```groovy
android {
  // ...
  
  defaultConfig {
      // ...
      testBuildType System.getProperty('testBuildType', 'debug')  // This will later be used to control the test apk build type
      testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
  }
}
```
Please be aware that the `minSdkVersion` needs to be at least 18.



### 3. Add Kotlin

If your project does not already support Kotlin, add the Kotlin Gradle-plugin to your classpath in the root build-script (i.e.`android/build.gradle`):

```groovy
buildscript {
    // ...
    ext.kotlinVersion = '1.3.0'

    dependencies: {
        // ...
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"
    }
}
```

_Note: most guides advise of defining a global `kotlinVersion` constant - as in this example, but that is not mandatory._

***Note that Detox has been tested for version 1.1.0 of Kotlin, and higher!***



### 4. Create Android Test class

Add the file `android/app/src/androidTest/java/com/[your.package]/DetoxTest.java` and fill as in [the detox example app for NR](../examples/demo-react-native/android/app/src/androidTest/java/com/example/DetoxTest.java). **Don't forget to change the package name to your project's**.



### 5. Add Android configuration

Add this part to your `package.json`:

```json
"detox" : {
    "configurations": {
        "android.emu.debug": {
            "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
            "build":
            "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..",
            "type": "android.emulator",
            "name": "Nexus_5X_API_24"
        },
        "android.emu.release": {
            "binaryPath": "android/app/build/outputs/apk/release/app-release.apk",
            "build":
            "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..",
            "type": "android.emulator",
            "name": "Nexus_5X_API_26"
        }
    }
}
```
Pay attention to `-DtestBuildType`, set either to `debug` or `release` according to the main apk type.


Following device types could be used to control Android devices:

`android.emulator`. Boot stock SDK emulator with provided `name`, for example `Nexus_5X_API_25`. After booting connect to it.

`android.attached`. Connect to already-attached android device. The device should be listed in the output of `adb devices` command under provided `name`.
Use this type to connect to Genymotion emulator.

### 6. Run the tests

Using the `android.emu.debug` configuration from above, you can invoke it in the standard way.

```sh
detox test -c android.emu.debug
```



## Proguard (Minification)

In apps running [minification using Proguard](https://developer.android.com/studio/build/shrink-code), in order for Detox to work well on release builds, please enable some Detox proguard-configuration rules by applying the custom configuration file on top of your own. Typically, this is defined using the `proguardFiles` statement in the minification-enabled build-type in your `app/build.gradle`:

```groovy
    buildTypes {
        // 'release' is typically the default proguard-enabled build-type
        release {
            minifyEnabled true

            // Typical pro-guard definitions
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            // Detox-specific additions to pro-guard
            proguardFile "${rootProject.projectDir}/../node_modules/detox/android/detox/proguard-rules-app.pro"
        }
    }

```



## Setting Detox up as a compiling dependency

This is an **alternative** to the setup process described under the previous section, on adding Detox as a dependency.



In your project's `settings.gradle` add:

```groovy
include ':detox'
project(':detox').projectDir = new File(rootProject.projectDir, '../node_modules/detox/android/detox')
```



In your *root* buildscript (i.e. `build.gradle`), register `google()` as a repository lookup point in all projects:

```groovy
// Note: add the 'allproject' section if it doesn't exist
allprojects {
    repositories {
        // ...
        google()
    }
}
```



In your app's buildscript (i.e. `app/build.gradle`) add this in `dependencies` section:

```groovy
dependencies {
  	// ...
    androidTestImplementation(project(path: ":detox"))
    androidTestImplementation 'junit:junit:4.12'
}
```



In your app's buildscript (i.e. `app/build.gradle`) add this to the `defaultConfig` subsection:

```groovy
android {
  // ...
  
  defaultConfig {
      // ...
      testBuildType System.getProperty('testBuildType', 'debug')  // This will later be used to control the test apk build type
      testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
  }
}
```

Please be aware that the `minSdkVersion` needs to be at least 18.



## Troubleshooting

### Problem: `Duplicate files copied in ...`

If you get an error like this:

```sh
Execution failed for task ':app:transformResourcesWithMergeJavaResForDebug'.
> com.android.build.api.transform.TransformException: com.android.builder.packaging.DuplicateFileException: Duplicate files copied in APK META-INF/LICENSE
```

You need to add this to the `android` section of your `android/app/build.gradle`:

```groovy
packagingOptions {
    exclude 'META-INF/LICENSE'
}
```



### Problem: Kotlin stdlib version conflicts

The problems and resolutions here are different if you're using Detox as a precompiled dependency artifact (i.e. an `.aar`) - which is the default, or compiling it yourself.

#### Resolving for a precompiled dependency (`.aar`)

Of all [Kotlin implementation flavours](https://kotlinlang.org/docs/reference/using-gradle.html#configuring-dependencies), Detox assumes the most recent one, namely `kotlin-stdlib-jdk8`. If your Android build fails due to conflicts with implementations coming from other dependencies or even your own app, consider adding an exclusion to either the "other" dependencies or detox itself, for example:

```diff
dependencies {
-    androidTestImplementation('com.wix:detox:+') { transitive = true } 
+    androidTestImplementation('com.wix:detox:+') { 
+        transitive = true
+        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
+    }
}
```

Detox should work with `kotlin-stdlib-jdk7`, as well.

#### Resolving for a compiling subproject

Detox requires the Kotlin standard-library as it's own dependency. Due to the [many flavours](https://kotlinlang.org/docs/reference/using-gradle.html#configuring-dependencies) by which Kotlin has been released, multiple dependencies often create a conflict.

For that, Detox allows for the exact specification of the standard library to use using two Gradle globals: `detoxKotlinVerion` and `detoxKotlinStdlib`. You can define both in your  root build-script file (i.e.`android/build.gradle`):

```groovy
buildscript {
    // ...
    ext.detoxKotlinVersion = '1.3.0' // Detox' default is 1.2.0
    ext.detoxKotlinStdlib = 'kotlin-stdlib-jdk7' // Detox' default is kotlin-stdlib-jdk8
}
```

