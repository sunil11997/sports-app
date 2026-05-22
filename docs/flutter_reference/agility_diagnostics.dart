/**
 * AgilityDiagnostics - Biomechanical Performance Analytics
 * 
 * Provides automated classification of speed and agility bottlenecks.
 */
class AgilityDiagnostics {
  
  /// Calculates linear velocity in meters per second (m/s)
  double calculateLinearVelocity(double raw30mTime) {
    if (raw30mTime <= 0) return 0.0;
    return 30.0 / raw30mTime;
  }

  /// Calculates the deficit between linear speed and turning efficiency
  double calculateCODDeficit(double proAgilityTime, double linear30mTime) {
    return proAgilityTime - linear30mTime;
  }

  /// Classifies the athlete's specific training requirement
  String classifyBottleneck({
    required double proAgilityTime,
    required double linear30mTime,
  }) {
    final deficit = calculateCODDeficit(proAgilityTime, linear30mTime);
    
    // High deficit (> 0.25s) indicates inefficient turning mechanics
    if (deficit > 0.25) {
      return 'Needs Biomechanical Deceleration & Footwork Training';
    }
    
    // Low deficit but slow times indicates a raw power/strength issue
    if (linear30mTime > 4.5) {
      return 'Needs Linear Acceleration & Maximum Strength Training';
    }

    return 'Optimal Balance: Focus on Sport-Specific Reactive Drills';
  }
}
