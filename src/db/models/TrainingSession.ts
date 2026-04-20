import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export class TrainingSession extends Model {
  static table = 'training_sessions';

  @field('user_id') userId!: string;
  @date('start_time') startTime!: Date;
  @date('end_time') endTime?: Date;
  @field('status') status!: string; // 'active', 'completed', 'discarded'
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('session_sets') sets!: any;
}
