import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class HankoStamp extends Model {
  static table = 'hanko_stamps';

  @field('user_id') userId!: string;
  @field('session_id') sessionId!: string;
  @date('earned_at') earnedAt!: Date;
  @field('streak_count') streakCount!: number;
  
  @readonly @date('created_at') createdAt!: Date;
}
