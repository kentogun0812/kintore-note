import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';

export class SessionSet extends Model {
  static table = 'session_sets';

  @field('session_id') sessionId!: string;
  @field('exercise_id') exerciseId!: string;
  @field('weight_kg') weightKg!: number;
  @field('reps') reps!: number;
  @field('is_pr') isPr!: boolean;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('training_sessions', 'session_id') session!: any;
}
