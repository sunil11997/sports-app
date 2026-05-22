import 'package:cloud_firestore/cloud_firestore.dart';

enum Gender { male, female }

/**
 * PHVAthleteModel - Growth Maturity Tracking
 * 
 * Implements the Mirwald Equation for calculating Peak Height Velocity (PHV) offset.
 */
class PHVAthleteModel {
  final String id;
  final Gender gender;
  final double chronologicalAge;
  final double standingHeightCm;
  final double sittingHeightCm;
  final double weightKg;

  PHVAthleteModel({
    required this.id,
    required this.gender,
    required this.chronologicalAge,
    required this.standingHeightCm,
    required this.sittingHeightCm,
    required this.weightKg,
  });

  /// Derived property for leg length calculation
  double get legLengthCm => standingHeightCm - sittingHeightCm;

  /// Calculates years from Peak Height Velocity (PHV) using the Mirwald Formula.
  double calculatePHVMaturityOffset() {
    if (gender == Gender.male) {
      return -9.236 +
          (0.0002708 * (legLengthCm * sittingHeightCm)) +
          (-0.001663 * (chronologicalAge * legLengthCm)) +
          (0.007216 * (chronologicalAge * sittingHeightCm)) +
          (0.02292 * ((weightKg / standingHeightCm) * 100));
    } else {
      return -9.376 +
          (0.0001882 * (legLengthCm * sittingHeightCm)) +
          (0.0022 * (chronologicalAge * legLengthCm)) +
          (0.005841 * (chronologicalAge * sittingHeightCm)) +
          (-0.002658 * (chronologicalAge * weightKg)) +
          (0.07693 * ((weightKg / standingHeightCm) * 100));
    }
  }

  /// Validates physiological data points for safety
  bool validate() {
    if (sittingHeightCm >= standingHeightCm) return false;
    if (weightKg <= 0 || standingHeightCm <= 0) return false;
    return true;
  }

  /// Firestore Serialization
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'gender': gender.name,
      'age': chronologicalAge,
      'height': standingHeightCm,
      'sittingHeight': sittingHeightCm,
      'weight': weightKg,
      'phvOffset': calculatePHVMaturityOffset(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  factory PHVAthleteModel.fromMap(Map<String, dynamic> map, String docId) {
    return PHVAthleteModel(
      id: docId,
      gender: map['gender'] == 'female' ? Gender.female : Gender.male,
      chronologicalAge: (map['age'] as num?)?.toDouble() ?? 0.0,
      standingHeightCm: (map['height'] as num?)?.toDouble() ?? 0.0,
      sittingHeightCm: (map['sittingHeight'] as num?)?.toDouble() ?? 0.0,
      weightKg: (map['weight'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
