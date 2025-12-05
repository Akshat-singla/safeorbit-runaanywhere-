package com.example

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.serialization.json.*
import kotlinx.coroutines.*
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

// Simple in-memory cache entry
data class CacheEntry(val ts: Long, val body: JsonElement)

fun main() {
    embeddedServer(Netty, port = 8080) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    // install JSON content negotiation so call.respond(...) serializes to application/json
    install(ContentNegotiation) {
        json(Json { prettyPrint = false; ignoreUnknownKeys = true })
    }

    val client = HttpClient(CIO)
    // Very simple in-memory cache: key -> CacheEntry
    val cache = ConcurrentHashMap<String, CacheEntry>()
    val CACHE_TTL_MS = 30_000L // 30s for dev; increase in production

    routing {
        // quick health/root route for testing
        get("/") {
            call.respondText("Ktor up. Use /api/nearby?lat=...&lng=...", ContentType.Text.Plain)
        }

        get("/api/nearby") {
            val lat = call.request.queryParameters["lat"] ?: return@get call.respond(HttpStatusCode.BadRequest, "missing lat")
            val lng = call.request.queryParameters["lng"] ?: return@get call.respond(HttpStatusCode.BadRequest, "missing lng")
            val radius = call.request.queryParameters["radius"] ?: "3000"
            val typesParam = call.request.queryParameters["types"] ?: "hospital,clinic,police,fire_station,pharmacy"

            val cacheKey = "nearby:$lat,$lng,$radius,$typesParam"
            val now = Instant.now().toEpochMilli()
            // Serve from cache if fresh
            cache[cacheKey]?.let { entry ->
                if (now - entry.ts <= CACHE_TTL_MS) {
                    return@get call.respond(entry.body)
                }
            }

            // Build Overpass QL query
            // typesParam is comma separated
            val types = typesParam.split(",").map { it.trim() }.filter { it.isNotEmpty() }
            val aroundClause = types.joinToString("\n") { type ->
                // query nodes, ways, relations for the tag key=amenity value=type
                """node["amenity"="$type"](around:$radius,$lat,$lng);
                   way["amenity"="$type"](around:$radius,$lat,$lng);
                   relation["amenity"="$type"](around:$radius,$lat,$lng);"""
            }

            val overpassQuery = """
                [out:json][timeout:25];
                (
                  $aroundClause
                );
                out center;
            """.trimIndent()

            try {
                // POST the query to Overpass
                val overpassResponse: HttpResponse = client.post("https://overpass-api.de/api/interpreter") {
                    contentType(ContentType.Application.FormUrlEncoded)
                    setBody(listOf("data" to overpassQuery).formUrlEncode())
                }

                val bodyText = overpassResponse.bodyAsText()
                val parsed = Json.parseToJsonElement(bodyText)

                // Normalize Overpass response -> unified JSON
                val root = JsonObject(mapOf(
                    "results" to JsonArray(buildList {
                        val elements = parsed.jsonObject["elements"]?.jsonArray ?: JsonArray(emptyList())
                        for (el in elements) {
                            try {
                                val obj = el.jsonObject
                                val tags = obj["tags"]?.jsonObject
                                // skip if no lat/lon available
                                val latVal = when {
                                    obj["lat"] != null -> obj["lat"]!!.jsonPrimitive.double
                                    obj["center"] != null -> obj["center"]!!.jsonObject["lat"]!!.jsonPrimitive.double
                                    else -> null
                                }
                                val lonVal = when {
                                    obj["lon"] != null -> obj["lon"]!!.jsonPrimitive.double
                                    obj["center"] != null -> obj["center"]!!.jsonObject["lon"]!!.jsonPrimitive.double
                                    else -> null
                                }
                                if (latVal == null || lonVal == null) continue

                                val type = tags?.get("amenity")?.jsonPrimitive?.contentOrNull
                                val name = tags?.get("name")?.jsonPrimitive?.contentOrNull ?: type ?: "unknown"
                                val id = obj["id"]?.jsonPrimitive?.contentOrNull ?: ""

                                val address = buildString {
                                    tags?.get("addr:street")?.jsonPrimitive?.contentOrNull?.let { append(it) }
                                    tags?.get("addr:housenumber")?.jsonPrimitive?.contentOrNull?.let { append(" #$it") }
                                    tags?.get("addr:city")?.jsonPrimitive?.contentOrNull?.let { append(", $it") }
                                }.ifEmpty { tags?.get("operator")?.jsonPrimitive?.contentOrNull ?: "" }

                                val phone = tags?.get("phone")?.jsonPrimitive?.contentOrNull ?: tags?.get("contact:phone")?.jsonPrimitive?.contentOrNull

                                add(JsonObject(mapOf(
                                    "id" to JsonPrimitive("${type ?: "poi"}:$id"),
                                    "name" to JsonPrimitive(name),
                                    "lat" to JsonPrimitive(latVal),
                                    "lng" to JsonPrimitive(lonVal),
                                    "address" to JsonPrimitive(address),
                                    "phone" to JsonPrimitive(phone ?: ""),
                                    "type" to JsonPrimitive(type ?: ""),
                                    "raw_tags" to (tags ?: JsonObject(emptyMap()))
                                )))
                            } catch (ex: Exception) {
                                // skip single element but continue processing others
                                ex.printStackTrace()
                            }
                        }
                    })
                ))

                // set cache
                cache[cacheKey] = CacheEntry(now, root)
                call.respond(root)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "overpass request failed: ${e.message}"))
            }
        }
    }
}
