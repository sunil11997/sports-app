
import 'package:test/test.dart';
import 'agility_diagnostics.dart';

void main() {
  final diagnostics = AgilityDiagnostics();

  group('AgilityDiagnostics Tests', () {
    test('calculateLinearVelocity returns correct m/s', () {
      // 30m / 4s = 7.5 m/s
      expect(diagnostics.calculateLinearVelocity(4.0), equals(7.5));
    });

    test('calculateCODDeficit returns difference correctly', () {
      // 4.8s (Pro Agility) - 4.2s (30m) = 0.6s
      final deficit = diagnostics.calculateCODDeficit(
        proAgilityTime: 4.8,
        sprint30mTime: 4.2,
      );
      expect(deficit, closeTo(0.6, 0.001));
    });

    test('classifyPerformanceBottleneck identifies High COD Deficit', () {
      // High deficit (0.5s > 0.25s)
      final classification = diagnostics.classifyPerformanceBottleneck(
        proAgilityTime: 5.0,
        sprint30mTime: 4.5,
      );
      expect(classification, contains('Needs Biomechanical Deceleration'));
    });

    test('classifyPerformanceBottleneck identifies Linear Strength Need', () {
      // Deficit is low (0.1s < 0.25s) but sprint is slow (4.8s > 4.5s)
      final classification = diagnostics.classifyPerformanceBottleneck(
        proAgilityTime: 4.9,
        sprint30mTime: 4.8,
      );
      expect(classification, contains('Needs Linear Acceleration'));
    });

    test('classifyPerformanceBottleneck identifies Balanced Performance', () {
      // Elite linear (4.0s) and Elite technique (deficit 0.1s)
      final classification = diagnostics.classifyPerformanceBottleneck(
        proAgilityTime: 4.1,
        sprint30mTime: 4.0,
      );
      expect(classification, contains('Balanced Performance'));
    });
  });
}
