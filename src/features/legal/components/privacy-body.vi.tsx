import { siteConfig } from "@/lib/config";

interface PrivacyBodyProps {
  t: (key: string) => string;
}

export function PrivacyBodyVi({ t }: PrivacyBodyProps) {
  return (
    <>
      {/* Lời dẫn nhập */}
      <div className="legal-section__body" style={{ marginBottom: "32px" }}>
        <p>
          Chính sách Bảo mật này giải thích cách thức CandidCrowd thu thập, sử
          dụng, lưu trữ, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn sử
          dụng dịch vụ CandidCrowd, tuân thủ theo quy định pháp luật về bảo vệ
          dữ liệu cá nhân tại Việt Nam và các tiêu chuẩn bảo mật quốc tế.
        </p>
      </div>

      {/* Mục 1 */}
      <section id="who-we-are" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">01</span>
          <h2 className="legal-section__title">{t("sections.whoWeAre")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd là dịch vụ trực tuyến chia sẻ hình ảnh và video sự kiện
            được vận hành từ Hà Nội, Việt Nam.
          </p>
          <p>
            Đối với các câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư và dữ
            liệu cá nhân, vui lòng liên hệ:
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-card__name">
              Bộ phận Quyền riêng tư CandidCrowd
            </div>
            <div className="legal-contact-card__location">Hà Nội, Việt Nam</div>
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-contact-card__email"
            >
              {siteConfig.privacyEmail}
            </a>
          </div>
          <p style={{ marginTop: "16px" }}>
            Khi áp dụng, CandidCrowd đóng vai trò là Bên kiểm soát dữ liệu cá
            nhân (hoặc Bên kiểm soát và xử lý dữ liệu) đối với các thông tin cá
            nhân thu thập trực tiếp thông qua Dịch vụ.
          </p>
          <p>
            Trong một số tình huống cụ thể, người tổ chức sự kiện (Chủ tiệc) là
            người quyết định mục đích và cách thức thu thập cũng như sử dụng nội
            dung của khách mời.
          </p>
        </div>
      </section>

      {/* Mục 2 */}
      <section id="information-collected" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">02</span>
          <h2 className="legal-section__title">
            {t("sections.informationCollected")}
          </h2>
        </div>
        <div className="legal-section__body">
          <h3 className="legal-section__subtitle">
            Thông tin tài khoản Chủ tiệc
          </h3>
          <p>Khi bạn tạo tài khoản CandidCrowd, chúng tôi có thể thu thập:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Họ và tên;</li>
            <li className="legal-section__item">Địa chỉ email;</li>
            <li className="legal-section__item">Ảnh đại diện;</li>
            <li className="legal-section__item">Định danh tài khoản;</li>
            <li className="legal-section__item">Phương thức xác thực;</li>
            <li className="legal-section__item">Ngày tạo tài khoản;</li>
            <li className="legal-section__item">
              Thông tin đăng nhập và an toàn bảo mật;
            </li>
            <li className="legal-section__item">
              Phiên bản Điều khoản Dịch vụ và Chính sách Bảo mật mà bạn đã đồng
              ý khi đăng ký.
            </li>
          </ul>
          <p>
            Xác thực tài khoản có thể được cung cấp bởi Better Auth và các nhà
            cung cấp danh tính liên kết như Google hoặc Apple.
          </p>

          <h3 className="legal-section__subtitle">Thông tin sự kiện</h3>
          <p>
            Khi Chủ tiệc tạo hoặc quản lý sự kiện, chúng tôi có thể thu thập:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Tên sự kiện;</li>
            <li className="legal-section__item">Ngày diễn ra sự kiện;</li>
            <li className="legal-section__item">Loại hình sự kiện;</li>
            <li className="legal-section__item">Số lượng khách dự kiến;</li>
            <li className="legal-section__item">
              Các cài đặt cấu hình sự kiện;
            </li>
            <li className="legal-section__item">
              Chủ đề và giao diện sự kiện;
            </li>
            <li className="legal-section__item">
              Thông tin nguồn mã QR (vị trí bàn, cổng chào, quầy bar...);
            </li>
            <li className="legal-section__item">
              Cấu hình hiển thị và tải ảnh.
            </li>
          </ul>

          <h3 className="legal-section__subtitle">
            Thông tin khách mời tham dự
          </h3>
          <p>
            <strong>
              Khách mời hoàn toàn không cần phải tạo tài khoản hay đăng ký.
            </strong>
          </p>
          <p>
            Khi khách mời mở trang sự kiện hoặc đóng góp ảnh/video, chúng tôi có
            thể xử lý:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Mã định danh phiên khách mời ẩn danh (session token);
            </li>
            <li className="legal-section__item">Địa chỉ IP mạng;</li>
            <li className="legal-section__item">Loại trình duyệt web;</li>
            <li className="legal-section__item">Loại thiết bị sử dụng;</li>
            <li className="legal-section__item">Hệ điều hành;</li>
            <li className="legal-section__item">Thông tin mạng xấp xỉ;</li>
            <li className="legal-section__item">Thời điểm truy cập;</li>
            <li className="legal-section__item">
              Thời điểm tải ảnh/video lên;
            </li>
            <li className="legal-section__item">
              Nguồn quét mã QR hoặc liên kết giới thiệu;
            </li>
            <li className="legal-section__item">
              Dữ liệu kỹ thuật phục vụ an toàn và phòng chống lạm dụng.
            </li>
          </ul>
          <p>
            Chúng tôi không bắt buộc khách mời phải cung cấp tên thật hay email
            để tải ảnh/video lên sự kiện.
          </p>
          <p>
            Khi sử dụng tính năng Máy ảnh Candid (Candid Camera), ứng dụng có
            thể yêu cầu quyền truy cập máy ảnh thiết bị của bạn. Luồng hình ảnh
            máy ảnh được xử lý hoàn toàn cục bộ trên thiết bị của bạn — chúng
            tôi không truyền phát video trực tiếp lên máy chủ. Chỉ những bức ảnh
            mà bạn chủ động bấm chụp và xác nhận mới được tải lên.
          </p>

          <h3 className="legal-section__subtitle">Hình ảnh và video</h3>
          <p>
            Chúng tôi xử lý các hình ảnh và video được tải lên sự kiện. Dữ liệu
            này có thể bao gồm:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Tệp phương tiện gốc;</li>
            <li className="legal-section__item">Tên tệp tin;</li>
            <li className="legal-section__item">
              Định dạng tệp tin (MIME type);
            </li>
            <li className="legal-section__item">Kích thước tệp tin;</li>
            <li className="legal-section__item">
              Kích thước khung hình (pixel);
            </li>
            <li className="legal-section__item">Thời lượng video;</li>
            <li className="legal-section__item">
              Mã băm kiểm tra tính toàn vẹn tệp (checksum SHA-256) dùng để xác
              minh tải lên thành công và phát hiện trùng lặp;
            </li>
            <li className="legal-section__item">
              Siêu dữ liệu kỹ thuật cần thiết để xử lý và phân phối tệp tin.
            </li>
          </ul>
          <p>
            Các tệp tin được tải lên có thể chứa siêu dữ liệu do máy ảnh hoặc
            thiết bị tạo ra, bao gồm tọa độ vị trí địa lý (GPS), thông tin thiết
            bị và thời gian chụp ảnh. Các bức ảnh có dung lượng lớn có thể được
            tối ưu hóa trước khi tải lên; quá trình này có thể loại bỏ một số
            siêu dữ liệu kỹ thuật. Tuy nhiên, các bức ảnh kích thước nhỏ và toàn
            bộ video có thể được tải lên ở định dạng gốc, giữ nguyên các siêu dữ
            liệu nhúng bao gồm cả dữ liệu vị trí. Nếu bạn không muốn chia sẻ
            thông tin vị trí, vui lòng tắt tính năng định vị vị trí trong ứng
            dụng máy ảnh trên thiết bị của bạn trước khi chụp.
          </p>

          <h3 className="legal-section__subtitle">Thông tin sử dụng</h3>
          <p>
            Chúng tôi có thể thu thập thông tin về quá trình tương tác với Dịch
            vụ, bao gồm:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Các trang đã truy cập;</li>
            <li className="legal-section__item">Lượt mở sự kiện;</li>
            <li className="legal-section__item">Lượt quét mã QR;</li>
            <li className="legal-section__item">Lượt thử tải lên;</li>
            <li className="legal-section__item">Lượt tải lên thành công;</li>
            <li className="legal-section__item">Lượt tải lên thất bại;</li>
            <li className="legal-section__item">Tương tác với thư viện ảnh;</li>
            <li className="legal-section__item">Tần suất sử dụng tính năng;</li>
            <li className="legal-section__item">Thông tin báo lỗi kỹ thuật;</li>
            <li className="legal-section__item">Nhật ký an toàn bảo mật.</li>
          </ul>

          <h3 className="legal-section__subtitle">Thông tin thanh toán</h3>
          <p>
            Nếu bạn mua gói dịch vụ trả phí, thông tin thanh toán và lập hóa đơn
            được xử lý trực tiếp bởi đối tác cổng thanh toán bên thứ ba.
          </p>
          <p>
            CandidCrowd không trực tiếp lưu trữ toàn bộ số thẻ thanh toán của
            bạn. Chúng tôi có thể lưu giữ các thông tin đối soát:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Mã định danh giao dịch;</li>
            <li className="legal-section__item">Gói dịch vụ đã mua;</li>
            <li className="legal-section__item">Số tiền giao dịch;</li>
            <li className="legal-section__item">Thời điểm giao dịch;</li>
            <li className="legal-section__item">Trạng thái thanh toán;</li>
            <li className="legal-section__item">Thông tin hóa đơn.</li>
          </ul>
        </div>
      </section>

      {/* Mục 3 */}
      <section id="how-we-use" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">03</span>
          <h2 className="legal-section__title">{t("sections.howWeUse")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Chúng tôi sử dụng thông tin thu thập được nhằm mục đích:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Khởi tạo và quản lý tài khoản Chủ tiệc;
            </li>
            <li className="legal-section__item">Xác thực người dùng;</li>
            <li className="legal-section__item">
              Khởi tạo và vận hành các sự kiện;
            </li>
            <li className="legal-section__item">
              Tiếp nhận ảnh và video từ khách mời;
            </li>
            <li className="legal-section__item">
              Lưu trữ và hiển thị ảnh, video kỷ niệm;
            </li>
            <li className="legal-section__item">
              Tạo liên kết tham gia và mã QR sự kiện;
            </li>
            <li className="legal-section__item">
              Vận hành thư viện ảnh sự kiện;
            </li>
            <li className="legal-section__item">
              Cung cấp tính năng Chiếu trực tiếp (Live Wall);
            </li>
            <li className="legal-section__item">
              Tính toán các số liệu tham gia sự kiện;
            </li>
            <li className="legal-section__item">
              Đảm bảo tính ổn định và liên tục của quá trình tải ảnh;
            </li>
            <li className="legal-section__item">
              Xử lý các giao dịch thanh toán;
            </li>
            <li className="legal-section__item">Hỗ trợ khách hàng;</li>
            <li className="legal-section__item">
              Phòng ngừa gian lận, phá hoại và lạm dụng;
            </li>
            <li className="legal-section__item">
              Bảo vệ an toàn an ninh mạng;
            </li>
            <li className="legal-section__item">
              Chẩn đoán và khắc phục sự cố;
            </li>
            <li className="legal-section__item">
              Nâng cao chất lượng sản phẩm;
            </li>
            <li className="legal-section__item">
              Gửi các thông báo quan trọng về dịch vụ;
            </li>
            <li className="legal-section__item">
              Tuân thủ các nghĩa vụ pháp lý hiện hành.
            </li>
          </ul>
          <p>
            Khi được pháp luật cho phép, chúng tôi có thể gửi email giới thiệu
            tính năng mới đến các chủ tài khoản. Các email này luôn đi kèm nút
            hủy nhận tin bất cứ lúc nào.
          </p>
        </div>
      </section>

      {/* Mục 4 */}
      <section id="legal-bases" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">04</span>
          <h2 className="legal-section__title">{t("sections.legalBases")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Theo quy định pháp luật hiện hành (bao gồm Nghị định 13/2023/NĐ-CP
            và GDPR khi áp dụng), chúng tôi xử lý dữ liệu cá nhân dựa trên các
            căn cứ pháp lý sau:
          </p>
          <h3 className="legal-section__subtitle">Thực hiện hợp đồng</h3>
          <p>
            Chúng tôi xử lý thông tin khi cần thiết để cung ứng Dịch vụ
            CandidCrowd cho các chủ tài khoản và khách hàng theo thỏa thuận.
          </p>
          <h3 className="legal-section__subtitle">Lợi ích hợp pháp</h3>
          <p>
            Chúng tôi xử lý một số thông tin hạn chế khi cần thiết một cách hợp
            lý nhằm đảm bảo an toàn an ninh Dịch vụ, ngăn chặn gian lận, phòng
            chống lạm dụng, khắc phục sự cố kỹ thuật và nâng cao độ tin cậy của
            sản phẩm.
          </p>
          <h3 className="legal-section__subtitle">Sự đồng ý</h3>
          <p>
            Chúng tôi dựa trên sự đồng ý rõ ràng của bạn trong các trường hợp
            luật định yêu cầu, bao gồm việc gửi thông tin tiếp thị, sử dụng
            cookie phân tích tùy chọn hoặc các tính năng công nghệ mới trong
            tương lai.
          </p>
          <h3 className="legal-section__subtitle">Nghĩa vụ pháp lý</h3>
          <p>
            Chúng tôi có thể lưu giữ hoặc xử lý thông tin để đáp ứng các yêu cầu
            bắt buộc của cơ quan nhà nước có thẩm quyền hoặc quy định pháp luật.
          </p>
        </div>
      </section>

      {/* Mục 5 */}
      <section id="other-people" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">05</span>
          <h2 className="legal-section__title">{t("sections.otherPeople")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Hình ảnh và video sự kiện thường xuyên xuất hiện hình ảnh của những
            người khác ngoài người tải lên.
          </p>
          <p>
            Chủ tiệc và người tải lên có trách nhiệm đảm bảo rằng việc thu thập,
            sử dụng và chia sẻ hình ảnh của người khác là hợp pháp, lịch sự và
            phù hợp với quyền riêng tư của cá nhân đó.
          </p>
          <p>
            Nếu hình ảnh của bạn xuất hiện trong nội dung lưu trữ trên
            CandidCrowd và bạn cho rằng nội dung đó xâm phạm quyền riêng tư hoặc
            quyền hợp pháp của bạn, vui lòng liên hệ ngay:
          </p>
          <p>
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-section__link"
            >
              {siteConfig.privacyEmail}
            </a>
          </p>
          <p>
            Vui lòng cung cấp đầy đủ thông tin để chúng tôi có thể định vị chính
            xác sự kiện và nội dung cần xử lý.
          </p>
        </div>
      </section>

      {/* Mục 6 */}
      <section id="facial-recognition" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">06</span>
          <h2 className="legal-section__title">
            {t("sections.facialRecognition")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            <strong>
              CandidCrowd hiện tại hoàn toàn không sử dụng công nghệ nhận diện
              khuôn mặt để định danh khách mời.
            </strong>
          </p>
          <p>
            CandidCrowd không chủ ý tạo hồ sơ định danh sinh trắc học từ các bức
            ảnh sự kiện như một phần của sản phẩm hiện hành.
          </p>
          <p>
            Nếu các tính năng tìm kiếm bằng khuôn mặt hoặc phân tích sinh trắc
            học được xem xét bổ sung trong tương lai, chúng tôi sẽ cập nhật
            Chính sách Bảo mật này và thiết lập các thông báo cụ thể, biện pháp
            kiểm soát và cơ chế đồng ý tường minh theo đúng quy định pháp luật.
          </p>
        </div>
      </section>

      {/* Mục 7 */}
      <section id="how-we-share" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">07</span>
          <h2 className="legal-section__title">{t("sections.howWeShare")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            <strong>
              CandidCrowd cam kết không bán thông tin cá nhân của bạn để lấy
              tiền.
            </strong>
          </p>
          <p>
            Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ hạ
            tầng cần thiết để vận hành Dịch vụ, bao gồm dịch vụ xác thực, lưu
            trữ đám mây, xử lý phương tiện, phân phát email, giám sát sự cố,
            phân tích lưu lượng, xử lý thanh toán và chăm sóc khách hàng.
          </p>
          <p>Hạ tầng đối tác hiện tại bao gồm:</p>
          <h3 className="legal-section__subtitle">Better Auth</h3>
          <p>
            Được sử dụng cho quy trình xác thực và quản lý tài khoản Chủ tiệc.
            Nền tảng Better Auth Infrastructure có thể truy cập thông tin tài
            khoản, dữ liệu phiên và nhật ký xác thực cho mục đích quản trị hệ
            thống.
          </p>
          <h3 className="legal-section__subtitle">Cloudflare</h3>
          <p>
            Được sử dụng cho hạ tầng an ninh mạng, chống tấn công DDoS, mạng
            phân phối nội dung (CDN) và lưu trữ đối tượng đám mây riêng tư
            Cloudflare R2.
          </p>
          <h3 className="legal-section__subtitle">Google Analytics</h3>
          <p>
            Được sử dụng để phân tích hiệu suất sản phẩm trong môi trường thực
            tế (production). Google Analytics có thể thu thập địa chỉ IP, thông
            tin trình duyệt, đường dẫn điều hướng trang và thời gian tương tác
            từ tất cả khách truy cập.
          </p>
          <h3 className="legal-section__subtitle">Google và Apple</h3>
          <p>
            Được sử dụng khi người dùng lựa chọn hình thức đăng nhập nhanh bằng
            tài khoản Google hoặc Apple.
          </p>
          <h3 className="legal-section__subtitle">
            Nhà cung cấp cơ sở dữ liệu đám mây
          </h3>
          <p>
            Dữ liệu xác thực được lưu trữ an toàn tại hệ thống cơ sở dữ liệu đám
            mây được quản trị chuyên biệt, có thể đặt tại Hoa Kỳ.
          </p>
          <h3 className="legal-section__subtitle">
            Dịch vụ phân phát email SMTP
          </h3>
          <p>
            Sử dụng dịch vụ SMTP bên thứ ba để gửi các email xác thực tài khoản,
            khôi phục mật khẩu và thông báo hệ thống.
          </p>
          <h3 className="legal-section__subtitle">Unsplash</h3>
          <p>
            Một số hình ảnh minh họa chủ đề mẫu có thể được tải từ mạng CDN của
            Unsplash khi Chủ tiệc tùy biến giao diện sự kiện.
          </p>
          <p>
            Tất cả các bên cung cấp dịch vụ chỉ tiếp nhận những thông tin cần
            thiết ở mức độ hợp lý để thực hiện dịch vụ được ủy quyền.
          </p>
        </div>
      </section>

      {/* Mục 8 */}
      <section id="hosts-and-guests" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">08</span>
          <h2 className="legal-section__title">
            {t("sections.hostsAndGuests")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>Tùy thuộc vào thiết lập của sự kiện:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Chủ tiệc có thể xem toàn bộ phương tiện đã tải lên;
            </li>
            <li className="legal-section__item">
              Chủ tiệc có thể tải về các phương tiện đã tải lên;
            </li>
            <li className="legal-section__item">
              Chủ tiệc có thể xem thống kê đóng góp kỷ niệm;
            </li>
            <li className="legal-section__item">
              Khách mời khác có thể xem ảnh/video (nếu Chủ tiệc bật thư viện);
            </li>
            <li className="legal-section__item">
              Phương tiện tải lên có thể xuất hiện trên Màn hình Trực tiếp (Live
              Wall).
            </li>
          </ul>
          <p>
            CandidCrowd mặc định không bao giờ công khai các bức ảnh sự kiện
            riêng tư lên các công cụ tìm kiếm bên ngoài (như Google).
          </p>
        </div>
      </section>

      {/* Mục 9 */}
      <section id="international" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">09</span>
          <h2 className="legal-section__title">
            {t("sections.international")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>CandidCrowd cung cấp dịch vụ cho người dùng trên toàn cầu.</p>
          <p>
            Một số đối tác hạ tầng của chúng tôi có thể xử lý thông tin tại các
            trung tâm dữ liệu bên ngoài Việt Nam hoặc quốc gia nơi người dùng cư
            trú.
          </p>
          <p>
            Khi pháp luật hiện hành yêu cầu, chúng tôi áp dụng các biện pháp bảo
            vệ và chuyển giao dữ liệu phù hợp để đảm bảo tính an toàn cho dữ
            liệu cá nhân của bạn.
          </p>
        </div>
      </section>

      {/* Mục 10 */}
      <section id="retention" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">10</span>
          <h2 className="legal-section__title">{t("sections.retention")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chúng tôi không lưu giữ thông tin cá nhân lâu hơn mức cần thiết một
            cách hợp lý.
          </p>
          <h3 className="legal-section__subtitle">Sự kiện miễn phí</h3>
          <p>
            Phương tiện liên kết với sự kiện miễn phí thông thường được lưu giữ
            tối đa <strong>30 ngày sau ngày diễn ra sự kiện</strong>.
          </p>
          <h3 className="legal-section__subtitle">Sự kiện trả phí</h3>
          <p>
            Phương tiện liên kết với sự kiện tiêu dùng trả phí thông thường được
            lưu giữ tối đa <strong>12 tháng sau ngày diễn ra sự kiện</strong>.
          </p>
          <h3 className="legal-section__subtitle">
            Sự kiện đã xóa hoặc hết hạn
          </h3>
          <p>
            Khi sự kiện bị xóa hoặc hết hạn, phương tiện có thể nằm trong hàng
            đợi xóa trong vòng <strong>30 ngày</strong>.
          </p>
          <p>
            Các bản sao lưu mã hóa dự phòng kỹ thuật có thể tồn tại thêm tối đa{" "}
            <strong>60 ngày</strong> trước khi bị ghi đè hoặc xóa vĩnh viễn khỏi
            toàn bộ hệ thống.
          </p>
          <h3 className="legal-section__subtitle">Thông tin tài khoản</h3>
          <p>
            Thông tin tài khoản được lưu giữ trong suốt thời gian tài khoản hoạt
            động. Sau khi nhận được yêu cầu xóa hợp lệ, dữ liệu tài khoản sẽ
            bước vào quy trình xử lý xóa trong vòng <strong>30 ngày</strong>.
          </p>
          <h3 className="legal-section__subtitle">Nhật ký an toàn bảo mật</h3>
          <p>
            Nhật ký an ninh, phòng chống gian lận, xác thực và chống lạm dụng có
            thể được lưu giữ tối đa <strong>24 tháng</strong>.
          </p>
          <h3 className="legal-section__subtitle">Hỗ trợ khách hàng</h3>
          <p>
            Các trao đổi hỗ trợ khách hàng có thể được lưu giữ tối đa{" "}
            <strong>3 năm</strong> sau khi vấn đề được giải quyết để theo dõi
            lịch sử dịch vụ và giải quyết khiếu nại.
          </p>
          <h3 className="legal-section__subtitle">Hồ sơ giao dịch kế toán</h3>
          <p>
            Hồ sơ giao dịch, hóa đơn và chứng từ kế toán có thể được lưu giữ tối
            đa <strong>10 năm</strong> theo yêu cầu bắt buộc của luật kế toán,
            thuế và kiểm toán.
          </p>
        </div>
      </section>

      {/* Mục 11 */}
      <section id="security" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">11</span>
          <h2 className="legal-section__title">{t("sections.security")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chúng tôi áp dụng các biện pháp an ninh kỹ thuật và tổ chức nhằm bảo
            vệ thông tin cá nhân. Các biện pháp này bao gồm:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Mã hóa dữ liệu truyền tải qua giao thức HTTPS;
            </li>
            <li className="legal-section__item">
              Lưu trữ đám mây đối tượng ở chế độ riêng tư (private bucket);
            </li>
            <li className="legal-section__item">
              Kiểm soát truy cập phân quyền;
            </li>
            <li className="legal-section__item">
              Xác thực người dùng an toàn;
            </li>
            <li className="legal-section__item">
              Đường dẫn tải lên được ký trước (presigned URL) với thời gian sống
              ngắn;
            </li>
            <li className="legal-section__item">
              Quản lý phiên đăng nhập chặt chẽ;
            </li>
            <li className="legal-section__item">Ghi nhật ký kiểm toán;</li>
            <li className="legal-section__item">
              Giới hạn tần suất yêu cầu (rate limiting);
            </li>
            <li className="legal-section__item">
              Cơ chế phòng chống lạm dụng;
            </li>
            <li className="legal-section__item">
              Giới hạn nghiêm ngặt quyền truy cập của quản trị viên.
            </li>
          </ul>
          <p>
            Phương tiện sự kiện lưu trữ trên Cloudflare R2 luôn được giữ ở trạng
            thái lưu trữ riêng tư, trừ khi được cấp quyền truy cập cụ thể.
          </p>
          <p>
            Dù vậy, không có hệ thống trực tuyến nào có thể đảm bảo an toàn
            tuyệt đối 100%.
          </p>
        </div>
      </section>

      {/* Mục 12 */}
      <section id="cookies" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">12</span>
          <h2 className="legal-section__title">{t("sections.cookies")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd có thể sử dụng cookie và các công nghệ lưu trữ trình
            duyệt tương tự.
          </p>
          <h3 className="legal-section__subtitle">Cookie thiết yếu</h3>
          <p>
            Cookie thiết yếu được sử dụng cho việc xác thực, quản lý phiên đăng
            nhập, phòng chống gian lận, bảo mật và vận hành các tính năng cốt
            lõi. Các cookie này là bắt buộc để Dịch vụ có thể hoạt động.
          </p>
          <h3 className="legal-section__subtitle">
            Công nghệ lưu trữ trình duyệt
          </h3>
          <p>
            Ngoài cookie, CandidCrowd sử dụng các công nghệ lưu trữ trình duyệt
            khác bao gồm localStorage, sessionStorage và IndexedDB. Các công
            nghệ này được sử dụng để: lưu trữ tạm thời các tệp tin đang chờ tải
            lên (IndexedDB) nhằm đảm bảo khả năng phục hồi khi mạng Wi-Fi tại
            địa điểm sự kiện không ổn định; ghi nhớ tên hiển thị tùy chọn của
            khách mời (localStorage); duy trì mã phiên khách mời
            (sessionStorage); và lưu đệm thông tin sự kiện của Chủ tiệc để truy
            cập ngoại tuyến. Dữ liệu tải lên trong IndexedDB sẽ tự động được xóa
            sau khi tải lên thành công. Bộ điều phối Service Worker cũng có thể
            lưu đệm nội dung trang và hình ảnh trên thiết bị của bạn nhằm cải
            thiện tốc độ tải.
          </p>
          <h3 className="legal-section__subtitle">Cookie phân tích</h3>
          <p>
            CandidCrowd hiện sử dụng Google Analytics trong môi trường
            production để hiểu rõ lưu lượng truy cập và hiệu năng sản phẩm.
            Cookie của Google Analytics thu thập các thông tin như địa chỉ IP,
            loại trình duyệt, các trang đã xem và thời lượng tương tác. Khi pháp
            luật yêu cầu sự đồng ý cho cookie phân tích, chúng tôi sẽ cung cấp
            công cụ lựa chọn tương ứng.
          </p>
        </div>
      </section>

      {/* Mục 13 */}
      <section id="analytics" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">13</span>
          <h2 className="legal-section__title">{t("sections.analytics")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd thu thập dữ liệu phân tích sản phẩm nhằm nắm bắt mức độ
            sử dụng trang, quá trình tạo sự kiện, tỷ lệ tải lên thành công, phễu
            chuyển đổi và các sự cố kỹ thuật. Chúng tôi hiện sử dụng Google
            Analytics (GA4) trong môi trường production cho mục đích này.
          </p>
          <p>
            CandidCrowd cũng tổng hợp các số liệu thống kê nội bộ cấp sự kiện
            bao gồm số lượt quét mã QR, số lượng người đóng góp, số lượng ảnh và
            video, cùng bảng phân tích hiệu quả theo từng nguồn mã QR. Các số
            liệu này được hiển thị cho Chủ tiệc sự kiện.
          </p>
          <p>
            <strong>
              Chúng tôi cam kết không sử dụng hình ảnh sự kiện của bạn cho mục
              đích tạo hồ sơ quảng cáo thương mại.
            </strong>
          </p>
          <p>
            Nếu có thêm các công cụ phân tích hành vi hoặc quảng cáo bên thứ ba
            nào được triển khai trong tương lai, Chính sách Bảo mật này sẽ được
            cập nhật tương ứng.
          </p>
        </div>
      </section>

      {/* Mục 14 */}
      <section id="ai-processing" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">14</span>
          <h2 className="legal-section__title">{t("sections.aiProcessing")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd có thể bổ sung các tính năng tự động hóa tùy chọn như:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Phát hiện ảnh trùng lặp;</li>
            <li className="legal-section__item">Phát hiện ảnh mờ/nhoè;</li>
            <li className="legal-section__item">Đánh giá chất lượng ảnh;</li>
            <li className="legal-section__item">
              Phân loại khoảnh khắc sự kiện;
            </li>
            <li className="legal-section__item">
              Lựa chọn các bức ảnh nổi bật (highlights).
            </li>
          </ul>
          <p>
            Khi các tính năng này xử lý phương tiện sự kiện, việc xử lý chỉ giới
            hạn trong phạm vi cung cấp chức năng CandidCrowd được yêu cầu.
          </p>
          <p>
            <strong>
              CandidCrowd hiện tại không sử dụng ảnh sự kiện của khách hàng để
              huấn luyện bất kỳ mô hình AI công cộng tổng quát nào.
            </strong>
          </p>
          <p>
            Nếu chính sách này có thay đổi, chúng tôi sẽ đưa ra thông báo rõ
            ràng trước khi áp dụng.
          </p>
        </div>
      </section>

      {/* Mục 15 */}
      <section id="privacy-rights" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">15</span>
          <h2 className="legal-section__title">
            {t("sections.privacyRights")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Tùy thuộc vào quy định pháp luật nơi bạn cư trú (bao gồm Luật Việt
            Nam hoặc GDPR), bạn có các quyền hợp pháp sau:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Quyền tiếp cận và biết thông tin dữ liệu cá nhân của mình;
            </li>
            <li className="legal-section__item">
              Quyền yêu cầu chỉnh sửa thông tin chưa chính xác;
            </li>
            <li className="legal-section__item">Quyền yêu cầu xóa dữ liệu;</li>
            <li className="legal-section__item">
              Quyền hạn chế hoặc phản đối việc xử lý dữ liệu;
            </li>
            <li className="legal-section__item">
              Quyền yêu cầu cung cấp bản sao dữ liệu (data portability);
            </li>
            <li className="legal-section__item">
              Quyền rút lại sự đồng ý đã cấp trước đó;
            </li>
            <li className="legal-section__item">
              Quyền từ chối nhận thông tin tiếp thị.
            </li>
          </ul>
          <p>
            Để thực hiện các quyền riêng tư này, vui lòng gửi yêu cầu đến:{" "}
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-section__link"
            >
              {siteConfig.privacyEmail}
            </a>
          </p>
          <p>
            Chúng tôi có thể cần xác minh danh tính của bạn trước khi thực hiện
            yêu cầu và cam kết phản hồi trong khung thời gian do luật pháp quy
            định.
          </p>
        </div>
      </section>

      {/* Mục 16 */}
      <section id="removing-media" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">16</span>
          <h2 className="legal-section__title">
            {t("sections.removingMedia")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Nếu bạn là khách mời đã tải ảnh/video lên và muốn gỡ bỏ, bạn có thể:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Liên hệ trực tiếp với Chủ tiệc và đề nghị họ xóa phương tiện đó
              khỏi album sự kiện; hoặc
            </li>
            <li className="legal-section__item">
              Gửi yêu cầu đến{" "}
              <a
                href={`mailto:${siteConfig.privacyEmail}`}
                className="legal-section__link"
              >
                {siteConfig.privacyEmail}
              </a>{" "}
              kèm theo đầy đủ thông tin để định vị chính xác sự kiện và bức ảnh.
            </li>
          </ul>
          <p>
            Chúng tôi có thể xem xét bổ sung tính năng tự xóa dành cho khách mời
            trong các bản cập nhật tương lai.
          </p>
          <p>
            Nếu hình ảnh của bạn xuất hiện trong phương tiện do người khác tải
            lên và bạn muốn gỡ bỏ, vui lòng liên hệ{" "}
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-section__link"
            >
              {siteConfig.privacyEmail}
            </a>
            .
          </p>
        </div>
      </section>

      {/* Mục 17 */}
      <section id="california-rights" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">17</span>
          <h2 className="legal-section__title">
            {t("sections.californiaRights")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Trường hợp luật bảo vệ quyền riêng tư bang California (CCPA/CPRA) áp
            dụng, người dùng hợp lệ có các quyền:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Quyền được biết thông tin;</li>
            <li className="legal-section__item">Quyền truy cập thông tin;</li>
            <li className="legal-section__item">Quyền đính chính thông tin;</li>
            <li className="legal-section__item">Quyền xóa thông tin;</li>
            <li className="legal-section__item">
              Quyền từ chối việc bán hoặc chia sẻ thông tin cá nhân;
            </li>
            <li className="legal-section__item">
              Quyền không bị phân biệt đối xử khi thực hiện các quyền riêng tư.
            </li>
          </ul>
          <p>
            CandidCrowd hiện không bán thông tin cá nhân để lấy tiền và không
            chia sẻ thông tin cá nhân cho mục đích quảng cáo hành vi liên ngữ
            cảnh.
          </p>
        </div>
      </section>

      {/* Mục 18 */}
      <section id="children" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">18</span>
          <h2 className="legal-section__title">{t("sections.children")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd không được thiết kế như một dịch vụ nhắm đối tượng trực
            tiếp đến trẻ em.
          </p>
          <p>
            Chủ tài khoản phải từ đủ 18 tuổi trở lên hoặc đạt độ tuổi thành niên
            theo luật định nơi cư trú.
          </p>
          <p>
            Hình ảnh và video tải lên sự kiện có thể có trẻ em vì trẻ em thường
            tham dự các sự kiện gia đình ngoài đời thực. Chủ tiệc và người tải
            lên chịu trách nhiệm đảm bảo các nội dung liên quan đến trẻ vị thành
            niên được thu thập và chia sẻ một cách hoàn toàn phù hợp và có sự
            đồng ý của người giám hộ.
          </p>
        </div>
      </section>

      {/* Mục 19 */}
      <section id="deletion" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">19</span>
          <h2 className="legal-section__title">{t("sections.deletion")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Chủ tiệc có thể gửi yêu cầu xóa:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Tài khoản của mình;</li>
            <li className="legal-section__item">Từng sự kiện riêng lẻ;</li>
            <li className="legal-section__item">
              Toàn bộ phương tiện sự kiện liên kết.
            </li>
          </ul>
          <p>
            Việc xóa sự kiện có thể xóa vĩnh viễn các phương tiện của khách mời
            liên kết với sự kiện đó sau thời hạn xử lý. Trước khi xóa, Chủ tiệc
            nên chủ động tải về các phương tiện muốn lưu giữ.
          </p>
          <p>
            Một số bản ghi giới hạn có thể được lưu trữ theo quy định pháp luật
            vì mục đích an ninh, phòng chống gian lận, giải quyết tranh chấp
            hoặc nghĩa vụ tài chính.
          </p>
        </div>
      </section>

      {/* Mục 20 */}
      <section id="breaches" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">20</span>
          <h2 className="legal-section__title">{t("sections.breaches")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Trường hợp phát hiện sự cố an toàn dữ liệu cá nhân, chúng tôi sẽ
            điều tra ngay lập tức và áp dụng các biện pháp hợp lý để khoanh vùng
            và khắc phục.
          </p>
          <p>
            Khi pháp luật có quy định bắt buộc, chúng tôi sẽ tiến hành thông báo
            sự cố đến các cá nhân bị ảnh hưởng và cơ quan quản lý nhà nước có
            thẩm quyền theo đúng trình tự và thời hạn luật định.
          </p>
        </div>
      </section>

      {/* Mục 21 */}
      <section id="third-party-links" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">21</span>
          <h2 className="legal-section__title">
            {t("sections.thirdPartyLinks")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd có thể chứa các liên kết dẫn đến trang web hoặc dịch vụ
            bên ngoài. Chúng tôi không chịu trách nhiệm về chính sách quyền
            riêng tư của các bên thứ ba đó.
          </p>
        </div>
      </section>

      {/* Mục 22 */}
      <section id="changes" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">22</span>
          <h2 className="legal-section__title">{t("sections.changes")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chúng tôi có thể cập nhật Chính sách Bảo mật này theo sự phát triển
            của CandidCrowd.
          </p>
          <p>Các thay đổi trọng yếu sẽ được thông báo khi phù hợp.</p>
          <p>
            Ngày cập nhật gần nhất luôn được hiển thị ở phần đầu của văn bản
            này.
          </p>
        </div>
      </section>

      {/* Mục 23 */}
      <section id="complaints" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">23</span>
          <h2 className="legal-section__title">{t("sections.complaints")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Nếu bạn có thắc mắc hoặc khiếu nại về cách CandidCrowd xử lý dữ liệu
            cá nhân, vui lòng liên hệ:
          </p>
          <p>
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-section__link"
            >
              {siteConfig.privacyEmail}
            </a>
          </p>
          <p>
            Tùy theo quốc gia nơi bạn sinh sống, bạn cũng có quyền gửi khiếu nại
            đến cơ quan có thẩm quyền về bảo vệ dữ liệu cá nhân hoặc bảo vệ
            người tiêu dùng theo luật định.
          </p>
        </div>
      </section>

      {/* Mục 24 */}
      <section id="contact" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">24</span>
          <h2 className="legal-section__title">{t("sections.contact")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Đối với các thắc mắc về quyền riêng tư, yêu cầu xóa hoặc quyền tiếp
            cận dữ liệu:
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-card__name">CandidCrowd Privacy</div>
            <div className="legal-contact-card__location">Hà Nội, Việt Nam</div>
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="legal-contact-card__email"
            >
              {siteConfig.privacyEmail}
            </a>
          </div>
          <p style={{ marginTop: "20px" }}>
            Đối với hỗ trợ kỹ thuật chung và thanh toán dịch vụ:
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-card__name">CandidCrowd Support</div>
            <div className="legal-contact-card__location">Hà Nội, Việt Nam</div>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="legal-contact-card__email"
            >
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
