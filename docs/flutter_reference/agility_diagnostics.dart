/**
 * AgilityDiagnostics Service
 * 
 * A specialized sports science service for analyzing linear velocity 
 * and Change of Direction (COD) efficiency in youth athletes.
 */
class AgilityDiagnostics {
  // Standard distance used for youth athletic testing in the Waghamba Registry.
  static const double sprintDistanceMeters = 30.0;
  
  // Scientific threshold for COD deficit (seconds). 
  // Values > 0.25s typically indicate poor turning mechanics relative to raw speed.
  static const double codDeficitThreshold = 0.25;

  // Velocity threshold (m/s). 
  // For U17 athletes, < 7.0 m/s (approx > 4.28s for 30m) indicates a need for power work.
  static const double velocityThreshold = 7.0;

  /// Calculates the linear velocity in meters per second (m/s).
  /// Formula: Distance (30m) / Time
  double calculateLinearVelocity(double sprint30mTime) {
    if (sprint30mTime <= 0) return 0.0;
    return sprintDistanceMeters / sprint30mTime;
  }

  /// Calculates the Change of Direction Deficit.
  /// This metric isolates the athlete's ability to change direction by 
  /// subtracting linear speed from shuttle/agility test time.
  double calculateCODDeficit(double proAgilityTime, double sprint30mTime) {
    return proAgilityTime - sprint30mTime;
  }

  /// Automatically classifies the athlete's primary training bottleneck.
  /// 
  /// Returns:
  /// - 'Needs Biomechanical Deceleration & Footwork Training' if the turn is inefficient.
  /// - 'Needs Linear Acceleration & Maximum Strength Training' if the raw speed is slow.
  /// - 'Performance is Balanced. Maintain Current Periodization.' if both are optimal.
  String classifyBottleneck({
    required double proAgilityTime,
    required double sprint30mTime,
  }) {
    final deficit = calculateCODDeficit(proAgilityTime, sprint30mTime);
    final velocity = calculateLinearVelocity(sprint30mTime);

    // Prioritize biomechanical turn deficiency
    if (deficit > codDeficitThreshold) {
      return 'Needs Biomechanical Deceleration & Footwork Training';
    }

    // Identify raw power/acceleration deficiency
    if (velocity < velocityThreshold) {
      return 'Needs Linear Acceleration & Maximum Strength Training';
    }

    return 'Performance is Balanced. Maintain Current Periodization.';
  }
}
