import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children, relation } from '@nozbe/watermelondb/decorators';

export class MuscleGroup extends Model {
  static table = 'muscle_groups';
  static associations = {
    exercises: { type: 'has_many', foreignKey: 'muscle_group_id' },
  };

  @field('name_ja') nameJa!: string;
  @field('name_en') nameEn!: string;
  @field('body_region') bodyRegion!: string;
  @field('sort_order') sortOrder!: number;

  @children('exercises') exercises!: any;
}

export class Exercise extends Model {
  static table = 'exercises';
  static associations = {
    muscle_groups: { type: 'belongs_to', key: 'muscle_group_id' },
  };

  @field('name_ja') nameJa!: string;
  @field('name_en') nameEn!: string;
  @field('muscle_group_id') muscleGroupId!: string;
  @field('is_system') isSystem!: boolean;
  @readonly @date('created_at') createdAt!: Date;

  @relation('muscle_groups', 'muscle_group_id') muscleGroup!: any;
}

export class TrainingMenu extends Model {
  static table = 'training_menus';
  static associations = {
    menu_exercises: { type: 'has_many', foreignKey: 'menu_id' },
  };

  @field('name') name!: string;
  @field('is_template') isTemplate!: boolean;
  @field('user_id') userId!: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('menu_exercises') menuExercises!: any;
}

export class MenuExercise extends Model {
  static table = 'menu_exercises';
  static associations = {
    training_menus: { type: 'belongs_to', key: 'menu_id' },
    exercises: { type: 'belongs_to', key: 'exercise_id' },
  };

  @field('menu_id') menuId!: string;
  @field('exercise_id') exerciseId!: string;
  @field('sort_order') sortOrder!: number;
  @field('target_sets') targetSets!: number;
  @field('target_reps') targetReps!: number;

  @relation('training_menus', 'menu_id') menu!: any;
  @relation('exercises', 'exercise_id') exercise!: any;
}

export class BodyPhoto extends Model {
  static table = 'body_photos';

  @field('user_id') userId!: string;
  @field('file_path') filePath!: string;
  @field('angle') angle!: string; // 'front' | 'side' | 'back'
  @field('key_id') keyId!: string;
  @field('taken_at') takenAt!: number;
  @readonly @date('created_at') createdAt!: Date;
}
