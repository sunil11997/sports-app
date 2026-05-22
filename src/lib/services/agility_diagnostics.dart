
/**
 * @fileOverview AgilityDiagnostics Service
 * 
 * Provides technical analysis of athlete agility metrics, 
 * specifically focusing on the relationship between linear speed 
 * and change-of-direction (COD) efficiency.
 */

class AgilityDiagnostics {
  static const double sprintDistanceMeters = 30.0;
  
  /// Threshold for high COD deficit (seconds)
  /// Athletes above this typically lack deceleration technique.
  static const double highDeficitThreshold = 0.25;
  
  /// Threshold for slow linear 30m sprint (seconds) 
  /// for youth/amateur athletes.
  static const double slowLinearThreshold = 4.5;

  /// Calculates linear velocity in meters per second (m/s).
  double calculateLinearVelocity(double sprint30mTime) {
    if (sprint30mTime <= 0) return 0.0;
    return sprintDistanceMeters / sprint30mTime;
  }

  /// Calculates Change of Direction Deficit.
  /// Formula: COD Test Time - Linear Sprint Time.
  double calculateCODDeficit({
    required double proAgilityTime,
    required double sprint30mTime,
  }) {
    return proAgilityTime - sprint30mTime;
  }

  /// Classifies the athlete's specific performance bottleneck.
  String classifyPerformanceBottleneck({
    required double proAgilityTime,
    required double sprint30mTime,
  }) {
    final double deficit = calculateCODDeficit(
      proAgilityTime: proAgilityTime,
      sprint30mTime: sprint30mTime,
    );

    if (deficit > highDeficitThreshold) {
      return 'Needs Biomechanical Deceleration & Footwork Training';
    }

    if (deficit <= highDeficitThreshold && sprint30mTime > slowLinearThreshold) {
      return 'Needs Linear Acceleration & Maximum Strength Training';
    }

    return 'Balanced Performance - Maintain Technical Integrity';
  }
}
