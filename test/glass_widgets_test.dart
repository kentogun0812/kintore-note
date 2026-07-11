import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kintore_note_flutter/core/theme/theme.dart';
import 'package:kintore_note_flutter/core/widgets/glass/glass_container.dart';
import 'package:kintore_note_flutter/core/widgets/glass/glass_card.dart';
import 'package:kintore_note_flutter/core/widgets/glass/glass_button.dart';

void main() {
  testWidgets('Glass widgets rendering test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.darkTheme,
        home: Scaffold(
          body: Column(
            children: [
              const GlassContainer(
                width: 100,
                height: 100,
                child: Text('Container'),
              ),
              const GlassCard(
                child: Text('Card'),
              ),
              GlassButton(
                onPressed: () {},
                child: const Text('Button'),
              ),
            ],
          ),
        ),
      ),
    );

    // Verify all widgets render their text children
    expect(find.text('Container'), findsOneWidget);
    expect(find.text('Card'), findsOneWidget);
    expect(find.text('Button'), findsOneWidget);
  });
}
