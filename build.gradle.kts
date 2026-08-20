import com.lagradost.cloudstream3.gradle.CloudstreamExtension

buildscript {
    repositories {
        google()
        mavenCentral()
        maven("https://jitpack.io")
    }
    dependencies {
        classpath("com.android.tools.build:gradle:9.1.1")
        classpath("com.github.recloudstream:gradle:32895ae")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.4.0")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven("https://jitpack.io")
    }
}

fun Project.cloudstream(configuration: CloudstreamExtension.() -> Unit) =
    extensions.getByName<CloudstreamExtension>("cloudstream").configuration()

subprojects {
    apply(plugin = "com.android.library")
    apply(plugin = "com.lagradost.cloudstream3.gradle")

    cloudstream {
        setRepo(System.getenv("GITHUB_REPOSITORY") ?: "local/HHKUNGFU-CloudStream")
    }

    extensions.configure<com.android.build.gradle.LibraryExtension> {
        namespace = "com.volong.hhkungfu"
        compileSdk = 35
        defaultConfig {
            minSdk = 21
            targetSdk = 35
        }
        compileOptions {
            sourceCompatibility = JavaVersion.VERSION_17
            targetCompatibility = JavaVersion.VERSION_17
        }
    }

    dependencies {
        add("cloudstream", "com.lagradost:cloudstream3:pre-release")
        add("implementation", "org.jetbrains.kotlin:kotlin-stdlib:2.4.0")
        add("implementation", "com.fasterxml.jackson.module:jackson-module-kotlin:2.13.1")
        add("implementation", "org.jsoup:jsoup:1.13.1")
        add("implementation", "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4")
        add("implementation", "org.mozilla:rhino:1.7.14")
    }
}

tasks.register<Delete>("clean") {
    delete(layout.buildDirectory)
}
