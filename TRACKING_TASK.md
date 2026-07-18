# Task Tracking

## Objective
Tạo Mock Admin User để phục vụ phát triển và kiểm thử, bypass các luồng auth/onboarding.

## Status
- [x] Khởi tạo file mockAdmin.ts
- [x] Cập nhật auth.store.ts để trả về Mock Admin khi có env var.
- [x] Cập nhật app/_layout.tsx để bypass guard onboarding/intro.
- [x] Cập nhật .env (chỉ cung cấp hướng dẫn)

## Changes
- Tạo `src/constants/mockAdmin.ts` chứa mock user.
- Sửa `src/store/auth.store.ts` để bypass khi có `EXPO_PUBLIC_USE_MOCK_ADMIN=true`.
- Sửa `app/_layout.tsx` để bypass intro/onboarding guards.

## Decisions
Sử dụng biến môi trường `EXPO_PUBLIC_USE_MOCK_ADMIN=true` để kiểm soát, không ảnh hưởng production.

---

## Objective
Cải thiện UI/UX cho Home Screen, Training Screen và Session Screen theo yêu cầu.

## Status
- [x] Home: Di chuyển header Welcome sang phải.
- [x] Home: Thêm Navigation cho Calendar để chuyển tháng.
- [x] Home: Giảm độ chói màu accent primary cho button dịu hơn.
- [x] Training/Session: Thêm i18n cho `weeklyPlan.builder` và `session.addNotes`.
- [x] Session: Sửa CSS `notesInput` để căn giữa theo chiều dọc.
- [x] Session: Update keyboard step +/- 0.5 cho kg và rep.

## Changes
- `src/constants/colors.ts`: Đổi `accent.primary` từ `#E54D42` sang `#D24A42` (dịu hơn).
- `app/(tabs)/home.tsx`: Sửa style `premiumHeader` thành `flex-end`, thêm nút chuyển tháng cho `HankoCalendar`.
- `app/training/session.tsx`: Thêm `paddingVertical` và `textAlignVertical` cho `notesInput`, đổi step của các nút cộng trừ thành `0.5`.
- `src/i18n/locales/en.json` & `ja.json`: Bổ sung key `addNotes` và `weeklyPlan.builder`.

---

## Objective
Khắc phục các cảnh báo và lỗi trên console khi chạy server phát triển Expo.

## Status
- [x] Cập nhật các package Expo để tương thích với SDK bằng `npx expo install --fix`.
- [x] Xử lý cảnh báo `[Layout children]: No route named "settings/index"` trong `_layout.tsx`.
- [x] Khắc phục cảnh báo `SafeAreaView has been deprecated` trong `session.tsx`.
- [x] Khắc phục lỗi `No native splash screen registered` do thiếu `SplashScreen.preventAutoHideAsync()`.

## Changes
- `app/_layout.tsx`: Thêm `SplashScreen.preventAutoHideAsync()` và xóa route `settings/index` không tồn tại.
- `app/training/session.tsx`: Chuyển import `SafeAreaView` sang sử dụng `react-native-safe-area-context`.
- Chạy lệnh `npx expo install --fix` để tự động điều chỉnh phiên bản các thư viện expo.

---

## Objective
Cải thiện màn hình Session (Start Empty Session flow, Start Workout flow, Finish Button validation).

## Status
- [x] Cập nhật màn hình Session trong `app/training/session.tsx`
- [x] Tách Exercise Section thành component memoized để tránh re-render không cần thiết
- [x] Triển khai Custom Toast thông báo khi session chưa hoàn thành
- [x] Kiểm tra và chạy tsc để xác nhận không lỗi TypeScript

## Changes
- `app/training/session.tsx`:
  - Khởi tạo màn hình: Nếu session bắt đầu rỗng (`exercises.length === 0`), truy vấn trực tiếp Supabase hiển thị danh sách tên bài tập để user chọn trước khi vẽ Exercise Card.
  - Tách phần render card bài tập thành component `ExerciseSection` được memoized bằng `React.memo`, giảm thiểu re-render không cần thiết.
  - Sử dụng `useRef` lưu giữ trạng thái `restLeft` (timer) để timer đếm ngược không kích hoạt re-render trên các card bài tập tĩnh.
  - Cập nhật Finish button: Thêm validation kiểm tra tất cả bài tập đã được đánh dấu hoàn thành (`allExercisesDone`), nếu chưa thì hiển thị custom Toast hướng dẫn.
  - Thêm Toast thông báo tùy chỉnh hiển thị thông điệp và tự động ẩn đi sau 3 giây.

## Decisions
- Triển khai custom toast overlay thay vì React Native Alert để có UI/UX mượt mà và trực quan hơn.
- Sử dụng `React.memo` và `useRef` cho trạng thái rest timer để tránh render lại toàn bộ Exercise Card mỗi giây.

---

## Objective
Khắc phục lỗi giữ lại state cũ (state leak) khi mở màn hình Session.

## Status
- [x] Sửa xử lý state của màn hình Session ✅ Done

## Changes
- `app/(tabs)/training.tsx`: Thay đổi nút "Start Empty Session" từ việc dùng `<Link>` trực tiếp sang sử dụng `onPress` để gọi `startSession([])` trước khi điều hướng đến `/training/session`, nhằm khởi tạo và làm sạch state trong Zustand store.

## Decisions
- Khởi tạo trực tiếp state của session trước khi điều hướng giúp tách biệt hoàn toàn dữ liệu giữa các entry flow (Empty Session vs Workout Session) mà không gây re-render không cần thiết trên màn hình chính của Session.

---

## Objective
Refactor Exercise Master Data từ dạng query Supabase/Constants sang lưu trữ tại local WatermelonDB để cải thiện hiệu năng và hỗ trợ offline.

## Status
- [x] Tạo `src/constants/defaultExercises.ts` với danh sách 10 nhóm cơ và 84 bài tập.
- [x] Tạo `src/infra/db/seed.ts` dùng `database.batch()` để seed data nếu bảng exercises trống.
- [x] Gọi `seedDefaultData()` trong `app/_layout.tsx` khi khởi chạy app.
- [x] Refactor `app/training/session.tsx` để lấy exercises từ WatermelonDB.
- [x] Refactor `app/training/library.tsx` để lấy exercises từ WatermelonDB.
- [x] Refactor `app/(tabs)/stats.tsx` để lấy top exercises từ WatermelonDB.
- [x] Fix lỗi type cho `muscle_groups` bằng fallback.

## Changes
- `src/constants/defaultExercises.ts`: File chứa default data exercises phân theo `mg-` id.
- `src/infra/db/seed.ts`: Chứa hàm `seedDefaultData`.
- `app/_layout.tsx`: Thêm logic gọi hàm seed.
- Các screen liên quan (`session.tsx`, `library.tsx`, `stats.tsx`) chuyển sang dùng `database.get('exercises').query().fetch()` thay vì dùng `supabase.from`.

## Decisions
- Để tránh thay đổi schema phức tạp lúc này, sử dụng `primaryGroup` để gán thẳng vào `muscle_group_id` hiện tại của WatermelonDB (schema chỉ hỗ trợ 1 khóa ngoại).
- Sử dụng fallback memory map để load relation `muscle_groups` đồng bộ và nhanh chóng trên client thay vì lazy fetch, tăng tốc độ render.

---

## Objective
Loại bỏ mock data liên quan đến lịch trình tập luyện (workouts/exercises) trên Home screen để ứng dụng quay về trạng thái sạch như người dùng thật, nhưng vẫn giữ nguyên mock Auth/User.

## Status
- [x] Đã tìm kiếm trên toàn dự án các keyword `mock` và `dummy`.
- [x] Đã xóa mảng tĩnh `dummyStampedDates` tạo lịch sử luyện tập giả định trên [app/(tabs)/home.tsx](file:///d:/Workspace/kintore-note/app/(tabs)/home.tsx).
- [x] Đã xóa hàm `getRoutineForDate` dùng để tạo routine theo chuỗi ngày tháng trên [app/(tabs)/home.tsx](file:///d:/Workspace/kintore-note/app/(tabs)/home.tsx).
- [x] Mọi state giả (mock routine) giờ đã chuyển thành mảng trống, các UI liên quan sẽ hiển thị Empty State ("No Training") đúng như một user thật mới bắt đầu sử dụng.
- [x] `mockAdmin.ts` và logic Auth Bypass hoàn toàn được giữ nguyên không bị tác động.

---

## Objective
Triển khai Custom Splash Screen hiển thị tên ứng dụng trong 3-4s và đồng bộ quá trình tải dữ liệu (preload data) trước khi vào app.

## Status
- [x] Tạo `src/components/CustomSplashScreen.tsx` hiển thị chữ "Kintore Note" với hiệu ứng fade-in + scale mượt mà.
- [x] Cập nhật `app/_layout.tsx` với luồng `Promise.all` chờ gieo mầm dữ liệu WatermelonDB (`seedDefaultData`) và delay cố định tối thiểu 3.5s.
- [x] Tắt Native Splash của Expo (`SplashScreen.hideAsync()`) ngay lập tức để ưu tiên hiển thị Custom Splash Screen.
- [x] Khóa luồng routing của Expo Router cho đến khi `isPreloading` hoàn tất.

## Decisions
- Native Splash của Expo chỉ hỗ trợ hiển thị ảnh tĩnh, nên việc tạo một component React Native Custom Splash Screen là cách tốt nhất để hiển thị text linh hoạt cùng các hiệu ứng Premium.
- Thay vì sử dụng timeout tuần tự (dễ làm chậm thời gian tải hơn mức cần thiết), sử dụng `Promise.all` để chạy song song tiến trình khởi tạo Auth, seed DB, và bộ đếm 3.5s. Điều này đảm bảo thời gian chờ luôn là tối ưu.

---

## Objective
Improve the UI/UX of the Session screen.

## Status
- [x] Add i18n key: `session.selectMuscleGroup` in both en.json and ja.json ✅ Done
- [x] Add horizontal padding for muscle group section ✅ Done
- [x] Center text and style muscle group items with soft, pleasant background colors and rounded corners ✅ Done
- [x] Add "Other" muscle group item with custom creation flows (mocked) ✅ Done
- [x] Display corresponding exercises list directly below on the same screen (Master-Detail) ✅ Done
- [x] Allow multiple exercise selection to today's workout routine ✅ Done
- [x] Add Submit button to create workout routine ✅ Done
- [x] Allow editing workout routine (add/remove exercises) from active session view ✅ Done
- [x] Clearly comment DB TODOs ✅ Done

## Changes
- `app/training/session.tsx`: Refactored selection/editing layout, custom creation flows, multi-select mechanism, and edit capability.
- `src/i18n/locales/en.json` & `ja.json`: Added `session.selectMuscleGroup` translation.

---

## Objective
Chuyển đổi cơ sở dữ liệu từ WatermelonDB sang expo-sqlite (Local-first, Cloud-second).

## Status
- [x] Cài đặt expo-sqlite và gỡ bỏ WatermelonDB khỏi package.json. ✅ Done
- [x] Thiết lập SQLite Database Client và Schema DDL. ✅ Done
- [x] Thiết lập Seed dữ liệu mặc định (Muscle Groups & Exercises). ✅ Done
- [x] Xây dựng tầng Repository (ExerciseRepository & WorkoutRepository). ✅ Done
- [x] Refactor Zustand stores (training, analytics, workout, weekly plan) để qua Repository. ✅ Done
- [x] Refactor màn hình UI (session, library, stats, layout) để tích hợp SQLite. ✅ Done
- [x] Kiểm tra lỗi biên dịch TypeScript. ✅ Done

## Changes
- Gỡ bỏ thư viện `@nozbe/watermelondb` và cài đặt `expo-sqlite`.
- Tạo mới `src/infra/db/sqlite.ts` và `src/infra/db/schema-sqlite.ts` để quản lý SQLite DB cục bộ.
- Tạo mới `src/infra/db/seed-sqlite.ts` để gieo mầm dữ liệu cơ bản.
- Tạo tầng Repositories tại `src/infra/repositories/` bao gồm `exercise.repository.ts`, `workout-routine.repository.ts`, `weekly-plan.repository.ts`.
- Cập nhật các stores `training.store.ts`, `analytics.store.ts`, `workout.store.ts`, `weekly-plan.store.ts` để đọc/ghi qua Repositories.
- Cập nhật luồng khởi chạy tại `app/_layout.tsx` và dọn dẹp các màn hình `session.tsx`, `library.tsx`, `stats.tsx` để lấy dữ liệu SQLite.
- Xóa bỏ toàn bộ các file cũ của WatermelonDB (`src/db/` và các file liên quan tại `src/infra/db/`).

## Decisions
- Chuyển toàn bộ ứng dụng sang sử dụng mô hình **Local-first, Cloud-second** dựa trên `expo-sqlite` để tương thích hoàn toàn 100% với Expo Go và cấu trúc React 19.
- Thêm trường `syncStatus` vào các bảng người dùng để sẵn sàng cho việc tích hợp bộ đồng bộ hóa Supabase (SyncService) ở chế độ nền trong tương lai mà không làm ảnh hưởng đến luồng giao diện người dùng (UI).
- Sử dụng phương thức đồng bộ `Sync` của `expo-sqlite` giúp mã nguồn gọn gàng, loại bỏ các hàm callback bất đồng bộ phức tạp ở tầng State.

---

## Objective
Bảo mật thông tin dự án bằng cách thêm các file cấu hình và schema `.env`, `supabase_schema.sql` vào `.gitignore`.

## Status
- [x] Thêm `.env` vào `.gitignore` ✅ Done
- [x] Thêm `supabase_schema.sql` vào `.gitignore` ✅ Done

## Changes
- `.gitignore`: Bổ sung `.env`, `supabase_schema.sql` để git bỏ qua.

---

## Objective
Hoàn thiện chức năng SQLite và loại bỏ toàn bộ tàn dư/mock data của WatermelonDB (bao gồm Custom Muscle Groups và Body Photos).

## Status
- [x] Thêm bảng `custom_muscle_groups` vào SQLite schema và Supabase schema ✅ Done
- [x] Cập nhật `ExerciseRepository` và `SyncService` để hỗ trợ lưu và đồng bộ Custom Muscle Groups ✅ Done
- [x] Tạo `BodyPhotosRepository` để lưu metadata ảnh chụp vào SQLite ✅ Done
- [x] Refactor UI `session.tsx` để xóa các biến state mock và gọi trực tiếp vào DB ✅ Done
- [x] Refactor UI `camera/index.tsx` để loại bỏ ghi chú WatermelonDB cũ và gọi DB mới ✅ Done
- [x] Xác minh code không có lỗi bằng TypeScript compiler ✅ Done

## Changes
- `src/infra/db/schema-sqlite.ts`, `supabase_schema.sql`: Khai báo bảng `custom_muscle_groups`.
- `src/infra/repositories/exercise.repository.ts`: Bổ sung `createCustomMuscleGroup` và `deleteCustomMuscleGroup`. 
- `src/infra/db/sync-service.ts`: Cấu hình đồng bộ hai chiều bảng mới `custom_muscle_groups`.
- `src/infra/repositories/body-photos.repository.ts`: Tạo mới để ghi log ảnh chụp.
- `app/training/session.tsx`: Loại bỏ logic Mock State và comment thừa thãi, cập nhật để gọi DB cho các thao tác Custom Group/Exercise.
- `app/camera/index.tsx`: Chuyển ghi log sau khi chụp ảnh sang SQLite.

---

## Objective
Khắc phục lỗi không hiển thị dữ liệu bài tập và xung đột cử chỉ (gesture conflict) tại màn hình Workout Session.

## Status
- [x] Thay thế `TouchableOpacity` từ `react-native-gesture-handler` bằng component từ thư viện `react-native` gốc ✅ Done
- [x] Cho phép người dùng chạm và giữ ở bất kỳ vị trí nào trên item để kéo thả sort ✅ Done
- [x] Triển khai tính năng vuốt sang trái để hiện nút Xóa (Swipe-to-delete) cho các card bài tập ✅ Done
- [x] Định dạng CSS cho nút Xóa dính liền mạch vào Card bài tập (loại bỏ khoảng cách, bo góc phải) ✅ Done
- [x] Di chuyển checkmark hoàn thành bài tập vào ô cuối cùng của Table Header của Card (`tableHeaderCheck`) ✅ Done
- [x] Căn chỉnh các phần tử trong Table Header thẳng hàng và cân đối hoàn hảo (`alignItems: 'center'`) ✅ Done
- [x] Điều chỉnh hành vi checkmark để không tự động kích hoạt timer khi nhấn hoàn thành ✅ Done
- [x] Cập nhật nút Hoàn thành (Finish) buổi tập để tự động kiểm tra, lưu DB, thực hiện Hanko và chuyển thẳng sang màn hình Hanko-stamp ✅ Done
- [x] Bổ sung cấu hình `containerStyle={{ flex: 1 }}` cho `DraggableFlatList` để tránh lỗi chiều cao bằng 0 ✅ Done
- [x] Xác minh sửa lỗi không gây ảnh hưởng tới compiler TypeScript ✅ Done

## Changes
- `app/training/session.tsx`:
  - Thay đổi import `TouchableOpacity` sang `react-native` gốc, giúp cơ chế Touch-responder truyền cử chỉ nhấn thông thường (click/type) xuống các view con (`TextInput`, `Pressable` check, delete) thay vì bị chặn đứng bởi gesture recognizer của `react-native-gesture-handler`.
  - Giữ nguyên wrapper `TouchableOpacity` bao ngoài toàn bộ Card bài tập và cấu hình `onLongPress={drag}` với `delayLongPress={300}` để hỗ trợ chạm giữ ở bất kỳ vị trí nào nhằm kéo thả sắp xếp.
  - Loại bỏ nút thùng rác xóa bài tập ở header. Wrap thẻ `Card` của bài tập bằng component `Swipeable` từ `react-native-gesture-handler`.
  - Thêm hàm `renderRightActions` trả về nút "Xóa" màu đỏ khi vuốt card sang trái.
  - Cập nhật style `deleteSwipeButton` để loại bỏ `marginLeft`, đặt bo góc `borderTopRightRadius`/`borderBottomRightRadius` là `radius.md` và `borderTopLeftRadius`/`borderBottomLeftRadius` là `0` để gắn liền mạch vào Card.
  - Di chuyển checkmark hoàn thành bài tập xuống dòng tiêu đề cột của bảng trong card, thay thế vị trí `<Text style={styles.tableHeaderCheck}></Text>` bằng `<View style={styles.tableHeaderCheck}><Pressable>...checkmark...</Pressable></View>`.
  - Cập nhật `tableHeaderCheck` trong stylesheet với thuộc tính `justifyContent: 'center'` và `alignItems: 'center'` để căn giữa vòng tròn checkmark.
  - Thêm `alignItems: 'center'` vào `tableHeader` trong stylesheet để căn chỉnh tiêu đề cột chữ và vòng tròn checkmark thẳng hàng theo trục dọc.
  - Xóa bỏ logic khởi chạy bộ đếm thời gian (timer) trong callback `handleToggleExercise`.
  - Thay đổi logic nút `Finish`: khi bấm và tất cả bài tập đã hoàn thành, thực hiện gọi hàm `saveActiveSession(userId)` và `endSession()`, sau đó chuyển hướng trực tiếp sang modal `/modals/hanko-stamp`.
  - Bổ sung `containerStyle={{ flex: 1 }}` cho `DraggableFlatList` và thêm các style cho nút vuốt xóa trong stylesheet (`deleteSwipeButton`, `deleteSwipeText`, `swipeableContainer`).

---

## Objective
Refactor và tối ưu lại toàn bộ màn hình Session (session.tsx).

## Status
- [x] Tách business logic và state ra hook `useActiveSession` ✅ Done
- [x] Tách UI Timer Overlay ra component `ActiveTimerOverlay` ✅ Done
- [x] Tách Custom Muscle Group Modal ra component `CreateCustomMGModal` ✅ Done
- [x] Tách Custom Exercise Modal ra component `CreateCustomExerciseModal` ✅ Done
- [x] Refactor `session.tsx` để tích hợp hook và các component mới ✅ Done
- [x] Xác minh và biên dịch kiểm tra TypeScript compiler ✅ Done
- [x] Tách khai báo `unitLabel` tĩnh sang file hằng số tập trung `src/constants/screens.ts` ✅ Done

## Changes
- Tạo mới `app/training/hooks/use-active-session.ts` chứa toàn bộ logic, state, animations, refs, PanResponder và SQLite integration.
- Tạo mới `app/training/components/ActiveTimerOverlay.tsx` để chứa UI và FlatList của bộ chọn/màn hình đếm ngược timer.
- Tạo mới `app/training/components/CreateCustomMGModal.tsx` để chứa giao diện Modal nhập nhóm cơ tùy chỉnh.
- Tạo mới `app/training/components/CreateCustomExerciseModal.tsx` để chứa giao diện Modal nhập bài tập tùy chỉnh.
- Refactor `app/training/session.tsx` để tích hợp hook `useActiveSession` và các component mới, đồng thời loại bỏ code dư thừa, làm sạch styles.
- Chạy TypeScript compiler thành công mà không phát sinh bất kỳ lỗi biên dịch nào.
- Tạo `src/constants/screens.ts` và gom chung constants của các màn hình/component vào một file duy nhất, thiết lập object cha theo từng màn hình (như `SESSION`).

---

## Objective
Implement a Dismissible Intro Banner for Today's Workout, Weekly Plans, and Exercise Library screens to provide a quick summary of their functions.

## Status
- [x] Tạo component `DismissibleBanner` hỗ trợ AsyncStorage để lưu trạng thái đóng banner ✅ Done
- [x] Thêm key translation (JA/EN) cho tiêu đề và mô tả của banner ✅ Done
- [x] Tích hợp component vào `app/training/today-workout.tsx` ✅ Done
- [x] Tích hợp component vào `app/training/weekly-plans.tsx` ✅ Done
- [x] Tích hợp component vào `app/training/library.tsx` ✅ Done

## Changes
- `src/components/DismissibleBanner.tsx`: Component React Native tái sử dụng với Reanimated (FadeIn/Out) và AsyncStorage.
- `src/i18n/locales/en.json`, `ja.json`: Thêm object `banners` chứa `todayWorkoutTitle/Desc`, `weeklyPlansTitle/Desc`, và `libraryTitle/Desc`.
- Các file screen (`today-workout.tsx`, `weekly-plans.tsx`, `library.tsx`) được import và nhúng `<DismissibleBanner />` với props tương ứng.

---

## Objective
Refactor và cải thiện màn hình TodayWorkoutScreen (Today's Workout).

## Status
- [x] Thêm validation cho Workout Name chống ký tự đặc biệt, trim khoảng trắng, giới hạn 50 ký tự ✅ Done
- [x] Tích hợp `DraggableFlatList` để hỗ trợ sắp xếp thứ tự bài tập bằng cách kéo thả ✅ Done
- [x] Nhúng Modal tạo Custom Exercise trực tiếp và tự động gán vào workout đang tạo ✅ Done
- [x] Fix bug nghiêm trọng đè trả về ở block `finally` của hàm `saveCurrentWorkout` trong `workout.store.ts` ✅ Done
- [x] Biên dịch thành công với TypeScript compiler không lỗi ✅ Done

## Changes
- `src/store/workout.store.ts`:
  - Thêm action `setExercises` để cập nhật danh sách bài tập sau khi kéo thả.
  - Loại bỏ block `finally` trong `saveCurrentWorkout` để tránh lỗi override kết quả trả về khi Guest đạt giới hạn.
- `app/training/today-workout.tsx`:
  - Thay thế `ScrollView` bằng `DraggableFlatList` ở root container.
  - Tích hợp `CreateCustomExerciseModal` cho phép tạo custom exercise ngay tại màn hình.
  - Thêm regex validation cho trường tên Workout để chặn các ký tự nguy hiểm (`/[<>"';\\\{\}\[\]]/`).
- `src/i18n/locales/en.json`, `ja.json`:
  - Bổ sung các bản dịch cho thông báo lỗi validation và nút "Custom".


---

## Objective
Gộp luồng khởi tạo Workout Template vào màn hình Session và tích hợp trực tiếp vào Weekly Plan Builder.

## Status
- [x] Xóa màn hình `TodayWorkoutScreen` (`today-workout.tsx`) và cập nhật `app/(tabs)/training.tsx` ✅ Done
- [x] Gộp luồng lưu Template khi Finish Session trong `use-active-session.ts` và `session.tsx` ✅ Done
- [x] Bổ sung tính năng tạo Workout mới trực tiếp tại Weekly Plan Builder (`weekly-plan/[id].tsx`) ✅ Done
- [x] Thêm các bản dịch ngôn ngữ tương ứng trong `en.json` và `ja.json` ✅ Done
- [x] Kiểm tra lỗi biên dịch TypeScript ✅ Done

## Changes
- `app/training/today-workout.tsx`: Xóa bỏ file.
- `app/(tabs)/training.tsx`: Loại bỏ nút tạo "Today's Workout" và chỉnh sửa UI.
- `src/features/training/hooks/use-active-session.ts`: Thêm logic xác nhận lưu template trước khi hoàn tất và lưu.
- `app/training/session.tsx`: Nhúng modal `SaveWorkoutTemplateModal` cho phép người dùng đặt tên và chọn lưu.
- `app/training/weekly-plan/[id].tsx`: Tích hợp thêm nút và luồng tạo nhanh Workout Template trong Modal Chọn Workout.
- `src/i18n/locales/en.json`, `ja.json`: Thêm key dịch thuật mới.

---

## Objective
Refactor toàn bộ hệ thống từ "Workout Routine" sang "Workout Template" để thống nhất thuật ngữ, dọn dẹp database schema (loại bỏ is_template, schedule_days), cập nhật repository, state management, và UI screens.

## Status
- [x] Schema DB: Cập nhật SQLite schema và Supabase sql schemas (đổi tên bảng, bỏ cột thừa) ✅ Done
- [x] Cập nhật các câu SQL ở `init.sql`, `seed.sql`, `delete_account.sql`, và logic tại `sync-service.ts` ✅ Done
- [x] Cập nhật Repository Layer: `workout-template.repository.ts`, `weekly-plan.repository.ts`, `workout.repository.ts` ✅ Done
- [x] Cập nhật State Management: `workout.store.ts`, `weekly-plan.store.ts` ✅ Done
- [x] Cập nhật UI & Custom Hooks: `use-active-session.ts`, `session.tsx`, `weekly-plan/[id].tsx`, `home.tsx` ✅ Done
- [x] Cập nhật i18n (`en.json`, `ja.json`) từ Routine sang Template ✅ Done
- [x] Chạy TypeScript compiler pass 100% không lỗi ✅ Done

## Changes
- Các reference cũ về `Workout Routine` đã được dọn dẹp sạch sẽ thành `Workout Template` từ DB cho tới tầng giao diện người dùng.
- Thao tác này giúp kiến trúc database chuẩn chỉnh ngay từ ban đầu cho quá trình phát triển dài hạn.
---

## Objective
Kh?c ph?c l?i kh�ng hi?n th? hanko tr�n Calendar ? m�n h�nh Home.

## Status
- [x] S?a l?i \stampedDates\ kh�ng du?c fetch t? local database. ? Done

## Changes
- \pp/(tabs)/home.tsx\: Thay th? tr?ng th�i tinh (r?ng) b?ng \useQuery\ d? g?i \WorkoutRepository.getHankoStampedDates(userId)\ v� truy?n k?t qu? xu?ng l?ch.
---

## Objective
Th�m icon ph�n bi?t cho t?ng nh�m co t?i danh s�ch b�i t?p (Today's Routine) tr�n m�n h�nh Home.

## Status
- [x] C?p nh?t truy v?n SQLite trong \getExercisesForDate\ d? tr? v? \muscle_group_id\. ? Done
- [x] Vi?t h�m \getMuscleGroupIcon\ d? map \muscle_group_id\ sang icon Ionicons tuong ?ng. ? Done
- [x] �p d?ng icon d?ng v�o \ctiveRoutine\ t?i \home.tsx\. ? Done

## Changes
- \src/infra/repositories/workout.repository.ts\: C?p nh?t \getExercisesForDate\ query l?y th�m c?t \muscle_group_id\.
- \pp/(tabs)/home.tsx\: Th�m h�m \getMuscleGroupIcon\ �nh x? t? \mg-chest\, \mg-back\... sang c�c Ionicons nhu \ody\, \ccessibility\, \itness\, \walk\, v.v.
---

## Objective
Hi?n th? icon nh�m co tuong ?ng b�n c?nh t�n nh�m co ? m�n h�nh Session.

## Status
- [x] �ua logic �nh x? icon ra file \src/constants/icons.ts\. ? Done
- [x] �p d?ng \getMuscleGroupIcon\ v�o component \SessionScreen\ (\session.tsx\) d? render Ionicons. ? Done

## Changes
- T?o \src/constants/icons.ts\ ch?a \getMuscleGroupIcon\.
- S?a \home.tsx\ d? d�ng chung h�m n�y thay v� d?nh nghia l?i.
- S?a \pp/training/session.tsx\: Wrap ch? nh�m co (muscleGroupText) trong \View\ row v?i icon d? hi?n th? tr?c quan hon.
---

## Objective
Kh?c ph?c l?i build TypeScript li�n quan d?n type \WorkoutTemplateExercise\.

## Status
- [x] S?a l?i \'name' does not exist in type 'WorkoutTemplateExercise'\ t?i \pp/training/library.tsx\ v� \pp/training/exercise/[id].tsx\. ? Done

## Changes
- \pp/training/library.tsx\: C?p nh?t \handleSelectExercise\ d? nh?n v� truy?n \
ame_ja\, \
ame_en\ thay v� ch? truy?n \
ame\.
- \pp/training/exercise/[id].tsx\: C?p nh?t payload c?a h�m \ddExercise\ v?i \
ame_ja\ v� \
ame_en\.
- Ch?y \
px tsc --noEmit\ th�nh c�ng kh�ng c�n l?i.
---

## Objective
Thay th? icon Ionicons th�ng d?ng b?ng b? Custom SVG anatomical icons chi ti?t, th? hi?n r� c�c nh�m co du?c highlight tr�n m� h�nh co th?.

## Status
- [x] T?o component \MuscleGroupIcon\ ch?a c�c path SVG tuong ?ng cho 10 nh�m co. ? Done
- [x] �p d?ng \MuscleGroupIcon\ cho m�n h�nh Home (Routines list). ? Done
- [x] �p d?ng \MuscleGroupIcon\ cho m�n h�nh Session (Edit Template - Muscle Groups grid). ? Done
- [x] �� verify TypeScript bi�n d?ch th�nh c�ng kh�ng l?i. ? Done

## Changes
- T?o m?i component \src/components/MuscleGroupIcon.tsx\ h? tr? props \id\, \size\, \color\. M?i nh�m co du?c thi?t k? v?i h�nh d�ng vector d?c trung (d�i, ng?c, vai, lung x�, c�nh tay, m�ng, b?ng...) s? d?ng ki thu?t highlight m�u tr�n silhouette c� s?n c?a co th? d? t?o s? d?ng nh?t v� chuy�n nghi?p.
- S?a \pp/(tabs)/home.tsx\ d? render component m?i thay cho \Icon\ cu.
- S?a \pp/training/session.tsx\ d? thay th? \Ionicons\ trong lu?i ch?n nh�m co.
---

## Objective
Tang k�ch thu?c icon v� tinh ch?nh n�t v? SVG d? m� ph?ng h�nh th? ngu?i th? thao/gi?i ph?u h?c th?c t? hon, tr�nh c?m gi�c ho?t h�nh (cartoonish).

## Status
- [x] Thi?t k? l?i h�nh d�ng silhouette co th? th? thao (athletic body silhouette) chu?n ch?nh trong \MuscleGroupIcon.tsx\. ? Done
- [x] Tang k�ch thu?c hi?n th? icon l�n \22\ ? m�n h�nh Home v� \20\ ? m�n h�nh Session. ? Done
- [x] �� ch?y ki?m th? TypeScript ho�n t?t. ? Done
---

## Objective
V? l?i ho�n to�n c�c du?ng d?n (Path) c?a co lung/vai d?a theo h�nh v? gi?i ph?u \ack (1).png\ v� \ack.png\ t? b? icon Flaticon m?u.

## Status
- [x] Tr�ch xu?t c?u tr�c v� v? l?i c�c path chi ti?t: C?, Co c?u vai (Traps), Co vai (Deltoids), Co lung x� (Lats), Lung du?i (Erector Spinae), Xuong s?ng (Spine), C�nh tay (Arms) trong \MuscleGroupIcon.tsx\ s? d?ng h? t?a d? 100x100 c� d? ch�nh x�c cao. ? Done
- [x] �p d?ng c�c thay d?i m�u s?c v� vi?n bo theo phong c�ch g?c:
  - Vi?n d�y n�t tr�n: \strokeColor\
  - M�u n?n: m�u x�m t�m g?c (\#9ea7ba\)
  - M�u co t?p ch�nh: m�u d? (\#ff0044\)
  - M�u co t?p ph?: m�u cam d�o (\#ff804e\)
- [x] TypeScript bi�n d?ch th�nh c�ng. ? Done
