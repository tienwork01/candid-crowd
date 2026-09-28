# Live Wall — kế hoạch tối ưu cho buổi trình diễn

## 1. Mục tiêu

Biến Live Wall từ một slideshow mở trong host dashboard thành một trải nghiệm trình chiếu đáng tin cậy tại venue:

```text
Host mở control panel
  → tạo một phiên trình chiếu riêng
  → mở URL player trên TV/máy chiếu
  → ảnh/video đã được phép xuất hiện liên tục
  → host điều khiển kín từ laptop hoặc điện thoại
  → khách nhìn thấy CTA/QR rõ ràng để đóng góp
```

Tiêu chí thành công của MVP trình chiếu:

- Không lặp lại 24 ảnh đầu khi event có nhiều media.
- Ảnh và video đều hiển thị đúng, không có khung vỡ hoặc màn hình đen lúc chuyển nội dung.
- Host có thể pause, next, previous, blackout và dừng trình chiếu mà không đi tới máy chiếu.
- Media `hidden` không thể xuất hiện; chế độ mặc định cho event công khai là chỉ phát `featured`.
- Khi Wi-Fi bị mất rồi khôi phục, player tự đồng bộ lại và báo rõ trạng thái thay vì đứng im không rõ lý do.
- QR CTA quét được từ khoảng cách thực tế của venue; không chỉ là một badge nhỏ ở góc màn hình.

## 2. Hiện trạng và các lỗi cần xử lý

Component hiện tại: `src/features/event/components/event-live-wall-modal.tsx`.

| Vấn đề                             | Nguyên nhân hiện tại                                                        | Hậu quả khi trình diễn                                         |
| ---------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Chỉ có 24 item                     | `useEventMedia` mặc định phân trang 24, modal không gọi `fetchNextPage`     | Slideshow lặp sớm và không đại diện cho toàn bộ event          |
| Video không được render            | Mọi item đi qua thẻ `<img>` dù model có `is_video`                          | Video hiện lỗi/hỏng thay vì phát                               |
| QR quá nhỏ                         | QR 280px bị render CSS ở 64×64px                                            | Khách ở xa gần như không quét được                             |
| Không có queue an toàn             | Wall dùng mọi item khác `hidden`                                            | Ảnh mới có thể lên màn hình trước khi host duyệt               |
| Modal phụ thuộc dashboard          | Player chạy trong workspace có host auth                                    | Không phù hợp để dành một máy cho TV/projector; lộ UI vận hành |
| Control rất ít                     | Chỉ có pause, fullscreen, close                                             | Không có thao tác khẩn cấp hay cách điều phối nhịp sân khấu    |
| Chưa có trạng thái mạng cho player | SSE đã có reconnect ở tầng dùng chung nhưng modal không hiển thị trạng thái | Operator không biết màn chiếu có đang nhận media mới không     |
| Chuyển ảnh không có crossfade thực | CSS đặt `transition: opacity` nhưng opacity không thay đổi theo item        | Cảm giác nhảy hình, nhất là trên màn LED lớn                   |

## 3. Quyết định sản phẩm

### 3.1 Hai bề mặt, một phiên trình chiếu

Không mở rộng modal hiện có thành toàn bộ sản phẩm Live Wall. Tách thành hai bề mặt:

1. **Player**: URL dành riêng cho TV/máy chiếu; chỉ hiển thị nội dung cho khán giả.
2. **Control panel**: trong host workspace, dùng tốt trên laptop và điện thoại; điều khiển player theo thời gian thực.

Player không hiển thị menu host, thao tác moderation hay URL có quyền chủ event. Control panel luôn là nơi có quyền thay đổi nội dung.

### 3.2 Chế độ nội dung

MVP dùng ba policy rõ ràng, không suy luận từ UI:

| Policy          | Media được phát                    | Dùng khi                                            |
| --------------- | ---------------------------------- | --------------------------------------------------- |
| `featured_only` | chỉ `featured`                     | mặc định cho wedding, corporate, màn hình công cộng |
| `auto_approved` | `ready` và `featured`, bỏ `hidden` | party kín, host chấp nhận phát tự động              |
| `manual_queue`  | chỉ item host thêm vào queue       | chương trình có MC/brand nhạy cảm                   |

MVP phải có `featured_only` và `auto_approved`. `manual_queue` làm sau khi luồng player/control ổn định; không chặn việc ra mắt v1.

### 3.3 Không phát nội dung có âm thanh mặc định

- Video autoplay bắt đầu muted và `playsInline`.
- Không phát audio bất ngờ qua hệ thống loa của venue.
- Host chỉ bật audio nếu phiên sau này hỗ trợ rõ ràng; không đưa vào MVP.
- Video có thời lượng tối đa cấu hình được; nếu metadata chưa sẵn sàng, bỏ qua an toàn thay vì làm player treo.

## 4. Luồng trải nghiệm đích

### 4.1 Trước giờ diễn

1. Host vào tab **Engage → Live Wall**, chọn policy, tỷ lệ màn hình và theme đã áp dụng cho guest page.
2. Host bấm **Launch Live Wall**. Hệ thống tạo một `live_wall_session` có URL player ngắn hạn.
3. Host mở URL trên máy chiếu hoặc gửi URL cho đội AV.
4. Player bắt đầu bằng **welcome/CTA slide**: tên event, QR lớn, lời nhắc ngắn “Quét để chia sẻ ảnh & video”.
5. Control panel hiển thị trạng thái `Connected`, số media đủ điều kiện và preview nội dung kế tiếp.

### 4.2 Trong lúc diễn

1. Player chạy slideshow theo playlist đang đủ điều kiện.
2. Media mới được nhận qua realtime; client preload ảnh/video tiếp theo trước lúc cần hiển thị.
3. Host có thể pause, next, previous, restart CTA, blackout, ẩn ảnh đang phát và chuyển policy.
4. Nếu không có media: giữ CTA slide, không để một empty state kỹ thuật trên màn hình.
5. Khi kết nối bị gián đoạn: player tiếp tục phát nội dung đã preload; một chỉ báo nhỏ chỉ xuất hiện cho operator, không làm khán giả hoang mang.

### 4.3 Kết thúc

1. Host bấm **End session** từ control panel.
2. Player chuyển sang slide cảm ơn + QR thu thập ảnh sau event.
3. Sau thời gian grace period (ví dụ 10 phút) session token hết hạn; có thể revoke ngay.
4. Host dashboard lưu analytics của phiên, không lưu URL/player token dạng plaintext.

## 5. Thiết kế UI/UX

### 5.1 Player — màn dành cho khán giả

Mặc định là landscape 16:9; hỗ trợ preset 9:16 cho màn hình dọc. Không hiển thị UI control thường trực trước khách.

**Khu vực hiển thị**

- Ảnh đặt trong safe frame với `object-fit: contain`; dùng nền theme tối, trung tính để ảnh dọc/ngang đều đẹp.
- Ảnh dọc không bị crop. Với ảnh ngang, không ép fill làm mất chủ thể.
- Caption/credit chỉ hiện khi host bật; giới hạn hai dòng và gradient nền đủ contrast.
- Crossfade bằng `opacity`/`transform` trong 350–500ms. Với `prefers-reduced-motion`, thay bằng đổi ảnh không animation.
- Ảnh sau và video sau được preload; chỉ commit scene mới khi asset có thể render.

**CTA / idle slide**

- QR diện tích tối thiểu khoảng 220–280 CSS px ở layout 1080p; có quiet zone trắng xung quanh.
- Có event name, câu CTA ngắn, URL dễ gõ và “No app needed”.
- Luân phiên CTA khi không có nội dung và sau mỗi N media/cấu hình thời gian. Không phủ QR nhỏ lên mọi ảnh.
- Không đặt nội dung thiết yếu ở mép màn hình; dành safe area tối thiểu 5% mỗi cạnh cho projector/LED bị crop.

**Chất lượng nhìn từ xa**

- Chỉ dùng text lớn, white/off-white trên background tối đã kiểm tra contrast.
- Không dùng body text dưới 18px trong player; CTA và event name dùng thang type riêng cho màn hình lớn.
- Người xem chỉ cần hiểu: đây là event gì, họ phải làm gì, QR ở đâu. Không đưa counter `x / y` hay thông tin dashboard lên sân khấu.

### 5.2 Control panel — màn dành cho host

Control panel là một drawer/page trong workspace, gồm:

| Nhóm      | Điều khiển                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Transport | play/pause, previous, next, thời lượng mỗi ảnh, restart CTA                         |
| Safety    | blackout, hide current media, switch `featured_only` / `auto_approved`, end session |
| Content   | current item, next 3 items, số ảnh đủ điều kiện, thumbnail queue                    |
| Display   | fullscreen hint, 16:9/9:16, show captions, show credits, CTA interval               |
| Health    | player online/offline, stream connected/reconnecting, media preload error           |

Blackout là action nguy hiểm nhưng phải một chạm, có xác nhận ngắn khi bật. `End session` cần confirm dialog. Các icon-only control bắt buộc có tên truy cập được, visible focus ring và touch target ít nhất 44px.

### 5.3 Keyboard cho operator

Khi focus ở player/control panel:

- `Space`: play/pause.
- `ArrowRight` / `ArrowLeft`: next/previous.
- `B`: blackout toggle.
- `C`: CTA slide.
- `Esc`: đóng overlay cục bộ; không vô tình kết thúc session.

Shortcut phải hiện trong control panel, không chiếm phím khi focus đang ở input, và có nút UI tương đương cho mọi thao tác.

## 6. Kiến trúc kỹ thuật

### 6.1 Frontend

Thêm feature theo cấu trúc hiện có:

```text
src/features/event/
  components/live-wall/
    live-wall-control-panel.tsx
    live-wall-player.tsx
    live-wall-stage.tsx
    live-wall-cta-slide.tsx
    live-wall-transport.tsx
    index.ts
  hooks/
    use-live-wall-session.ts
    use-live-wall-player.ts
  lib/
    live-wall-playlist.ts
    live-wall-preload.ts
  types/
    live-wall.ts
```

- Giữ `EventLiveWallModal` chỉ như entry point/migration shell trong phase 0; sau phase 1 thay nó bằng launch dialog + link player.
- Player route là frontend route, nhưng mọi domain data gọi Go backend qua `NEXT_PUBLIC_API_BASE_URL`; không tạo Next.js route business API.
- Dùng component barrel `components/live-wall/index.ts`.
- Dùng Phosphor icons, `next-intl` cho toàn bộ string UI, và giữ đủ key parity cho 7 locale.
- CSS custom tuân BEM: `live-wall-player`, `live-wall-player__stage`, `live-wall-control--blackout`.

### 6.2 Backend (Go/Gin)

Thêm API sở hữu bởi `candidcrowd-be`, không đưa sang `src/app/api` của Next.js.

#### Dữ liệu bền vững

`live_wall_sessions`:

```text
id UUID PK
event_id UUID FK
status: preparing | live | ended | revoked
content_policy: featured_only | auto_approved | manual_queue
aspect_ratio: landscape_16_9 | portrait_9_16
show_caption boolean
show_credit boolean
cta_interval integer nullable
token_hash text
expires_at timestamptz
ended_at timestamptz nullable
created_by_user_id UUID
created_at, updated_at
```

Runtime state (current item, playing, blackout, requested CTA) nên để Redis với TTL theo session. Nó có thể được tái tạo từ DB settings + playlist khi Redis mất; không dùng Redis như source of truth cho quyền hay lịch sử.

#### API đề xuất

| Endpoint                                                              | Quyền        | Mục đích                                          |
| --------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `POST /api/v1/events/:eventId/live-wall-sessions`                     | host         | tạo/reuse session và trả player URL/token một lần |
| `GET /api/v1/events/:eventId/live-wall-sessions/:sessionId`           | host         | state cho control panel                           |
| `PATCH /api/v1/events/:eventId/live-wall-sessions/:sessionId`         | host         | chỉnh settings/policy                             |
| `POST /api/v1/events/:eventId/live-wall-sessions/:sessionId/commands` | host         | play, pause, next, previous, blackout, CTA, end   |
| `POST /api/v1/events/:eventId/live-wall-sessions/:sessionId/revoke`   | host         | thu hồi player ngay                               |
| `GET /api/v1/public/live-wall-sessions/:token`                        | player token | bootstrap config + playlist ban đầu               |
| `GET /api/v1/public/live-wall-sessions/:token/stream`                 | player token | SSE cho commands, media changes, health           |

Không truyền JWT host qua URL player. Player token phải random, ngắn hạn, chỉ lưu hash ở database và chỉ có scope read cho session đó. Referrer policy của player phải tránh gửi token ra ngoài.

### 6.3 Realtime và playlist

- Tái sử dụng realtime hub/Redis hiện có cho `media.created`, `media.updated`, `media.deleted`, `media.thumbnail.ready`.
- Bổ sung event scope session: `live_wall.command` và `live_wall.state` cho player/control tương ứng.
- Media event chỉ là tín hiệu. Khi player reconnect/resync, gọi endpoint snapshot để lấy playlist/state đúng thay vì tin vào event bị bỏ lỡ.
- Playlist không chỉ giữ page đầu. Dùng cursor và buffer có giới hạn: load trước 12 item, khi còn dưới 5 item thì lấy page kế tiếp; tránh tải toàn bộ event hàng nghìn ảnh vào RAM.
- Với `sort=newest`, chỉ đưa item mới vào sau item hiện tại hoặc theo policy “new arrivals first”; không dịch item đang trình chiếu.
- Deduplicate theo `media.id`; khi media bị `hidden`/deleted, bỏ khỏi playlist ngay. Nếu đang phát, chuyển fade về CTA hoặc item tiếp theo.

### 6.4 Media delivery và hiệu năng

- Player dùng thumbnail variant cho preview/preload, nhưng tải original/variant phù hợp màn chiếu trước khi commit ảnh chính.
- Không dùng Next image optimizer cho signed R2 URLs; giữ nguyên chiến lược bypass hiện tại khi cần.
- Với video, browser chỉ preload metadata/ảnh poster trước; không tự tải nhiều video lớn đồng thời.
- Thiết lập retry có giới hạn cho asset lỗi. Sau retry, bỏ item, ghi telemetry và tiếp tục trình chiếu.
- Không làm slideshow block vì một ảnh signed URL hết hạn: refresh snapshot và URL trước khi retry.

## 7. Kế hoạch triển khai theo phase

### Phase 0 — sửa để modal hiện tại không làm hỏng buổi diễn

Mục tiêu: có thể dùng tại event nhỏ ngay cả khi chưa có player route riêng.

- [x] Render `video` đúng khi `is_video`; muted, playsInline và fallback chuyển item khi video lỗi.
- [x] Thêm infinite playlist: `fetchNextPage` khi gần item cuối; không loop trước khi hết toàn bộ page đã biết.
- [x] Preload item tiếp theo; áp dụng fade-in bằng `opacity`/`transform` và tôn trọng reduced motion.
- [x] Thêm previous/next, CTA slide, blackout, keyboard shortcut và focus styling.
- [x] Thay QR badge 64px bằng CTA slide QR lớn.
- [x] Thêm toggle `featured_only`/`auto_approved`, mặc định `featured_only` cho Live Wall mới.
- [x] Hiển thị status realtime/reconnecting trong control chrome.
- [x] Xử lý `fullscreenchange` để UI không sai trạng thái khi người dùng thoát fullscreen bằng phím hệ thống.

**Definition of done**: event 100 ảnh + 5 video phát được hết không lặp page đầu; host có thể điều khiển bằng bàn phím; QR CTA quét được từ ảnh chụp màn 1080p.

### Phase 1 — player và control panel độc lập

Mục tiêu: dùng đáng tin cậy với laptop + projector hoặc TV riêng.

- [ ] Migration, repository, service, handler và tests cho `live_wall_sessions`.
- [ ] API tạo, đọc, update, revoke session; token hash và expiry.
- [ ] Player route độc lập, bootstrap qua token; không render host workspace.
- [ ] Control panel host điều khiển session qua backend commands.
- [ ] SSE player/control, snapshot resync và heartbeat/connection state.
- [ ] Cơ chế CTA/thank-you slide; session end/revoke và grace period.
- [ ] Thêm metrics cơ bản: session launched, player connected, QR screen scans, media shown/skipped, reconnect count.

**Definition of done**: host điều khiển player từ thiết bị khác; refresh player vẫn quay lại state hợp lệ; revoke làm player mất quyền trong vòng một heartbeat.

### Phase 2 — điều phối nội dung chuyên nghiệp

Mục tiêu: phù hợp chương trình có MC, thương hiệu hoặc yêu cầu moderation cao.

- [ ] `manual_queue`: add/remove/reorder, pin media, approve batch.
- [ ] Preview thumbnail queue và “currently on screen” trong dashboard.
- [ ] Lịch CTA theo thời gian/số media; prompt theo Event Mode.
- [ ] Theme presentation riêng, các preset 16:9/9:16, branded opening/intermission card.
- [ ] Điều khiển từ điện thoại bằng layout ưu tiên touch; optional presenter notes.
- [ ] Audit log: media bị ẩn/skip bởi ai và lúc nào.

**Definition of done**: operator có thể xử lý ảnh không phù hợp trước/đang phát, không phải truy cập gallery grid hay chạm máy chiếu.

## 8. Kiểm thử và nghiệm thu

### Functional

- 0 media: CTA slide ổn định.
- 1 ảnh, nhiều ảnh, hơn 24 ảnh, hơn 500 ảnh: không loop sai và không tăng memory vô hạn.
- Ảnh dọc/ngang, HEIC đã xử lý, thumbnail chưa sẵn sàng, URL hết hạn.
- Video ngắn/dài, fail load, browser chặn autoplay: không làm slideshow dừng.
- Ảnh được chuyển `hidden` hoặc delete khi đang phát: biến mất trong lần chuyển an toàn kế tiếp.
- Realtime disconnect, Redis/SSE reconnect, player reload, host refresh, session expiry/revoke.

### Visual/UX

- Test Chrome desktop ở 1366×768, 1920×1080, 3840×2160; TV/projector thật nếu có.
- Test portrait 9:16 và ảnh bị projector crop các cạnh.
- QR thử quét từ điện thoại ở khoảng cách venue thực tế, dưới ánh sáng sân khấu.
- Kiểm tra contrast của caption/CTA với ảnh nền phức tạp.
- Reduced motion tắt crossfade/auto rotation theo yêu cầu; controls vẫn hoạt động.
- Full keyboard: tab order, focus visible, space/arrow/B/C/Esc và không có focus trap.

### Automated

- Frontend unit tests cho playlist ordering, pagination, dedupe, status policy, preload fallback.
- Playwright: player bootstrap, transport command, CTA, video fallback, hidden media propagation.
- Backend unit/integration tests: token hash, expiration, host authorization, revoke, SSE audience isolation and resync.
- Giữ các kiểm tra repository: `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd validate:locales`, `pnpm.cmd audit:unused-keys`; backend `go test ./...` và `go vet ./...`.

## 9. Rollout an toàn

1. Đưa Phase 0 sau feature flag `live_wall_v2` cho internal events.
2. Chạy thử một event có media thật, mạng Wi-Fi venue mô phỏng/chập chờn và một TV/projector thật.
3. Bật Phase 1 cho host beta; session player mặc định expiry ngắn và có revoke.
4. Theo dõi crash/asset error/reconnect trước khi mở `auto_approved` rộng rãi.
5. Chỉ mở `manual_queue` khi thao tác moderation host đã được kiểm thử đủ.

Rollback: tắt feature flag và quay về modal slideshow cũ; không thay đổi dữ liệu media hay policy moderation hiện có.

## 10. Chỉ số cần theo dõi

| Nhóm             | Chỉ số                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Độ tin cậy       | player connect success, reconnects/session, command delivery latency, asset load failure rate |
| Trải nghiệm      | median time từ upload-ready đến player eligible, slideshow stall count, QR CTA scan rate      |
| An toàn          | hidden media shown incidents (mục tiêu 0), session token rejection/revoke latency             |
| Giá trị sản phẩm | live-wall sessions/event, media shown/session, contribution rate của QR source `screen`       |

## 11. Ngoài phạm vi lần này

- Đồng bộ nhạc/audio với hệ thống AV.
- AI moderation, nhận diện khuôn mặt hoặc auto-ranking phức tạp.
- Multi-display synchronization theo frame chính xác.
- Native app cho operator.
- Public wall không có token cho event private.

Những mục này không cần để chứng minh giá trị cốt lõi: khách quét QR, đóng góp và thấy kỷ niệm xuất hiện an toàn trên màn hình chung.
