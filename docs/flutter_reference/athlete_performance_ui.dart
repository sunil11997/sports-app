import 'package:flutter/material.dart';

/// AthletePerformanceAnalytics
/// A Senior-level Flutter layout for visualizing physical growth and 
/// biological maturity (PHV) using Material 3.
class AthletePerformanceAnalytics extends StatelessWidget {
  final double standingHeightCm;
  final double sittingHeightCm;
  final double weightKg;
  final double phvOffset; // Calculated via calculatePHVMaturityOffset()

  const AthletePerformanceAnalytics({
    super.key,
    required this.standingHeightCm,
    required this.sittingHeightCm,
    required this.weightKg,
    required this.phvOffset,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isNegative = phvOffset < 0;
    final statusColor = isNegative ? Colors.emerald : Colors.orange;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: const CrossAxisAlignment.start,
        children: [
          // Section Title
          Text(
            'HIGH-PERFORMANCE ANALYTICS',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: colorScheme.primary.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 16),

          // 1. Grid of Physical Metrics
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.5,
            children: [
              _buildStatCard(
                context,
                icon: Icons.height,
                label: 'STANDING HT',
                value: '$standingHeightCm cm',
              ),
              _buildStatCard(
                context,
                icon: Icons.chair_alt,
                label: 'SITTING HT',
                value: '$sittingHeightCm cm',
              ),
              _buildStatCard(
                context,
                icon: Icons.monitor_weight_outlined,
                label: 'BODY WEIGHT',
                value: '$weightKg kg',
              ),
              _buildStatCard(
                context,
                icon: Icons.straighten,
                label: 'LEG LENGTH',
                value: '${(standingHeightCm - sittingHeightCm).toStringAsFixed(1)} cm',
              ),
            ],
          ),
          const SizedBox(height: 24),

          // 2. Prominent PHV Offset Card
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.08),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: statusColor.withOpacity(0.2), width: 2),
            ),
            child: Stack(
              children: [
                // Background Icon Decoration
                Positioned(
                  right: -20,
                  bottom: -20,
                  child: Icon(
                    Icons.trending_up,
                    size: 140,
                    color: statusColor.withOpacity(0.1),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Column(
                    children: [
                      Text(
                        'PEAK HEIGHT VELOCITY (PHV)',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          color: statusColor.withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            phvOffset.toStringAsFixed(2),
                            style: TextStyle(
                              fontSize: 56,
                              fontWeight: FontWeight.w900,
                              color: statusColor.withOpacity(0.9),
                              letterSpacing: -2,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'YRS',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: statusColor.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      // 3. Conditional Growth Spurt Subtitle
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(100),
                          boxShadow: [
                            BoxShadow(
                              color: statusColor.withOpacity(0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            )
                          ],
                        ),
                        child: Text(
                          isNegative ? 'PRE-GROWTH SPURT' : 'POST-GROWTH SPURT',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Institutional Note
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.surfaceVariant.withOpacity(0.3),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: colorScheme.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Mirwald Maturity Offset prediction is utilized for institutional physiological planning.',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      fontStyle: FontStyle.italic,
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
  }) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: colorScheme.primary.withOpacity(0.4)),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.5,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
