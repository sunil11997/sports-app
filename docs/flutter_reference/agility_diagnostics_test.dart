import 'package:test/test.dart';
import 'agility_diagnostics.dart';

void main() {
  final diagnostics = AgilityDiagnostics();

  group('AgilityDiagnostics - Sports Science Logic Tests', () {
    test('calculateLinearVelocity should return correct m/s for 30m sprint', () {
      // 30 meters / 4.0 seconds = 7.5 m/s
      expect(diagnostics.calculateLinearVelocity(4.0), equals(7.5));
    });

    test('calculateCODDeficit should accurately calculate time cost of turning', () {
      // 4.5s Pro-Agility - 4.0s 30m Sprint = 0.5s deficit
      expect(diagnostics.calculateCODDeficit(4.5, 4.0), closeTo(0.5, 0.001));
    });

    test('classifyBottleneck should identify technical deficiency (High Deficit)', () {
      // Profile: Fast runner (4.0s), Poor turner (4.5s) -> Deficit 0.5s
      final diagnosis = diagnostics.classifyBottleneck(
        proAgilityTime: 4.5,
        sprint30mTime: 4.0,
      );
      expect(diagnosis, equals('Needs Biomechanical Deceleration & Footwork Training'));
    });

    test('classifyBottleneck should identify power deficiency (Slow Speed)', () {
      // Profile: Efficient turner (0.15s deficit), but slow raw speed (4.5s sprint)
      // 30 / 4.5 = 6.66 m/s (< 7.0 threshold)
      final diagnosis = diagnostics.classifyBottleneck(
        proAgilityTime: 4.65,
        sprint30mTime: 4.5,
      );
      expect(diagnosis, equals('Needs Linear Acceleration & Maximum Strength Training'));
    });

    test('classifyBottleneck should confirm balanced athletic profile', () {
      // Profile: Elite speed (3.9s), Elite turn (4.1s) -> Deficit 0.2s
      final diagnosis = diagnostics.classifyBottleneck(
        proAgilityTime: 4.1,
        sprint30mTime: 3.9,
      );
      expect(diagnosis, equals('Performance is Balanced. Maintain Current Periodization.'));
    });

    test('calculateLinearVelocity should handle zero time gracefully', () {
      expect(diagnostics.calculateLinearVelocity(0.0), equals(0.0));
    });
  });
}
