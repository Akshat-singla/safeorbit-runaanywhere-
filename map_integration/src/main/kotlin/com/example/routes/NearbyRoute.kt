package com.example.routes

import com.example.model.Poi
import com.example.services.OverpassService
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Registers the /api/nearby route.
 *
 * Expected query params:
 *  - lat (required)
 *  - lng (required)
 *  - radius (optional, default 3000)
 *  - types (optional, comma separated list of amenity types)
 *
 * Example:
 *  GET /api/nearby?lat=28.7041&lng=77.1025&radius=3000&types=hospital,clinic
 */
fun Routing.registerNearbyRoutes() {
    // single shared HttpClient for requests
    val httpClient = HttpClient(CIO)
    val service = OverpassService(httpClient)

    get("/api/nearby") {
        val latParam = call.request.queryParameters["lat"]
        val lngParam = call.request.queryParameters["lng"]
        val radiusParam = call.request.queryParameters["radius"] ?: "3000"
        val typesParam = call.request.queryParameters["types"] ?: "hospital,clinic,police,fire_station,pharmacy"

        if (latParam == null || lngParam == null) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "missing lat or lng query parameter"))
            return@get
        }

        val lat = latParam.toDoubleOrNull()
        val lng = lngParam.toDoubleOrNull()
        if (lat == null || lng == null) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "lat or lng is not a valid number"))
            return@get
        }

        try {
            val poiList: List<Poi> = service.getNearby(lat, lng, radiusParam.toInt(), typesParam)
            // Build response: { "results": [ ... ] }
            val json = Json { prettyPrint = false }
            val payload = mapOf("results" to poiList)
            call.respondText(json.encodeToString(payload), ContentType.Application.Json)
        } catch (ex: Exception) {
            ex.printStackTrace()
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (ex.message ?: "unknown error")))
        }
    }
}
