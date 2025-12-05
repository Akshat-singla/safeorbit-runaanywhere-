package com.example.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

/**
 * Unified POI model returned to clients.
 * Keep fields simple so front-end can easily consume.
 */
@Serializable
data class Poi(
    val id: String,
    val name: String,
    val lat: Double,
    val lng: Double,
    val address: String = "",
    val phone: String = "",
    val type: String = "",
    // rawTags included for debugging or advanced front-end displays.
    // Serialization of JsonObject requires kotlinx.serialization.json.JsonObject
    val rawTags: JsonObject = JsonObject(emptyMap())
)
