const fs = require('fs');
const path = require('path');

const RAW_DATA_PATH = 'D:\\Workspace\\crawler-gym-exercises\\github_dataset\\data\\exercises.json';
const RAW_IMAGES_DIR = 'D:\\Workspace\\crawler-gym-exercises\\github_dataset\\images';
const RAW_VIDEOS_DIR = 'D:\\Workspace\\crawler-gym-exercises\\github_dataset\\videos';

const OLD_SEED_PATH = path.join(__dirname, '..', 'src', 'constants', 'seedExercises.json');
const DEST_JSON_PATH = path.join(__dirname, '..', 'src', 'constants', 'seedExercises.json');
const DEST_MEDIA_PATH = path.join(__dirname, '..', 'src', 'constants', 'exerciseMedia.ts');
const DEST_IMAGES_DIR = path.join(__dirname, '..', 'assets', 'exercises', 'images');
const DEST_VIDEOS_DIR = path.join(__dirname, '..', 'assets', 'exercises', 'videos');
const DEST_SERVER_SQL_PATH = path.join(__dirname, '..', 'database', 'seed_server.sql');

// Translation rules for common fitness words to convert English names to Japanese Katakana/Japanese terms
const TRANSLATION_RULES = {
  'barbell': 'バーベル',
  'dumbbell': 'ダンベル',
  'cable': 'ケーブル',
  'kettlebell': 'ケトルベル',
  'bench press': 'ベンチプレス',
  'bench': 'ベンチ',
  'incline': 'インクライン',
  'decline': 'デクライン',
  'push-up': 'プッシュアップ',
  'pull-up': 'プルアップ',
  'chin-up': 'チンアップ',
  'chin': 'チンアップ',
  'dip': 'ディップス',
  'dips': 'ディップス',
  'curl': 'カール',
  'extension': 'エクステンション',
  'squat': 'スクワット',
  'deadlift': 'デッドリフト',
  'lunge': 'ランジ',
  'raise': 'レイズ',
  'row': 'ロー',
  'fly': 'フライ',
  'press': 'プレス',
  'standing': 'スタンディング',
  'seated': 'シーテッド',
  'lying': 'ライイング',
  'prone': 'プローン',
  'kneeling': 'ニーリング',
  'assisted': 'アシスト',
  'reverse-grip': 'リバースグリップ',
  'close-grip': 'ナローグリップ',
  'wide-grip': 'ワイドグリップ',
  'one arm': 'ワンハンド',
  'single arm': 'シングルアーム',
  'single leg': 'シングルレッグ',
  'lateral': 'サイド',
  'front': 'フロント',
  'rear': 'リア',
  'leg press': 'レッグプレス',
  'leg curl': 'レッグカール',
  'leg extension': 'レッグエクステンション',
  'calf raise': 'カーフレイズ',
  'shoulder press': 'ショルダープレス',
  'triceps': 'トライセップス',
  'biceps': 'バイセップス',
  'hammer': 'ハンマー',
  'overhead': 'オーバーヘッド',
  'chest press': 'チェストプレス',
  'lat pulldown': 'ラットプルダウン',
  'pulldown': 'プルダウン',
  'pullover': 'プルオーバー',
  'kickback': 'キックバック',
  'crossover': 'クロスオーバー',
  'shrug': 'シュラッグ',
  'crunch': 'クランチ',
  'leg raise': 'レッグレイズ',
  'plank': 'プランク',
  'smith': 'スミス',
  'hack': 'ハック',
  'machine': 'マシン',
  'band': 'バンド',
  'weighted': '加重',
  'bodyweight': '自重',
  'body weight': '自重',
  'towel': 'タオル',
  'wheel': 'ホイール',
  'rollout': 'ロールアウト',
  'twist': 'ツイスト',
  'hip': 'ヒップ',
  'glute': 'グルート',
  'stretch': 'ストレッチ',
  'back': 'バック',
  'chest': 'チェスト',
  'abdominal': 'アブドミナル',
  'oblique': 'オブリーク',
  'wrist': 'リスト',
  'forearm': 'フォアアーム',
  'ankle': 'アンクル',
  'calf': 'カーフ',
  'calves': 'カーフ',
  'neck': 'ネック',
  'trap': 'トラップ',
  'lats': 'ラット',
  'quad': 'クアッド'
};

const EQUIPMENT_JA_MAP = {
  "body weight": "自重",
  "dumbbell": "ダンベル",
  "barbell": "バーベル",
  "cable": "ケーブル",
  "kettlebell": "ケトルベル",
  "band": "バンド",
  "medicine ball": "メディシンボール",
  "exercise ball": "エクササイズボール",
  "foam roller": "フォームローラー",
  "smith machine": "スミスマシン",
  "resistance band": "レジスタンスバンド",
  "pull-up bar": "チンニングバー",
  "parallel bars": "パラレルバー",
  "assisted": "アシストマシン",
  "leverage machine": "レバレッジマシン",
  "rope": "ロープ",
  "slide board": "スライドボード",
  "stability ball": "スタビリティボール",
  "bosu ball": "ボスボール",
  "wheel roller": "ホイールローラー"
};

const CATEGORIES_JA_MAP = {
  "back": "背中",
  "cardio": "有酸素",
  "chest": "胸",
  "lower arms": "前腕",
  "lower legs": "下腿",
  "neck": "首",
  "shoulders": "肩",
  "upper arms": "上腕",
  "upper legs": "大腿",
  "waist": "体幹・腹筋"
};

const MUSCLE_GROUPS_JA_MAP = {
  "mg-chest": "胸",
  "mg-back": "背中",
  "mg-shoulders": "肩",
  "mg-arms": "腕",
  "mg-core": "腹筋",
  "mg-legs": "脚",
  "mg-glutes": "お尻",
  "mg-forearms": "前腕",
  "mg-fullbody": "全身",
  "mg-cardio": "有酸素"
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function capitalize(text) {
  return text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Map exercises to predefined muscle groups
function resolveMuscleGroupId(bodyPart, target, muscleGroup) {
  const m = (target || muscleGroup || '').toLowerCase();
  if (m.includes('glute')) return 'mg-glutes';
  if (m.includes('bicep') || m.includes('tricep') || m.includes('brachialis')) return 'mg-arms';
  if (m.includes('forearm') || m.includes('flexor') || m.includes('extensor')) return 'mg-forearms';
  if (m.includes('shoulder') || m.includes('delt') || m.includes('trap') || m.includes('neck') || m.includes('levator')) return 'mg-shoulders';
  if (m.includes('abs') || m.includes('oblique') || m.includes('waist') || m.includes('rectus') || m.includes('serratus')) return 'mg-core';
  if (m.includes('lat') || m.includes('back') || m.includes('erector') || m.includes('spine') || m.includes('rhomboid') || m.includes('teres')) return 'mg-back';
  if (m.includes('quad') || m.includes('hamstring') || m.includes('calf') || m.includes('calves') || m.includes('thigh') || m.includes('leg') || m.includes('adductor') || m.includes('abductor') || m.includes('soleus') || m.includes('gastrocnemius')) return 'mg-legs';
  
  // Fallback to body_part mapping
  switch (bodyPart.toLowerCase()) {
    case 'back': return 'mg-back';
    case 'cardio': return 'mg-cardio';
    case 'chest': return 'mg-chest';
    case 'lower arms': return 'mg-forearms';
    case 'lower legs': return 'mg-legs';
    case 'neck': return 'mg-shoulders';
    case 'shoulders': return 'mg-shoulders';
    case 'upper arms': return 'mg-arms';
    case 'upper legs': return 'mg-legs';
    case 'waist': return 'mg-core';
    default: return 'mg-fullbody';
  }
}

function run() {
  console.log('[Preprocess] Starting preprocessing of exercise dataset...');

  // Ensure output directories exist
  if (!fs.existsSync(DEST_IMAGES_DIR)) fs.mkdirSync(DEST_IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(DEST_VIDEOS_DIR)) fs.mkdirSync(DEST_VIDEOS_DIR, { recursive: true });

  // 1. Load old seed data to build translation dict
  let oldTranslationMap = new Map(); // name_en.toLowerCase() -> name_ja
  let oldDifficultyMap = new Map(); // name_en.toLowerCase() -> difficulty
  let oldMechanicsMap = new Map(); // name_en.toLowerCase() -> mechanics
  let oldForceMap = new Map(); // name_en.toLowerCase() -> force
  let oldSortOrderMap = new Map(); // name_en.toLowerCase() -> sort_order
  let oldIsDefaultMap = new Map(); // name_en.toLowerCase() -> is_default

  if (fs.existsSync(OLD_SEED_PATH)) {
    console.log('[Preprocess] Loading old seed file to extract Japanese translations...');
    try {
      const oldSeed = JSON.parse(fs.readFileSync(OLD_SEED_PATH, 'utf8'));
      if (oldSeed.exercises) {
        for (const ex of oldSeed.exercises) {
          const key = ex.name_en.toLowerCase().trim();
          oldTranslationMap.set(key, ex.name_ja);
          if (ex.difficulty) oldDifficultyMap.set(key, ex.difficulty);
          if (ex.mechanics) oldMechanicsMap.set(key, ex.mechanics);
          if (ex.force) oldForceMap.set(key, ex.force);
          if (ex.sort_order) oldSortOrderMap.set(key, ex.sort_order);
          if (ex.is_default) oldIsDefaultMap.set(key, ex.is_default);
        }
      }
      console.log(`[Preprocess] Extracted translations for ${oldTranslationMap.size} exercises.`);
    } catch (e) {
      console.warn('[Preprocess] Warning reading old seed data:', e);
    }
  }

  // 2. Read new crawler dataset
  console.log('[Preprocess] Reading new raw exercises JSON...');
  const rawData = JSON.parse(fs.readFileSync(RAW_DATA_PATH, 'utf8'));
  console.log(`[Preprocess] Loaded ${rawData.length} exercises from crawler dataset.`);

  // Structures for our seed output
  const outputExercises = [];
  const outputEquipment = new Map();
  const outputCategories = new Map();
  
  const exerciseMuscles = [];
  const exerciseEquipment = [];
  const exerciseCategories = [];

  const mediaMappingLines = [];

  // Seed constant muscle groups (10 standard groups)
  const muscleGroups = [
    { id: "mg-chest", name_ja: "胸", name_en: "Chest", body_region: "upper", sort_order: 1 },
    { id: "mg-back", name_ja: "背中", name_en: "Back", body_region: "upper", sort_order: 2 },
    { id: "mg-shoulders", name_ja: "肩", name_en: "Shoulders", body_region: "upper", sort_order: 3 },
    { id: "mg-arms", name_ja: "腕", name_en: "Arms", body_region: "upper", sort_order: 4 },
    { id: "mg-core", name_ja: "腹筋", name_en: "Core", body_region: "core", sort_order: 5 },
    { id: "mg-legs", name_ja: "脚", name_en: "Legs", body_region: "lower", sort_order: 6 },
    { id: "mg-glutes", name_ja: "お尻", name_en: "Glutes", body_region: "lower", sort_order: 7 },
    { id: "mg-forearms", name_ja: "前腕", name_en: "Forearms", body_region: "upper", sort_order: 8 },
    { id: "mg-fullbody", name_ja: "全身", name_en: "Full Body", body_region: "full_body", sort_order: 9 },
    { id: "mg-cardio", name_ja: "有酸素", name_en: "Cardio", body_region: "cardio", sort_order: 10 }
  ];

  console.log('[Preprocess] Copying assets and generating mappings...');

  let copiedCount = 0;
  const usedSlugs = new Set();

  for (const ex of rawData) {
    const nameKey = ex.name.toLowerCase().trim();
    
    // Resolve Japanese Name
    let nameJa = oldTranslationMap.get(nameKey);
    if (!nameJa) {
      // Rule-based Translation
      let translated = ex.name.toLowerCase();
      // Replace words
      for (const [engWord, jaWord] of Object.entries(TRANSLATION_RULES)) {
        const regex = new RegExp(`\\b${engWord}\\b`, 'gi');
        translated = translated.replace(regex, jaWord);
      }
      // Capitalize first letters of remaining english words if any, and clean up spaces
      nameJa = capitalize(translated).replace(/\s+/g, ' ').trim();
    }

    // Resolve details
    const mgId = resolveMuscleGroupId(ex.body_part, ex.target, ex.muscle_group);
    const difficulty = oldDifficultyMap.get(nameKey) || 'Beginner';
    const mechanics = oldMechanicsMap.get(nameKey) || (ex.name.toLowerCase().includes('isolation') ? 'isolation' : 'compound');
    const force = oldForceMap.get(nameKey) || (ex.name.toLowerCase().includes('pull') ? 'pull' : 'push');
    const isDefault = oldIsDefaultMap.get(nameKey) || 0;
    const sortOrder = oldSortOrderMap.get(nameKey) || 9999;
    const bodyRegion = muscleGroups.find(g => g.id === mgId)?.body_region || 'upper';

    // Generate Descriptions
    const equipmentJa = EQUIPMENT_JA_MAP[ex.equipment.toLowerCase()] || ex.equipment;
    const muscleGroupJa = MUSCLE_GROUPS_JA_MAP[mgId] || ex.body_part;
    const descJa = `${nameJa}は、${equipmentJa}を使用した${muscleGroupJa}をターゲットとする効果的なトレーニング種目です。`;
    const descEn = `${capitalize(ex.name)} is an effective exercise targeting the ${ex.muscle_group || ex.body_part} using ${ex.equipment}.`;

    // Process Equipment
    const eqNameClean = ex.equipment.toLowerCase().trim();
    const eqId = `eq-${slugify(eqNameClean)}`;
    if (!outputEquipment.has(eqId)) {
      outputEquipment.set(eqId, {
        id: eqId,
        name_en: capitalize(ex.equipment),
        name_ja: EQUIPMENT_JA_MAP[eqNameClean] || capitalize(ex.equipment)
      });
    }

    // Process Category
    const catNameClean = ex.category.toLowerCase().trim();
    const catId = slugify(catNameClean);
    if (!outputCategories.has(catId)) {
      outputCategories.set(catId, {
        id: catId,
        name_en: capitalize(ex.category),
        name_ja: CATEGORIES_JA_MAP[catNameClean] || capitalize(ex.category)
      });
    }

    // SQLite Exercises fields
    const instructionsEn = ex.instruction_steps.en || [ex.instructions.en];
    
    let slug = slugify(ex.name);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${ex.id}`;
    }
    usedSlugs.add(slug);

    outputExercises.push({
      id: ex.id,
      slug: slug,
      name_ja: nameJa,
      name_en: capitalize(ex.name),
      description_ja: descJa,
      description_en: descEn,
      muscle_group_id: mgId,
      difficulty,
      mechanics,
      force,
      body_region: bodyRegion,
      instructions: JSON.stringify(instructionsEn),
      image: ex.image,
      gif_url: ex.gif_url,
      is_default: isDefault,
      sort_order: sortOrder
    });

    // Seed Mapping Arrays
    const mappedMuscles = new Set();
    mappedMuscles.add(mgId);

    // primary muscle
    exerciseMuscles.push({ exercise_id: ex.id, muscle_group_id: mgId, is_primary: 1 });
    
    // secondary muscles
    if (ex.secondary_muscles && Array.isArray(ex.secondary_muscles)) {
      for (const sm of ex.secondary_muscles) {
        const smId = resolveMuscleGroupId(ex.body_part, sm, '');
        if (smId !== mgId && !mappedMuscles.has(smId)) {
          mappedMuscles.add(smId);
          exerciseMuscles.push({ exercise_id: ex.id, muscle_group_id: smId, is_primary: 0 });
        }
      }
    }

    // equipment link
    exerciseEquipment.push({ exercise_id: ex.id, equipment_id: eqId });

    // category link
    exerciseCategories.push({ exercise_id: ex.id, category_id: catId });

    // Asset Copying
    const srcImgPath = path.join(RAW_IMAGES_DIR, path.basename(ex.image));
    const destImgPath = path.join(DEST_IMAGES_DIR, path.basename(ex.image));
    const srcVidPath = path.join(RAW_VIDEOS_DIR, path.basename(ex.gif_url));
    const destVidPath = path.join(DEST_VIDEOS_DIR, path.basename(ex.gif_url));

    try {
      if (fs.existsSync(srcImgPath)) {
        fs.copyFileSync(srcImgPath, destImgPath);
      }
      if (fs.existsSync(srcVidPath)) {
        fs.copyFileSync(srcVidPath, destVidPath);
      }
      copiedCount++;
    } catch (err) {
      console.warn(`[Preprocess] Failed to copy asset for ${ex.id}:`, err.message);
    }

    // Add to Media Require Map list
    const fileBaseImg = path.basename(ex.image);
    const fileBaseVid = path.basename(ex.gif_url);
    mediaMappingLines.push(
      `  "${ex.id}": {` +
      `    image: require('../../assets/exercises/images/${fileBaseImg}'),` +
      `    video: require('../../assets/exercises/videos/${fileBaseVid}')` +
      `  }`
    );
  }

  // 3. Output files
  console.log('[Preprocess] Writing generated files to workspace...');

  // A. seedExercises.json
  const finalSeedJson = {
    muscle_groups: muscleGroups,
    equipment: Array.from(outputEquipment.values()),
    categories: Array.from(outputCategories.values()),
    exercises: outputExercises,
    exercise_muscles: exerciseMuscles,
    exercise_equipment: exerciseEquipment,
    exercise_categories: exerciseCategories
  };

  fs.writeFileSync(DEST_JSON_PATH, JSON.stringify(finalSeedJson, null, 2), 'utf8');
  console.log(`[Preprocess] Generated seed json at ${DEST_JSON_PATH}. Size: ${(fs.statSync(DEST_JSON_PATH).size / (1024 * 1024)).toFixed(2)} MB`);

  // B. exerciseMedia.ts
  const mediaMapContent = 
`// This file is auto-generated by scripts/preprocess-dataset.js. Do not edit manually.
export const EXERCISE_MEDIA: Record<string, { image: any; video: any }> = {
${mediaMappingLines.join(',\n')}
};
`;
  fs.writeFileSync(DEST_MEDIA_PATH, mediaMapContent, 'utf8');
  console.log(`[Preprocess] Generated require map at ${DEST_MEDIA_PATH}`);

  // C. Server SQL file seed_server.sql for Supabase sync database
  const sqlLines = [
    '-- Supabase Seeding Script for Master Exercise Library',
    'BEGIN;',
    'TRUNCATE TABLE exercise_muscles CASCADE;',
    'TRUNCATE TABLE exercise_equipment CASCADE;',
    'TRUNCATE TABLE exercise_categories CASCADE;',
    'TRUNCATE TABLE exercises CASCADE;',
    'TRUNCATE TABLE muscle_groups CASCADE;',
    'TRUNCATE TABLE equipment CASCADE;',
    'TRUNCATE TABLE categories CASCADE;',
    'TRUNCATE TABLE exercise_dataset_versions CASCADE;'
  ];

  // SQL Muscle Groups
  for (const mg of muscleGroups) {
    sqlLines.push(`INSERT INTO muscle_groups (id, name_ja, name_en, body_region, sort_order) VALUES ('${mg.id}', '${mg.name_ja.replace(/'/g, "''")}', '${mg.name_en.replace(/'/g, "''")}', '${mg.body_region}', ${mg.sort_order});`);
  }

  // SQL Equipment
  for (const eq of outputEquipment.values()) {
    sqlLines.push(`INSERT INTO equipment (id, name_ja, name_en) VALUES ('${eq.id}', '${eq.name_ja.replace(/'/g, "''")}', '${eq.name_en.replace(/'/g, "''")}');`);
  }

  // SQL Categories
  for (const cat of outputCategories.values()) {
    sqlLines.push(`INSERT INTO categories (id, name_ja, name_en) VALUES ('${cat.id}', '${cat.name_ja.replace(/'/g, "''")}', '${cat.name_en.replace(/'/g, "''")}');`);
  }

  // SQL Exercises
  for (const ex of outputExercises) {
    sqlLines.push(`INSERT INTO exercises (id, slug, name_ja, name_en, description_ja, description_en, muscle_group_id, difficulty, mechanics, force, body_region, instructions, image, gif_url, is_default, sort_order, is_system) VALUES (` +
      `'${ex.id}', ` +
      `'${ex.slug}', ` +
      `'${ex.name_ja.replace(/'/g, "''")}', ` +
      `'${ex.name_en.replace(/'/g, "''")}', ` +
      `'${ex.description_ja.replace(/'/g, "''")}', ` +
      `'${ex.description_en.replace(/'/g, "''")}', ` +
      `'${ex.muscle_group_id}', ` +
      `'${ex.difficulty}', ` +
      `'${ex.mechanics}', ` +
      `'${ex.force}', ` +
      `'${ex.body_region}', ` +
      `'${ex.instructions.replace(/'/g, "''")}', ` +
      `'${ex.image}', ` +
      `'${ex.gif_url}', ` +
      `${ex.is_default ? 'TRUE' : 'FALSE'}, ` +
      `${ex.sort_order}, ` +
      `TRUE` +
      `);`
    );
  }

  // SQL Mappings
  for (const em of exerciseMuscles) {
    sqlLines.push(`INSERT INTO exercise_muscles (exercise_id, muscle_group_id, is_primary) VALUES ('${em.exercise_id}', '${em.muscle_group_id}', ${em.is_primary ? 'TRUE' : 'FALSE'});`);
  }
  for (const ee of exerciseEquipment) {
    sqlLines.push(`INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES ('${ee.exercise_id}', '${ee.equipment_id}');`);
  }
  for (const ec of exerciseCategories) {
    sqlLines.push(`INSERT INTO exercise_categories (exercise_id, category_id) VALUES ('${ec.exercise_id}', '${ec.category_id}');`);
  }

  // SQL Version Metadata
  sqlLines.push(`INSERT INTO exercise_dataset_versions (version_number, released_at) VALUES (1, NOW());`);
  sqlLines.push('COMMIT;');

  fs.writeFileSync(DEST_SERVER_SQL_PATH, sqlLines.join('\n'), 'utf8');
  console.log(`[Preprocess] Generated server seeding SQL at ${DEST_SERVER_SQL_PATH}`);

  console.log(`[Preprocess] Preprocessing complete! Copied assets for ${copiedCount} exercises.`);
}

run();
