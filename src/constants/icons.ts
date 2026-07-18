export const getMuscleGroupIcon = (muscleGroupId: string) => {
  switch (muscleGroupId) {
    case 'mg-chest': return 'body';
    case 'mg-back': return 'body-outline';
    case 'mg-shoulders': return 'accessibility';
    case 'mg-arms': return 'fitness';
    case 'mg-core': return 'aperture';
    case 'mg-legs': return 'walk';
    case 'mg-glutes': return 'walk-outline';
    case 'mg-forearms': return 'hand-left';
    case 'mg-fullbody': return 'man';
    case 'mg-cardio': return 'bicycle';
    default: return 'barbell-outline';
  }
};
