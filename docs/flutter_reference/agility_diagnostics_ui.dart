import 'package:flutter/material.dart';

/// Professional Material 3 Form UI for Agility Diagnostics.
/// Integrates with the AgilityDiagnostics service logic.
class AgilityDiagnosticsForm extends StatefulWidget {
  const AgilityDiagnosticsForm({super.key});

  @override
  State<AgilityDiagnosticsForm> createState() => _AgilityDiagnosticsFormState();
}

class _AgilityDiagnosticsFormState extends State<AgilityDiagnosticsForm> {
  final _formKey = GlobalKey<FormState>();
  final _sprintController = TextEditingController();
  final _shuttleController = TextEditingController();

  double? _codDeficit;
  String? _recommendation;

  void _calculateAnalytics() {
    if (_formKey.currentState!.validate()) {
      final double sprint = double.parse(_sprintController.text);
      final double shuttle = double.parse(_shuttleController.text);

      setState(() {
        // Calculation Logic based on AgilityDiagnostics Service
        _codDeficit = shuttle - sprint;
        
        if (_codDeficit! > 0.25) {
          _recommendation = 'Needs Biomechanical Deceleration & Footwork Training';
        } else if (sprint > 4.8) {
          _recommendation = 'Needs Linear Acceleration & Maximum Strength Training';
        } else {
          _recommendation = 'Elite Change-of-Direction Mechanics Detected';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agility Mastery Hub', style: TextStyle(fontWeight: FontWeight.w900)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'INSTITUTIONAL PERFORMANCE ENTRY',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 24),
              
              TextFormField(
                controller: _sprintController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Raw 30m Sprint Time (seconds)',
                  prefixIcon: Icon(Icons.timer_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _shuttleController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Pro-Agility Shuttle Test Time (seconds)',
                  prefixIcon: Icon(Icons.bolt_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 32),
              
              ElevatedButton.icon(
                onPressed: _calculateAnalytics,
                icon: const Icon(Icons.analytics_outlined),
                label: const Text('CALCULATE ANALYTICS'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              
              if (_codDeficit != null) ...[
                const SizedBox(height: 40),
                Card(
                  elevation: 8,
                  color: Colors.amber.shade50,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                    side: BorderSide(color: Colors.amber.shade200, width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'COD DEFICIT SCORE',
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.amber.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('OFFICIAL', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          '${_codDeficit!.toStringAsFixed(2)}s',
                          style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.amber),
                        ),
                        const Divider(height: 32),
                        const Row(
                          children: [
                            Icon(Icons.info_outline, size: 16, color: Colors.amber),
                            SizedBox(width: 8),
                            Text('DIAGNOSTIC RECOMMENDATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _recommendation!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            fontStyle: FontStyle.italic,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _sprintController.dispose();
    _shuttleController.dispose();
    super.dispose();
  }
}
