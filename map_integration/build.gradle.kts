//plugins {
//    kotlin("jvm") version "2.2.10"
//}
//
//group = "org.example"
//version = "1.0-SNAPSHOT"
//
//repositories {
//    mavenCentral()
//}
//
//dependencies {
//    testImplementation(kotlin("test"))
//}
//
//tasks.test {
//    useJUnitPlatform()
//}
//kotlin {
//    jvmToolchain(24)
//}

//plugins {
//    kotlin("jvm") version "2.2.10"
//    application
//}
//
//repositories { mavenCentral() }
//
//dependencies {
//    implementation("io.ktor:ktor-server-netty:2.3.5")
//    implementation("io.ktor:ktor-server-core:2.3.5")
//    implementation("io.ktor:ktor-client-cio:2.3.5")
//    implementation("io.ktor:ktor-client-content-negotiation:2.3.5")
//    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
//    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
//    implementation("ch.qos.logback:logback-classic:1.4.8")
//    testImplementation(kotlin("test"))
//}
//application {
//    mainClass.set("com.example.ApplicationKt")
//}
//kotlin {
//    jvmToolchain(24)
//}

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "2.2.10"
    kotlin("plugin.serialization") version "2.2.10"
    application
}

group = "com.example"
version = "0.1.0"

repositories {
    mavenCentral()
}

val ktorVersion = "2.3.5"
val kotlinxSerializationVersion = "1.6.0"
val logbackVersion = "1.4.8"

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")

    // Content negotiation + kotlinx.json support for Ktor
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

    // Ktor client (CIO) and client-side negotiation
    implementation("io.ktor:ktor-client-core:$ktorVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")

    // kotlinx.serialization JSON
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$kotlinxSerializationVersion")

    // logging
    implementation("ch.qos.logback:logback-classic:$logbackVersion")

    testImplementation(kotlin("test"))
}

application {
    mainClass.set("com.example.ApplicationKt")
}

kotlin {
    // If you want Gradle to use your installed JDK 24 set 24, otherwise set 17 if you install JDK17.
    jvmToolchain(24)
}


