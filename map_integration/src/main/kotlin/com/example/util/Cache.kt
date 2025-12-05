package com.example.util

/**
 * Small simple LRU cache implementation backed by LinkedHashMap.
 * Not thread-safe by itself; if you use in concurrent code, wrap access with a mutex.
 *
 * Usage:
 *   val cache = LRUCache<String, Value>(maxEntries = 100)
 *   cache["key"] = value
 *   val v = cache["key"]
 */
class LRUCache<K, V>(private val maxEntries: Int = 100) : MutableMap<K, V> {

    private val map: LinkedHashMap<K, V> = object : LinkedHashMap<K, V>(16, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<K, V>?): Boolean {
            return size > maxEntries
        }
    }

    override val entries: MutableSet<MutableMap.MutableEntry<K, V>>
        get() = map.entries
    override val keys: MutableSet<K>
        get() = map.keys
    override val values: MutableCollection<V>
        get() = map.values
    override val size: Int
        get() = map.size
    override fun clear() = map.clear()
    override fun isEmpty(): Boolean = map.isEmpty()
    override fun remove(key: K): V? = map.remove(key)
    override fun putAll(from: Map<out K, V>) = map.putAll(from)
    override fun put(key: K, value: V): V? = map.put(key, value)
    override fun containsKey(key: K): Boolean = map.containsKey(key)
    override fun containsValue(value: V): Boolean = map.containsValue(value)
    override fun get(key: K): V? = map[key]
    override fun getOrDefault(key: K, defaultValue: V): V = map.getOrDefault(key, defaultValue)
    override fun equals(other: Any?): Boolean = map == other
    override fun hashCode(): Int = map.hashCode()
}
