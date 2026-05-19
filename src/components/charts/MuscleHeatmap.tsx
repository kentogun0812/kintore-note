import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { HeatmapRegionData } from '@/store/analytics.store';

interface MuscleHeatmapProps {
  data: HeatmapRegionData[];
}

export function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  // Find max volume to calculate intensity (0.0 to 1.0)
  const maxVolume = data.length > 0 ? Math.max(...data.map(d => d.volume)) : 1;

  // Helper to get color based on volume
  const getColor = (muscleName: string) => {
    const region = data.find(d => d.name.toLowerCase().includes(muscleName.toLowerCase()));
    if (!region || region.volume === 0) return colors.dark.bg.tertiary;
    
    const intensity = region.volume / maxVolume;
    
    // Simple gradient: from light gray to primary accent (red)
    // For MVP, we can just use opacity on the primary color or mix it.
    // Let's use rgba for primary color with varying opacity
    if (intensity < 0.2) return `${colors.dark.accent.primary}33`; // 20%
    if (intensity < 0.4) return `${colors.dark.accent.primary}66`; // 40%
    if (intensity < 0.6) return `${colors.dark.accent.primary}99`; // 60%
    if (intensity < 0.8) return `${colors.dark.accent.primary}CC`; // 80%
    return colors.dark.accent.primary; // 100%
  };

  return (
    <View style={styles.container}>
      <Svg width="200" height="400" viewBox="0 0 200 400">
        <G id="stylized-body" stroke={colors.dark.border.default} strokeWidth="2">
          {/* Head */}
          <Circle cx="100" cy="40" r="25" fill={colors.dark.bg.tertiary} />
          
          {/* Shoulders */}
          <Circle cx="60" cy="90" r="15" fill={getColor('shoulder')} />
          <Circle cx="140" cy="90" r="15" fill={getColor('shoulder')} />
          
          {/* Chest */}
          <Rect x="75" y="80" width="50" height="35" rx="5" fill={getColor('chest')} />
          
          {/* Back (hidden behind chest conceptually, but we can color both if needed, 
              or just use Chest for front view. Let's make an abstract torso) */}
          
          {/* Core/Abs */}
          <Rect x="80" y="120" width="40" height="50" rx="5" fill={getColor('core')} />
          
          {/* Arms (Biceps/Triceps) */}
          <Rect x="45" y="110" width="18" height="60" rx="8" fill={getColor('arm')} />
          <Rect x="137" y="110" width="18" height="60" rx="8" fill={getColor('arm')} />
          
          {/* Forearms */}
          <Rect x="42" y="175" width="15" height="50" rx="6" fill={getColor('arm')} />
          <Rect x="143" y="175" width="15" height="50" rx="6" fill={getColor('arm')} />
          
          {/* Pelvis/Glutes */}
          <Rect x="70" y="175" width="60" height="30" rx="10" fill={getColor('leg')} />
          
          {/* Thighs/Quads */}
          <Rect x="72" y="210" width="25" height="70" rx="10" fill={getColor('leg')} />
          <Rect x="103" y="210" width="25" height="70" rx="10" fill={getColor('leg')} />
          
          {/* Calves */}
          <Rect x="75" y="285" width="20" height="60" rx="8" fill={getColor('leg')} />
          <Rect x="105" y="285" width="20" height="60" rx="8" fill={getColor('leg')} />
        </G>
      </Svg>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: colors.dark.bg.tertiary }]} />
          <Text style={styles.legendText}>0%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: `${colors.dark.accent.primary}66` }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: colors.dark.accent.primary }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
});
