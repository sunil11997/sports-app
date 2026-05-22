
import 'package:cloud_firestore/cloud_firestore.dart';

/// Supported genders for biological maturity calculations.
enum Gender {
  male,
  female;

  String toJson() => name;
  static Gender fromJson(String value) => values.byName(value.toLowerCase());
}

/// A production-ready model for calculating and storing Peak Height Velocity (PHV)
/// data for youth athletes based on the Mirwald formula.
class PHVAthleteModel {
  final String id;
  final Gender gender;
  final double chronologicalAge;
  final double standingHeightCm;
  final double sittingHeightCm;
  final double weightKg;
  final DateTime? measuredAt;

  PHVAthleteModel({
    required this.id,
    required this.gender,
    required this.chronologicalAge,
    required this.standingHeightCm,
    required this.sittingHeightCm,
    required this.weightKg,
    this.measuredAt,
  });

  /// Derived property: Leg Length (Standing Height - Sitting Height).
  double get legLengthCm => standingHeightCm - sittingHeightCm;

  /// Validates the physiological plausibility of the inputs.
  /// 
  /// Checks for positive values and ensures sitting height is logically 
  /// proportional to standing height.
  bool validate() {
    if (chronologicalAge < 5 || chronologicalAge > 22) return false;
    if (standingHeightCm <= 50 || standingHeightCm > 250) return false;
    if (sittingHeightCm <= 30 || sittingHeightCm >= standingHeightCm) return false;
    if (weightKg <= 10 || weightKg > 200) return false;
    return true;
  }

  /// Calculates the Maturity Offset (Years from Peak Height Velocity) 
  /// utilizing the standard Mirwald predictive equations.
  /// 
  /// Returns a double representing the years from/to PHV.
  /// (Positive = Post-PHV, Negative = Pre-PHV)
  double calculatePHVMaturityOffset() {
    if (gender == Gender.male) {
      // Mirwald formula for Boys:
      // -9.236 + 0.0002708 * (LegL * SitH) - 0.001663 * (Age * LegL) + 0.007216 * (Age * SitH) + 0.02292 * (Weight / Height * 100)
      return -9.236 +
          (0.0002708 * (legLengthCm * sittingHeightCm)) +
          (-0.001663 * (chronologicalAge * legLengthCm)) +
          (0.007216 * (chronologicalAge * sittingHeightCm)) +
          (0.02292 * (weightKg / standingHeightCm * 100));
    } else {
      // Mirwald formula for Girls:
      // -9.376 + 0.0001882 * (LegL * SitH) + 0.0022 * (Age * LegL) + 0.005841 * (Age * SitH) - 0.002658 * (Age * Weight) + 0.07693 * (Weight / Height * 100)
      return -9.376 +
          (0.0001882 * (legLengthCm * sittingHeightCm)) +
          (0.0022 * (chronologicalAge * legLengthCm)) +
          (0.005841 * (chronologicalAge * sittingHeightCm)) +
          (-0.002658 * (chronologicalAge * weightKg)) +
          (0.07693 * (weightKg / standingHeightCm * 100));
    }
  }

  /// Converts the model into a Map for Firebase Firestore storage.
  /// 
  /// Automatically includes the calculated maturity offset and handles 
  /// server timestamps for auditing.
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'gender': gender.toJson(),
      'chronologicalAge': chronologicalAge,
      'standingHeightCm': standingHeightCm,
      'sittingHeightCm': sittingHeightCm,
      'legLengthCm': legLengthCm,
      'weightKg': weightKg,
      'maturityOffset': calculatePHVMaturityOffset(),
      'measuredAt': measuredAt != null ? Timestamp.fromDate(measuredAt!) : FieldValue.serverTimestamp(),
    };
  }

  /// Factory constructor to create a PHVAthleteModel from a Firestore document map.
  /// 
  /// Safely handles null values and type casting from dynamic maps.
  factory PHVAthleteModel.fromMap(Map<String, dynamic> map, String documentId) {
    return PHVAthleteModel(
      id: documentId,
      gender: Gender.fromJson(map['gender'] ?? 'male'),
      chronologicalAge: (map['chronologicalAge'] as num?)?.toDouble() ?? 0.0,
      standingHeightCm: (map['standingHeightCm'] as num?)?.toDouble() ?? 0.0,
      sittingHeightCm: (map['sittingHeightCm'] as num?)?.toDouble() ?? 0.0,
      weightKg: (map['weightKg'] as num?)?.toDouble() ?? 0.0,
      measuredAt: (map['measuredAt'] as Timestamp?)?.toDate(),
    );
  }
}
