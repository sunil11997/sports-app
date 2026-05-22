import 'package:cloud_firestore/cloud_firestore.dart';

/**
 * WGBFirestoreService - Senior Flutter Developer Reference
 * 
 * This class provides the institutional configuration for Firestore in the 
 * Waghamba Sports Hub native implementation. It handles robust disk persistence
 * and optimized cache fetching.
 */
class WGBFirestoreService {
  
  /// Initializes Firestore with optimized settings for offline athletes registry.
  /// Should be called from main.dart after Firebase.initializeApp().
  static Future<void> setupOfflineRegistry() async {
    try {
      // 1. Enable persistence and 2. Configure 100MB cache size
      // 100MB = 100 * 1024 * 1024 bytes
      FirebaseFirestore.instance.settings = const Settings(
        persistenceEnabled: true,
        cacheSizeBytes: 104857600, 
      );
      print("WGB: Firestore offline-first registry synchronized.");
    } catch (e) {
      // 3. Robust initialization error handling
      print("WGB: Firestore Config Error: $e");
    }
  }

  /// Sample query demonstrating the Cache-First -> Server Fallback pattern.
  /// Ensures Teacher Sunil can view squads even during signal dropouts.
  static Future<List<Map<String, dynamic>>> getActivePlayers() async {
    final collection = FirebaseFirestore.instance.collection('players');

    try {
      // 4. Attempt to fetch from local cache first
      final cacheSnapshot = await collection.get(const GetOptions(source: Source.cache));
      
      if (cacheSnapshot.docs.isNotEmpty) {
        print("WGB: Registry loaded from offline storage.");
        return cacheSnapshot.docs.map((d) => d.data()).toList();
      }
    } catch (e) {
      print("WGB: Offline registry empty, attempting cloud sync...");
    }

    // Standard fallback to server
    try {
      final serverSnapshot = await collection.get(const GetOptions(source: Source.server));
      print("WGB: Registry refreshed from Cloud Vault.");
      return serverSnapshot.docs.map((d) => d.data()).toList();
    } catch (e) {
      print("WGB: Critical Sync Error: $e");
      return [];
    }
  }
}
