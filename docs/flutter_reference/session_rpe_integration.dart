
import 'package:flutter/material.dart';

/// SAMPLE: Athlete Dashboard Integration for Waghamba Sports Hub
/// This file demonstrates how to embed the 'SessionRpeSlider' widget
/// underneath an attendance list or inside an ExpansionTile.

class AthleteDashboardScreen extends StatelessWidget {
  final String studentId;
  final String studentName;

  const AthleteDashboardScreen({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Athlete: $studentName'),
        backgroundColor: const Color(0xFF1E3A8A), // Institutional Blue
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Daily Attendance Summary Card
            _buildAttendanceStatusCard(),

            const SizedBox(height: 24),

            // 2. Integration: ExpansionTile for Fatigue Report
            // This fulfills the requirement for a clean, non-obtrusive fatigue report entry.
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              clipBehavior: Clip.antiAlias,
              child: ExpansionTile(
                leading: const Icon(Icons.bolt, color: Colors.amber),
                title: const Text(
                  'End-of-Session Fatigue Report',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
                subtitle: const Text(
                  'Log internal training load for today',
                  style: TextStyle(fontSize: 10, color: Colors.grey),
                ),
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    child: SessionRpeSlider(
                      studentId: studentId,
                      onSubmitted: (loadScore) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Load archived: $loadScore')),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Alternative: Direct placement underneath daily list
            const Padding(
              padding: EdgeInsets.only(left: 8, bottom: 8),
              child: Text(
                'QUICK EXERTION LOG',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.blueGrey,
                  letterSpacing: 2,
                ),
              ),
            ),
            SessionRpeSlider(studentId: studentId),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceStatusCard() {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.check_circle_outline)),
        title: const Text('Attendance Recorded'),
        subtitle: Text('Session: Morning (P) • ${DateTime.now().day}/${DateTime.now().month}'),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}

/// Placeholder for the SessionRpeSlider Widget logic
class SessionRpeSlider extends StatefulWidget {
  final String studentId;
  final Function(int)? onSubmitted;

  const SessionRpeSlider({
    super.key,
    required this.studentId,
    this.onSubmitted,
  });

  @override
  State<SessionRpeSlider> createState() => _SessionRpeSliderState();
}

class _SessionRpeSliderState extends State<SessionRpeSlider> {
  double _rpeValue = 5.0;
  final TextEditingController _durationController = TextEditingController(text: '60');

  @override
  Widget build(BuildContext context) {
    int duration = int.tryParse(_durationController.text) ?? 0;
    int trainingLoad = (_rpeValue * duration).round();

    return Column(
      children: [
        Text(
          'Borg CR-10: ${_rpeValue.toInt()}',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
        ),
        Slider(
          value: _rpeValue,
          min: 1,
          max: 10,
          divisions: 9,
          onChanged: (val) => setState(() => _rpeValue = val),
        ),
        TextField(
          controller: _durationController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Duration (Minutes)'),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.blue.withOpacity(0.1),
          child: Text('Calculated Load: $trainingLoad'),
        ),
        ElevatedButton(
          onPressed: () => widget.onSubmitted?.call(trainingLoad),
          child: const Text('SUBMIT LOAD'),
        ),
      ],
    );
  }
}
