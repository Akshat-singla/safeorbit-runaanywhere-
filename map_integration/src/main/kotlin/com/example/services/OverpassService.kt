package com.example.services

import com.example.model.Poi
import com.example.util.LRUCache
import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.*
import java.time.Instant

/**
 * OverpassService: builds Overpass QL query, posts it to Overpass API,
 * parses the JSON response and returns a list of unified Poi objects.
 *
 * This class implements a small in-memory cache to avoid hammering the public Overpass endpoint.
 */
class OverpassService(
    private val client: HttpClient,
    private val overpassEndpoint: String = "https://overpass-api.de/api/interpreter"
) {
    // Simple LRU cache keyed by query string, value = Pair(timestampMs, JsonElement or parsed list)
    private val cache = LRUCache<String, Pair<Long, List<Poi>>>(maxEntries = 200)
    private val cacheTtlMs: Long = 30_000L // 30 seconds default for dev; increase for prod
    private val mutex = Mutex()

    /**
     * Fetch nearby POIs of given amenity types around (lat,lng) within radius meters.
     * typesCsv example: "hospital,clinic,police"
     */
    suspend fun getNearby(lat: Double, lng: Double, radiusMeters: Int = 3000, typesCsv: String = "hospital,clinic,police,fire_station,pharmacy"): List<Poi> {
        val types = typesCsv.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val cacheKey = "nearby:$lat,$lng,$radiusMeters:${types.joinToString(",")}"

        // Check cache under mutex
        mutex.withLock {
            val now = Instant.now().toEpochMilli()
            cache[cacheKey]?.let { (ts, list) ->
                if (now - ts <= cacheTtlMs) {
                    return list
                } else {
                    // stale -> remove
                    cache.remove(cacheKey)
                }
            }
        }

        // Build Overpass QL
        val searchBlocks = types.joinToString("\n") { type ->
            """
            node["amenity"="$type"](around:$radiusMeters,$lat,$lng);
            way["amenity"="$type"](around:$radiusMeters,$lat,$lng);
            relation["amenity"="$type"](around:$radiusMeters,$lat,$lng);
            """.trimIndent()
        }

        val overpassQuery = """
            [out:json][timeout:25];
            (
              $searchBlocks
            );
            out center;
        """.trimIndent()

        // POST to Overpass
        val response: HttpResponse = client.post(overpassEndpoint) {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody(listOf("data" to overpassQuery).formUrlEncode())
        }

        val bodyText = response.bodyAsText()
        val parsed = Json.parseToJsonElement(bodyText)
        val elements = parsed.jsonObject["elements"]?.jsonArray ?: JsonArray(emptyList())

        val results = mutableListOf<Poi>()
        for (el in elements) {
            try {
                val obj = el.jsonObject
                val tags = obj["tags"]?.jsonObject
                val type = tags?.get("amenity")?.jsonPrimitive?.contentOrNull ?: tags?.get("shop")?.jsonPrimitive?.contentOrNull
                val name = tags?.get("name")?.jsonPrimitive?.contentOrNull ?: type ?: "unknown"
                val idRaw = obj["id"]?.jsonPrimitive?.contentOrNull ?: ""
                val id = if (type != null && idRaw.isNotEmpty()) "$type:$idRaw" else idRaw

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

                // build address from tags if present
                val addrParts = mutableListOf<String>()
                tags?.get("addr:street")?.jsonPrimitive?.contentOrNull?.let { addrParts.add(it) }
                tags?.get("addr:housenumber")?.jsonPrimitive?.contentOrNull?.let { addrParts.add("#$it") }
                tags?.get("addr:city")?.jsonPrimitive?.contentOrNull?.let { addrParts.add(it) }
                val address = if (addrParts.isNotEmpty()) addrParts.joinToString(", ") else tags?.get("operator")?.jsonPrimitive?.contentOrNull

                val phone = tags?.get("phone")?.jsonPrimitive?.contentOrNull ?: tags?.get("contact:phone")?.jsonPrimitive?.contentOrNull

                // capture raw tags as JsonObject if needed by client for debugging
                val rawTags = tags ?: JsonObject(emptyMap())

                val poi = Poi(
                    id = id,
                    name = name,
                    lat = latVal,
                    lng = lonVal,
                    address = address ?: "",
                    phone = phone ?: "",
                    type = type ?: "",
                    rawTags = rawTags
                )
                results.add(poi)
            } catch (e: Exception) {
                // skip element on parse error but continue
                e.printStackTrace()
            }
        }

        // store in cache
        mutex.withLock {
            cache[cacheKey] = Pair(Instant.now().toEpochMilli(), results)
        }

        return results
    }
}
