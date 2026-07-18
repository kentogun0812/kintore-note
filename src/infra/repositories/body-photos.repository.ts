import { queryAll, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface BodyPhotoModel {
  id: string;
  user_id: string;
  file_path: string;
  angle: string;
  key_id: string;
  taken_at: number;
}

export const BodyPhotosRepository = {
  /**
   * Save a newly taken body photo log to SQLite
   */
  saveBodyPhoto(userId: string, filePath: string, angle: string): string {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const keyId = `photo-${timestamp}-${angle}`;

    runExecute(
      `INSERT INTO body_photos (id, user_id, file_path, angle, key_id, taken_at, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, userId, filePath, angle, keyId, timestamp, now, now]
    );

    console.log(`[BodyPhotosRepository] Saved body photo ${id} locally.`);
    return id;
  },

  /**
   * Get all photos for a user
   */
  getPhotos(userId: string): BodyPhotoModel[] {
    return queryAll<BodyPhotoModel>(
      `SELECT id, user_id, file_path, angle, key_id, taken_at 
       FROM body_photos 
       WHERE user_id = ? AND syncStatus != 'deleted'
       ORDER BY taken_at DESC`,
      [userId]
    );
  }
};
