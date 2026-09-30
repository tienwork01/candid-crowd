# Báo Cáo Rà Soát: Xử Lý Lưu Trữ (Storage) & Endpoint API Frontend

> **Ngày thực hiện:** 28/09/2026  
> **Phạm vi rà soát:** Toàn bộ logic frontend (`candid-cowd-fe`), kiểm tra các thao tác ghi dữ liệu vào `localStorage`, `sessionStorage`, `IndexedDB` và so sánh với việc gọi các endpoint backend (`candidcrowd-be`).

---

## 1. Tóm tắt kết quả (Executive Summary)

Qua rà soát toàn bộ source code frontend, hệ thống ghi nhận **2 lỗi logic nghiệp vụ nghiêm trọng** (dữ liệu người dùng nhập/tùy biến chỉ được lưu cục bộ trên máy mà không hề được gửi lên backend), **1 cơ chế offline fallback chưa có outbox sync**, và **1 cơ chế IndexedDB hàng đợi upload offline đúng thiết kế**.

---

## 2. Chi tiết các vấn đề phát hiện

### Vấn đề 1: Cấu hình tùy biến mã QR chỉ lưu vào `localStorage`, hoàn toàn chưa có endpoint backend

- **Mức độ nghiêm trọng:** **Cao** (Data loss giữa các thiết bị)
- **File liên quan:**
  - [`src/features/event/lib/qr-customize-storage.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/lib/qr-customize-storage.ts#L6-L16)
  - [`src/features/event/components/qr-customize/qr-customize-modal.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/qr-customize/qr-customize-modal.tsx#L71-L81)
  - [`src/features/event/components/event-overview-view.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/event-overview-view.tsx#L1145-L1156)
  - [`src/features/event/components/ready-page-client.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/ready-page-client.tsx#L215-L231)
  - [`src/features/event/components/print/event-print-modal.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/print/event-print-modal.tsx#L168)
  - [`src/features/event/components/event-ready-card.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/event-ready-card.tsx#L45)

#### Hiện trạng code:

1. Khi Host tùy biến mã QR (chọn màu sắc `primaryColor`, kiểu chấm `dotStyle`, kiểu góc `cornerStyle`, khung `frameStyle`, logo `logoUrl`), modal gọi:
   ```typescript
   // qr-customize-modal.tsx: dòng 76
   saveQRConfig(event.id, config);
   onApplied?.(config);
   ```
2. Hàm `saveQRConfig` ghi toàn bộ cấu hình vào `localStorage`:
   ```typescript
   // qr-customize-storage.ts: dòng 12
   localStorage.setItem(`cc_qr_config_${eventId}`, JSON.stringify(config));
   ```
3. Callback `onApplied` trong các trang cha (`ready-page-client.tsx`, `event-overview-view.tsx`) chỉ gửi một cờ đánh dấu checklist:
   ```typescript
   void updateEvent({
     id: event.id,
     setup_checklist: {
       customizedQr: true,
     },
   });
   ```
4. Kiểu dữ liệu `CandidEvent` trong frontend và backend hiện **không có trường nào** để lưu trữ `qr_config`.

#### Hậu quả:

- Cấu hình thiết kế mã QR của Host chỉ tồn tại trên trình duyệt hiện tại.
- Khi Host đổi sang máy tính khác, mở trên điện thoại, in ấn từ thiết bị khác, hoặc xóa cache trình duyệt, toàn bộ thiết kế QR đã tạo sẽ bị mất và trở về giao diện mặc định.

#### Đề xuất khắc phục:

1. Bổ sung trường `qr_config` (hoặc `qr_theme`) vào model Event ở backend Go.
2. Thêm `qr_config` vào `CandidEvent` type và `UpdateEventInput` trong [`src/features/event/types/event.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/types/event.ts).
3. Trong `onApplied`, truyền `qr_config` vào hàm `updateEvent` để gửi `PATCH /api/v1/events/:id`.

---

### Vấn đề 2: Tên khách mời & Ghi chú/Lời chúc ảnh chỉ lưu cục bộ, bị bỏ rơi khỏi endpoint upload

- **Mức độ nghiêm trọng:** **Cao** (Mất tính năng tương tác cốt lõi của sản phẩm)
- **File liên quan:**
  - [`src/features/event/components/guest-event-view.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/components/guest-event-view.tsx#L514-L521)
  - [`src/features/upload/hooks/use-guest-upload.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/upload/hooks/use-guest-upload.ts#L184-L225)
  - [`src/features/pwa/lib/upload-queue-db.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/pwa/lib/upload-queue-db.ts#L13-L14)

#### Hiện trạng code:

1. Tại giao diện tải ảnh dành cho khách mời (`guest-event-view.tsx`), khách có thể nhập:
   - **Tên hiển thị** (`guestName`)
   - **Lời chúc / Ghi chú cho ảnh** (`guestNote`)
2. Khi bắt đầu upload:
   ```typescript
   // guest-event-view.tsx: dòng 517
   localStorage.setItem("candidcrowd_guest_name", guestName.trim());
   ```
   Tên khách chỉ được lưu vào `localStorage` của trình duyệt khách.
3. Khi gọi hàm `uploadFile`:
   ```typescript
   // use-guest-upload.ts
   // B1: Gọi lấy upload target
   const response = await publicClient.post<UploadTargetResponse>(
     `/api/v1/public/events/${encodeURIComponent(slug)}/uploads`,
     {
       filename: file.name,
       mime_type: optimized.type,
       size: optimized.size,
       checksum_sha256: checksumSHA256,
       client_upload_id: queueID,
       guest_session_token: token,
       //  guestName và guestNote KHÔNG được truyền ở đây
     },
   );

   // B2: PUT binary lên Cloudflare R2 presigned URL
   await putToPresignedURL(target, optimized, options.onProgress);

   // B3: Gọi xác nhận hoàn tất
   await publicClient.post(
     `/api/v1/public/events/${encodeURIComponent(slug)}/uploads/${target.media_id}/complete`,
     { guest_session_token: token },
     //  guestName và guestNote cũng KHÔNG được truyền ở đây
   );
   ```
4. Sau khi upload thành công, frontend tự tạo object cục bộ gán vào React state:
   ```typescript
   // guest-event-view.tsx: dòng 561-572
   const mediaItem: EventMediaItem = {
     id: uploaded.id,
     url: uploaded.url,
     caption:
       guestNote.trim() || currentTarget.file.name.replace(/\.[^/.]+$/, ""),
     guest_name: guestName.trim() || "Guest",
     created_at: new Date().toISOString(),
     status: "ready",
     is_video: currentTarget.isVideo,
     likes_count: 0,
   };
   successfulUploadedItems.push(mediaItem);
   setLocalGalleryMedia((prev) => [...successfulUploadedItems, ...prev]);
   ```

#### Hậu quả:

- `guest_name` và `caption` chỉ xuất hiện tạm thời trên màn hình của chính khách mời vừa upload bức ảnh đó.
- Khi tải lại trang hoặc xem từ phía Host (Event Overview, Gallery View, Live Wall, Lightbox), backend trả về `guest_name: null` và `caption: null`. Khách khác hoặc Host không thể biết ai là người gửi ảnh và lời chúc kèm theo là gì.

#### Đề xuất khắc phục:

1. Mở rộng `useGuestUpload.uploadFile` nhận thêm `guestName?: string` và `caption?: string`.
2. Truyền `guest_name` và `caption` vào payload request `POST /api/v1/public/events/${slug}/uploads` (hoặc `/complete`).
3. Cập nhật `savePendingUpload` trong IndexedDB để lưu cả `guestName` và `guestNote` (trong type `PendingUploadItem` đã định nghĩa sẵn nhưng chưa truyền giá trị).

---

### ⚠️ Vấn đề 3: Mock Event Store & Local Repository ghi vào `localStorage` khi offline mà không có Outbox Sync

- **Mức độ nghiêm trọng:** **Trung bình**
- **File liên quan:**
  - [`src/features/event/lib/event-store.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/lib/event-store.ts) (key `candidcrowd.events.v1`)
  - [`src/features/event/hooks/use-create-event.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/hooks/use-create-event.ts#L61-L68)
  - [`src/features/event/lib/media-repository.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/event/lib/media-repository.ts#L351-L398)

#### Hiện trạng code:

1. Khi `useCreateEvent` gặp lỗi không kết nối được tới backend (`isBackendUnreachable`), hàm sẽ chạy nhánh fallback:
   ```typescript
   return createLocalEvent({
     name: input.name,
     event_type: input.event_type,
     event_date: input.event_date,
     date_unknown: Boolean(input.date_unknown),
     expected_guest_count: input.expected_guest_count,
   });
   ```
   Hàm này tự tạo `id: evt_...` và ghi đè vào `localStorage`.
2. Trong `CompositeEventMediaRepository`, các thao tác `deleteMedia`, `batchDeleteMedia`, `updateStatus`, `batchUpdateStatus` có khối `catch {} finally { await this.local.... }`. Khi remote thất bại, thay đổi vẫn được ghi vào `localStorage`.
3. Hàm `addStoredMediaItem` trong `event-store.ts` thêm media vào `localStorage` mà không gọi API.

#### Hậu quả:

- Khi chạy offline, người dùng có cảm giác event/thao tác đã được tạo/lưu, nhưng thực chất dữ liệu kẹt lại trong `localStorage` và không bao giờ được đồng bộ lên Go backend khi có mạng trở lại.

#### Đề xuất khắc phục:

- Cần hiển thị cảnh báo rõ ràng cho Host khi đang ở chế độ "Local Only" (Offline), hoặc xây dựng Outbox Queue để tự động phát hiện mạng và gửi lại request tạo event/cập nhật media lên backend.

---

### ℹ️ Vấn đề 4: IndexedDB Upload Queue (`upload-queue-db.ts`) — Lưu trữ tiền xử lý upload

- **Mức độ nghiêm trọng:** ℹ️ **Thông tin / Đúng thiết kế PWA**
- **File liên quan:**
  - [`src/features/pwa/lib/upload-queue-db.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/pwa/lib/upload-queue-db.ts#L55-L74)
  - [`src/features/upload/hooks/use-guest-upload.ts`](file:///home/acer/Desktop/work/candid-cowd-fe/src/features/upload/hooks/use-guest-upload.ts#L151)
  - [`src/app/offline/offline-view.tsx`](file:///home/acer/Desktop/work/candid-cowd-fe/src/app/offline/offline-view.tsx#L29-L65)

#### Hiện trạng:

- Trước khi gửi bất kỳ request nào lên server, file Blob được lưu vào IndexedDB (`candidcrowd_pwa_db` -> `pending_uploads`).
- Khi upload R2 xong và `/complete` thành công, item mới bị xóa khỏi IndexedDB.
- **Điểm cần lưu ý:** Nếu người dùng mất mạng trong quá trình upload, file vẫn nằm trong IndexedDB. Trang `/offline` hiện tại chỉ đọc ra để hiển thị thumbnail ảnh xem trước, chưa có nút bấm hoặc background sync để tự động chạy lại luồng upload cho các file bị kẹt.

---

## 3. Bảng tổng hợp toàn bộ các điểm lưu trữ trên Frontend

| Phân loại     | Dữ liệu lưu                               | Vị trí lưu                                          | Có gọi Endpoint không?                                    | Đánh giá & Hướng xử lý                                                 |
| :------------ | :---------------------------------------- | :-------------------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Nghiệp vụ** | Cấu hình tùy biến QR (`QRCustomizeState`) | `localStorage` (`cc_qr_config_*`)                   | ❌ **Không** (chỉ gọi update checklist)                   | 🚨 **Lỗi:** Cần bổ sung endpoint/field để lưu cấu hình QR trên backend |
| **Nghiệp vụ** | Tên khách (`guestName`)                   | `localStorage` (`candidcrowd_guest_name`)           | ❌ **Không** (bị bỏ quên ở form upload)                   | 🚨 **Lỗi:** Cần bổ sung vào payload `uploads` hoặc `complete`          |
| **Nghiệp vụ** | Lời chúc/Ghi chú ảnh (`guestNote`)        | Transient React State                               | ❌ **Không** (bị bỏ quên ở form upload)                   | 🚨 **Lỗi:** Cần bổ sung vào payload `uploads` hoặc `complete`          |
| **Offline**   | Event & Media offline                     | `localStorage` (`candidcrowd.events.v1`)            | ❌ **Không** (chỉ chạy khi backend unreachable)           | ⚠️ Thiếu cơ chế Outbox Sync khi có mạng trở lại                        |
| **PWA Cache** | File Blob đang chờ upload                 | `IndexedDB` (`pending_uploads`)                     | ⏳ **Có gọi sau đó**, kẹt lại nếu mất mạng                | Đúng thiết kế PWA, nên thêm tính năng retry queue tại trang offline    |
| **Session**   | Mã phiên khách (`guest_session_token`)    | `sessionStorage` (`candidcrowd.guest-session.*`)    | **Có** (gọi `POST /public/events/:slug/sessions` trước)   | Hợp lệ (Cache token phiên làm việc)                                    |
| **Session**   | Live Wall Player Session                  | `sessionStorage` (`cc_live_wall_session_*`)         | **Có** (gọi `POST /live-wall/sessions` trước)             | Hợp lệ (Cache trạng thái player)                                       |
| **Nghiệp vụ** | Theme trang sự kiện của khách             | `localStorage` (`cc_guest_theme_*`)                 | **Có** (gọi `PATCH /api/v1/events/:id` với `guest_theme`) | Hợp lệ (`localStorage` làm cache offline)                              |
| **Auth**      | Cache thông tin Host Profile / Accounts   | `sessionStorage` (`candidcrowd_host_profile_cache`) | **Có** (gọi `authClient.getSession()` trước)              | Hợp lệ (Tối ưu hóa tránh giật layout)                                  |
| **UI State**  | Đánh dấu ẩn banner PWA install            | `localStorage` (`candidcrowd_pwa_dismissed`)        | ❌ Không                                                  | Hợp lệ (Trạng thái UI cục bộ)                                          |
| **Locale**    | Lựa chọn ngôn ngữ (`NEXT_LOCALE`)         | Cookie trình duyệt                                  | **Có** (gọi Server Action `updateLocaleAction`)           | Hợp lệ                                                                 |
