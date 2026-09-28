import { siteConfig } from "@/lib/config";

interface TermsBodyProps {
  t: (key: string) => string;
}

export function TermsBodyVi({ t }: TermsBodyProps) {
  return (
    <>
      {/* Văn bản mở đầu */}
      <div className="legal-section__body" style={{ marginBottom: "32px" }}>
        <p>
          Các Điều khoản Dịch vụ này (&ldquo;Điều khoản&rdquo;) điều chỉnh quyền
          truy cập và sử dụng dịch vụ CandidCrowd của bạn, bao gồm trang web,
          thư viện sự kiện, công cụ tải ảnh và video, tính năng tương tác trực
          tiếp và các dịch vụ liên quan (gọi chung là &ldquo;Dịch vụ&rdquo;).
        </p>
        <p>
          Bằng việc tạo tài khoản, mua gói dịch vụ, tải nội dung lên hoặc sử
          dụng CandidCrowd theo bất kỳ hình thức nào, bạn xác nhận đã đọc, hiểu
          và đồng ý tuân thủ các Điều khoản này.
        </p>
      </div>

      {/* Mục 1 */}
      <section id="about" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">01</span>
          <h2 className="legal-section__title">{t("sections.about")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd là dịch vụ trực tuyến chia sẻ ảnh và video sự kiện được
            vận hành từ Hà Nội, Việt Nam.
          </p>
          <p>
            CandidCrowd cho phép người tổ chức sự kiện (Chủ tiệc / Host) tạo các
            không gian sự kiện riêng tư, nơi khách mời có thể đóng góp ảnh và
            video thông qua liên kết (link) hoặc mã QR mà không cần phải tạo tài
            khoản hay cài đặt ứng dụng.
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-card__name">CandidCrowd</div>
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

      {/* Mục 2 */}
      <section id="eligibility" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">02</span>
          <h2 className="legal-section__title">{t("sections.eligibility")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Bạn phải từ đủ 18 tuổi trở lên hoặc đạt độ tuổi thành niên theo luật
            định tại nơi bạn cư trú để có thể tạo tài khoản CandidCrowd hoặc mua
            gói dịch vụ trả phí.
          </p>
          <p>
            Khách mời có thể truy cập sự kiện để tải ảnh/video lên mà không cần
            tạo tài khoản.
          </p>
          <p>
            Trường hợp người chưa thành niên sử dụng CandidCrowd, cha mẹ hoặc
            người giám hộ hợp pháp có trách nhiệm đảm bảo rằng việc sử dụng Dịch
            vụ là hợp pháp và phù hợp.
          </p>
        </div>
      </section>

      {/* Mục 3 */}
      <section id="accounts" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">03</span>
          <h2 className="legal-section__title">{t("sections.accounts")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Người tổ chức sự kiện cần tạo tài khoản để khởi tạo và quản lý các
            sự kiện.
          </p>
          <p>Bạn chịu trách nhiệm về:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Cung cấp thông tin tài khoản chính xác và cập nhật;
            </li>
            <li className="legal-section__item">
              Duy trì tính bảo mật và an toàn cho tài khoản của bạn;
            </li>
            <li className="legal-section__item">
              Giữ bí mật tuyệt đối thông tin đăng nhập;
            </li>
            <li className="legal-section__item">
              Toàn bộ các hoạt động diễn ra thông qua tài khoản của bạn.
            </li>
          </ul>
          <p>
            Xác thực tài khoản có thể được cung cấp thông qua Better Auth hoặc
            các nhà cung cấp danh tính bên thứ ba như Google hoặc Apple.
          </p>
          <p>
            Chúng tôi có quyền từ chối đăng ký sử dụng các địa chỉ email tạm
            thời hoặc email dùng một lần (disposable email) vì lý do bảo mật và
            phòng chống lạm dụng.
          </p>
          <p>
            Bạn phải liên hệ ngay với chúng tôi qua{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="legal-section__link"
            >
              {siteConfig.supportEmail}
            </a>{" "}
            nếu phát hiện hoặc nghi ngờ tài khoản của mình bị xâm nhập trái
            phép.
          </p>
        </div>
      </section>

      {/* Mục 4 */}
      <section id="events-and-guests" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">04</span>
          <h2 className="legal-section__title">
            {t("sections.eventsAndGuests")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chủ tiệc có thể tạo sự kiện và phân phối liên kết hoặc mã QR dành
            cho khách mời.
          </p>
          <p>
            Khách mời sử dụng liên kết đó để tải ảnh và video lên mà không cần
            tạo tài khoản.
          </p>
          <p>Chủ tiệc có toàn quyền và trách nhiệm quyết định:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Ai là người nhận được liên kết sự kiện hoặc mã QR;
            </li>
            <li className="legal-section__item">
              Liệu khách mời có được phép xem nội dung do người khác tải lên hay
              không;
            </li>
            <li className="legal-section__item">
              Có kích hoạt tính năng Chiếu trực tiếp (Live Wall) hay không;
            </li>
            <li className="legal-section__item">
              Liệu khách mời có quyền tải nội dung về máy hay không;
            </li>
            <li className="legal-section__item">
              Cách thức phân phối và chia sẻ liên kết sự kiện.
            </li>
          </ul>
          <p>
            Liên kết sự kiện cần được đối xử như thông tin riêng tư khi Chủ tiệc
            thiết lập sự kiện ở chế độ riêng tư.
          </p>
          <p>
            CandidCrowd không thể đảm bảo tính bảo mật nếu Chủ tiệc hoặc khách
            mời chủ ý chia sẻ liên kết sự kiện cho những người không liên quan.
          </p>
        </div>
      </section>

      {/* Mục 5 */}
      <section id="user-content" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">05</span>
          <h2 className="legal-section__title">{t("sections.userContent")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            &ldquo;Nội dung Người dùng&rdquo; bao gồm hình ảnh, video, chú
            thích, lời chúc, thông tin sự kiện, nhận diện thương hiệu sự kiện và
            các tài liệu khác được tải lên hoặc gửi qua CandidCrowd.
          </p>
          <p>
            <strong>
              Bạn giữ toàn bộ quyền sở hữu đối với Nội dung Người dùng của mình.
            </strong>{" "}
            CandidCrowd không tuyên bố quyền sở hữu đối với bất kỳ ảnh hoặc
            video nào do người dùng tải lên.
          </p>
          <p>
            Bằng việc tải Nội dung Người dùng lên, bạn cấp cho CandidCrowd một
            giấy phép có giới hạn, không độc quyền, phạm vi toàn cầu để lưu trữ,
            xử lý, thay đổi kích thước, chuyển mã định dạng, sao chép, hiển thị
            và phân phối nội dung chỉ trong phạm vi cần thiết nhằm:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Cung cấp Dịch vụ;</li>
            <li className="legal-section__item">
              Hiển thị nội dung trong sự kiện tương ứng;
            </li>
            <li className="legal-section__item">
              Tạo ảnh thu nhỏ (thumbnail) hoặc tối ưu hóa phương tiện;
            </li>
            <li className="legal-section__item">Cho phép tải nội dung về;</li>
            <li className="legal-section__item">Duy trì an ninh hệ thống;</li>
            <li className="legal-section__item">
              Thực hiện sao lưu dự phòng kỹ thuật;
            </li>
            <li className="legal-section__item">Hỗ trợ kỹ thuật;</li>
            <li className="legal-section__item">
              Vận hành các tính năng theo yêu cầu của người dùng.
            </li>
          </ul>
          <p>
            Giấy phép này sẽ chấm dứt khi nội dung bị xóa vĩnh viễn khỏi hệ
            thống của chúng tôi, tuân theo các yêu cầu sao lưu tạm thời, phòng
            chống gian lận, bảo mật và lưu giữ theo quy định pháp luật.
          </p>
        </div>
      </section>

      {/* Mục 6 */}
      <section id="responsibility" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">06</span>
          <h2 className="legal-section__title">
            {t("sections.responsibility")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Bạn chỉ được tải lên những nội dung mà bạn có quyền hợp pháp để tải
            lên và chia sẻ.
          </p>
          <p>Bạn tuyệt đối không được tải lên các nội dung:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Xâm phạm bản quyền, quyền riêng tư, quyền hình ảnh hoặc các quyền
              hợp pháp khác của người khác;
            </li>
            <li className="legal-section__item">Trái pháp luật;</li>
            <li className="legal-section__item">
              Chứa phần mềm độc hại, virus hoặc mã độc hại;
            </li>
            <li className="legal-section__item">
              Chứa tài liệu lạm dụng hoặc bóc lột tình dục trẻ em;
            </li>
            <li className="legal-section__item">
              Khuyến khích hành vi vi phạm pháp luật;
            </li>
            <li className="legal-section__item">
              Nhằm mục đích đe dọa, quấy rối, xúc phạm hoặc bóc lột người khác;
            </li>
            <li className="legal-section__item">
              Chứa nội dung bị pháp luật hiện hành nghiêm cấm.
            </li>
          </ul>
          <p>
            Nếu hình ảnh hoặc video có chứa hình ảnh của người khác, người tải
            lên và Chủ tiệc có trách nhiệm đảm bảo rằng nội dung đó được thu
            thập, hiển thị và chia sẻ một cách hợp pháp và phù hợp.
          </p>
        </div>
      </section>

      {/* Mục 7 */}
      <section id="host-responsibilities" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">07</span>
          <h2 className="legal-section__title">
            {t("sections.hostResponsibilities")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chủ tiệc chịu trách nhiệm toàn diện về cách thức họ vận hành sự kiện
            của mình.
          </p>
          <p>
            Khi phù hợp, Chủ tiệc nên thông báo trước cho khách mời biết nếu
            phương tiện tải lên có thể:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Hiển thị cho các khách mời khác xem;
            </li>
            <li className="legal-section__item">
              Xuất hiện trên Màn hình Trực tiếp (Live Wall);
            </li>
            <li className="legal-section__item">Được Chủ tiệc tải về máy;</li>
            <li className="legal-section__item">
              Được trình chiếu công khai tại sự kiện;
            </li>
            <li className="legal-section__item">
              Được sử dụng bên ngoài nền tảng CandidCrowd.
            </li>
          </ul>
          <p>
            Chủ tiệc không đương nhiên có được quyền sở hữu bản quyền đối với
            các hình ảnh/video do khách mời tải lên.
          </p>
        </div>
      </section>

      {/* Mục 8 */}
      <section id="moderation" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">08</span>
          <h2 className="legal-section__title">{t("sections.moderation")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chủ tiệc có quyền kiểm duyệt, ẩn hoặc xóa bỏ nội dung khỏi sự kiện
            của mình.
          </p>
          <p>
            CandidCrowd có quyền gỡ bỏ, vô hiệu hóa hoặc hạn chế quyền truy cập
            vào nội dung khi chúng tôi có lý do hợp lý để tin rằng nội dung đó:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Vi phạm các Điều khoản này;</li>
            <li className="legal-section__item">Vi phạm quy định pháp luật;</li>
            <li className="legal-section__item">Tạo ra rủi ro bảo mật;</li>
            <li className="legal-section__item">
              Tiếp tay cho hành vi gian lận hoặc lạm dụng;
            </li>
            <li className="legal-section__item">
              Xâm phạm quyền hợp pháp của cá nhân, tổ chức khác.
            </li>
          </ul>
          <p>
            Chúng tôi có thể tạm ngừng hoặc chấm dứt tài khoản hoặc sự kiện liên
            quan đến các vi phạm nghiêm trọng hoặc tái diễn.
          </p>
          <p>
            Nếu bạn phát hiện nội dung mà bạn cho rằng vi phạm các Điều khoản
            này hoặc pháp luật áp dụng, vui lòng liên hệ với Chủ tiệc hoặc báo
            cáo ngay cho chúng tôi qua{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="legal-section__link"
            >
              {siteConfig.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>

      {/* Mục 9 */}
      <section id="storage" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">09</span>
          <h2 className="legal-section__title">{t("sections.storage")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd không được thiết kế để làm kho lưu trữ vĩnh viễn không
            giới hạn. Trừ khi gói dịch vụ có quy định khác:
          </p>
          <h3 className="legal-section__subtitle">Sự kiện miễn phí</h3>
          <p>
            Phương tiện tải lên được lưu giữ tối đa{" "}
            <strong>30 ngày sau ngày diễn ra sự kiện</strong>.
          </p>
          <h3 className="legal-section__subtitle">Sự kiện trả phí</h3>
          <p>
            Phương tiện tải lên được lưu giữ tối đa{" "}
            <strong>12 tháng sau ngày diễn ra sự kiện</strong>.
          </p>
          <p>
            Chủ tiệc có trách nhiệm tải về các ảnh và video quan trọng trước khi
            thời hạn lưu trữ kết thúc.
          </p>
          <p>
            Sau khi sự kiện hết hạn, nội dung có thể được chuyển vào hàng đợi
            xóa trong tối đa <strong>30 ngày</strong> trước khi bị xóa hoàn toàn
            khỏi bộ lưu trữ hoạt động.
          </p>
          <p>
            Các bản sao lưu mã hóa dự phòng kỹ thuật có thể tồn tại thêm tối đa{" "}
            <strong>60 ngày</strong> trước khi bị ghi đè hoặc xóa vĩnh viễn.
          </p>
          <p>
            Chúng tôi có thể cung cấp các gói gia hạn thời gian lưu trữ trả phí
            trong tương lai.
          </p>
        </div>
      </section>

      {/* Mục 10 */}
      <section id="availability" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">10</span>
          <h2 className="legal-section__title">{t("sections.availability")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để vận hành Dịch vụ
            ổn định nhưng không cam kết việc lưu trữ là vĩnh viễn hoặc không bao
            giờ bị gián đoạn.
          </p>
          <p>
            Chủ tiệc có nghĩa vụ tự duy trì các bản sao lưu độc lập cho các
            phương tiện quan trọng.
          </p>
          <p>
            CandidCrowd không nên được sử dụng làm bản sao lưu duy nhất cho
            những bức ảnh hoặc thước phim kỷ niệm không thể thay thế.
          </p>
        </div>
      </section>

      {/* Mục 11 */}
      <section id="payments" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">11</span>
          <h2 className="legal-section__title">{t("sections.payments")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Một số tính năng nâng cao yêu cầu thanh toán.</p>
          <p>
            Mức giá, tính năng, thời hạn lưu trữ và các giới hạn áp dụng luôn
            được hiển thị rõ ràng trước khi bạn thực hiện thanh toán.
          </p>
          <p>
            Gói sự kiện tiêu dùng thông thường được mua cho một sự kiện đơn lẻ,
            trừ khi có thỏa thuận khác.
          </p>
          <p>
            Các gói dịch vụ chuyên nghiệp hoặc doanh nghiệp có thể được cung cấp
            dưới dạng thuê bao định kỳ.
          </p>
          <p>
            Quá trình xử lý thanh toán do đơn vị cổng thanh toán bên thứ ba đảm
            nhiệm. CandidCrowd không trực tiếp lưu trữ toàn bộ số thẻ tín dụng
            hoặc thẻ ghi nợ của bạn.
          </p>
        </div>
      </section>

      {/* Mục 12 */}
      <section id="refund-policy" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">12</span>
          <h2 className="legal-section__title">{t("sections.refundPolicy")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Đối với các gói sự kiện tiêu dùng, bạn có quyền yêu cầu hoàn tiền
            đầy đủ trong vòng <strong>14 ngày kể từ ngày mua</strong> nếu:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Sự kiện đã lên lịch chưa diễn ra; và
            </li>
            <li className="legal-section__item">
              Chưa có bất kỳ ảnh hoặc video nào của khách mời được tải lên sự
              kiện trả phí đó.
            </li>
          </ul>
          <p>
            Một khi sự kiện đã bắt đầu hoặc đã có phương tiện của khách tải lên,
            khoản thanh toán về nguyên tắc sẽ không được hoàn lại.
          </p>
          <p>
            Trường hợp CandidCrowd gặp sự cố kỹ thuật nghiêm trọng khiến Dịch vụ
            đã mua không thể sử dụng được trong suốt thời gian diễn ra sự kiện,
            tùy theo mức độ thực tế, chúng tôi có thể cung cấp:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Hoàn tiền 100%;</li>
            <li className="legal-section__item">Hoàn tiền một phần; hoặc</li>
            <li className="legal-section__item">
              Cộng điểm tín dụng tài khoản.
            </li>
          </ul>
          <p>
            Không có nội dung nào trong chính sách này làm giới hạn các quyền
            lợi bảo vệ người tiêu dùng bắt buộc theo luật định hiện hành.
          </p>
          <p>
            Yêu cầu hoàn tiền có thể gửi về:{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="legal-section__link"
            >
              {siteConfig.supportEmail}
            </a>
          </p>
        </div>
      </section>

      {/* Mục 13 */}
      <section id="free-services" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">13</span>
          <h2 className="legal-section__title">{t("sections.freeServices")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Chúng tôi có thể cung cấp các gói miễn phí, sự kiện dùng thử, hạn
            mức lưu trữ hoặc tính năng khuyến mại. Các dịch vụ miễn phí có thể
            bị giới hạn về:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Dung lượng lưu trữ;</li>
            <li className="legal-section__item">Số lượng ảnh/video;</li>
            <li className="legal-section__item">Hỗ trợ video;</li>
            <li className="legal-section__item">Thời hạn lưu giữ;</li>
            <li className="legal-section__item">Thời gian diễn ra sự kiện;</li>
            <li className="legal-section__item">
              Khả năng tùy biến giao diện.
            </li>
          </ul>
          <p>
            Chúng tôi có quyền điều chỉnh hoặc ngừng cung cấp các tính năng miễn
            phí vào bất kỳ thời điểm nào.
          </p>
        </div>
      </section>

      {/* Mục 14 */}
      <section id="service-changes" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">14</span>
          <h2 className="legal-section__title">
            {t("sections.serviceChanges")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>CandidCrowd là sản phẩm liên tục phát triển và hoàn thiện.</p>
          <p>
            Chúng tôi có thể bổ sung, sửa đổi, thay thế hoặc loại bỏ các tính
            năng theo thời gian.
          </p>
          <p>
            Trường hợp có thay đổi trọng yếu làm giảm đáng kể chức năng của dịch
            vụ trả phí mà bạn đã thanh toán, chúng tôi sẽ thực hiện các biện
            pháp hợp lý để thông báo trước hoặc đưa ra biện pháp khắc phục thỏa
            đáng.
          </p>
        </div>
      </section>

      {/* Mục 15 */}
      <section id="intellectual-property" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">15</span>
          <h2 className="legal-section__title">
            {t("sections.intellectualProperty")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>
            Phần mềm, giao diện, nhãn hiệu, logo, thiết kế trang web, tài liệu
            hướng dẫn và các nội dung gốc của CandidCrowd thuộc quyền sở hữu
            hoặc được cấp phép hợp pháp cho CandidCrowd.
          </p>
          <p>
            Các Điều khoản này không chuyển giao quyền sở hữu trí tuệ của
            CandidCrowd cho người dùng.
          </p>
          <p>Bạn không được phép:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Sao chép, phân phối lại hoặc bán lại Dịch vụ;
            </li>
            <li className="legal-section__item">
              Tìm cách dịch ngược, giải mã mã nguồn các phần bị giới hạn của
              Dịch vụ;
            </li>
            <li className="legal-section__item">
              Vượt qua các biện pháp bảo mật kỹ thuật;
            </li>
            <li className="legal-section__item">
              Lạm dụng hoặc sử dụng trái phép thương hiệu CandidCrowd;
            </li>
            <li className="legal-section__item">
              Khai thác thương mại trang web hoặc phần mềm của chúng tôi khi
              chưa được sự đồng ý bằng văn bản,
            </li>
          </ul>
          <p>trừ trường hợp pháp luật hiện hành cho phép một cách rõ ràng.</p>
        </div>
      </section>

      {/* Mục 16 */}
      <section id="prohibited-use" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">16</span>
          <h2 className="legal-section__title">
            {t("sections.prohibitedUse")}
          </h2>
        </div>
        <div className="legal-section__body">
          <p>Bạn cam kết tuyệt đối không:</p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Tìm cách truy cập trái phép vào tài khoản hoặc sự kiện của người
              khác;
            </li>
            <li className="legal-section__item">
              Gây cản trở, gián đoạn hoạt động bình thường của Dịch vụ;
            </li>
            <li className="legal-section__item">
              Cố tình vượt qua các giới hạn tải lên, dung lượng, thanh toán hoặc
              bảo mật;
            </li>
            <li className="legal-section__item">
              Sử dụng các công cụ tự động quét, cào dữ liệu (scraping) mà không
              có sự cho phép;
            </li>
            <li className="legal-section__item">
              Lạm dụng hạ tầng máy chủ và lưu trữ tải lên;
            </li>
            <li className="legal-section__item">
              Tải lên các tệp tin chứa virus hoặc mã độc hại;
            </li>
            <li className="legal-section__item">
              Sử dụng CandidCrowd vào mục đích giám sát bất hợp pháp;
            </li>
            <li className="legal-section__item">
              Sử dụng Dịch vụ để phát tán nội dung vi phạm pháp luật;
            </li>
            <li className="legal-section__item">
              Mạo danh cá nhân hoặc tổ chức khác;
            </li>
            <li className="legal-section__item">
              Sử dụng Dịch vụ vi phạm bất kỳ quy định pháp luật hiện hành nào.
            </li>
          </ul>
        </div>
      </section>

      {/* Mục 17 */}
      <section id="third-party" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">17</span>
          <h2 className="legal-section__title">{t("sections.thirdParty")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd sử dụng các dịch vụ bên thứ ba đáng tin cậy cho một phần
            hạ tầng của mình. Các dịch vụ này bao gồm nhà cung cấp xác thực, hạ
            tầng đám mây, lưu trữ đối tượng, phân phát email, phân tích lưu
            lượng, giám sát và thanh toán.
          </p>
          <p>
            Hạ tầng hiện tại có thể bao gồm <strong>Better Auth</strong> phục vụ
            xác thực người dùng, <strong>Cloudflare</strong> phục vụ bảo mật,
            mạng phân phối nội dung và lưu trữ đám mây R2, cùng{" "}
            <strong>Google Analytics</strong> phục vụ phân tích sản phẩm.
          </p>
          <p>
            Các nhà cung cấp bên thứ ba hoạt động theo các điều khoản và chính
            sách quyền riêng tư riêng của họ.
          </p>
        </div>
      </section>

      {/* Mục 18 */}
      <section id="suspension" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">18</span>
          <h2 className="legal-section__title">{t("sections.suspension")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Bạn có quyền ngừng sử dụng CandidCrowd bất kỳ lúc nào.</p>
          <p>
            Chúng tôi có thể tạm khóa hoặc chấm dứt vĩnh viễn tài khoản hoặc sự
            kiện khi xét thấy cần thiết một cách hợp lý do:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">Vi phạm các Điều khoản này;</li>
            <li className="legal-section__item">Hành vi gian lận;</li>
            <li className="legal-section__item">Lạm dụng hệ thống;</li>
            <li className="legal-section__item">
              Đe dọa an toàn an ninh mạng;
            </li>
            <li className="legal-section__item">Không thanh toán đúng hạn;</li>
            <li className="legal-section__item">
              Yêu cầu từ cơ quan pháp luật;
            </li>
            <li className="legal-section__item">
              Xâm phạm quyền của bên thứ ba nhiều lần.
            </li>
          </ul>
          <p>
            Trong điều kiện hợp lý, chúng tôi sẽ thông báo trước khi chấm dứt
            tài khoản trả phí, trừ khi việc xử lý ngay lập tức là cần thiết vì
            lý do an ninh, pháp lý hoặc ngăn chặn lạm dụng nghiêm trọng.
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
          <p>Chủ tiệc có thể gửi yêu cầu xóa tài khoản.</p>
          <p>
            Khi tài khoản bị xóa, các sự kiện và phương tiện liên kết cũng có
            thể không còn truy cập được, trừ khi Chủ tiệc đã tải chúng về trước
            đó.
          </p>
          <p>
            Dữ liệu tài khoản thông thường sẽ bước vào quy trình xử lý xóa trong
            vòng <strong>30 ngày</strong> kể từ khi nhận được yêu cầu xóa hợp
            lệ.
          </p>
          <p>
            Một số hồ sơ và dữ liệu giao dịch có thể được giữ lại lâu hơn trong
            trường hợp cần thiết để phòng chống gian lận, bảo mật, giải quyết
            tranh chấp, kiểm toán tài chính hoặc tuân thủ quy định pháp luật.
          </p>
        </div>
      </section>

      {/* Mục 20 */}
      <section id="disclaimer" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">20</span>
          <h2 className="legal-section__title">{t("sections.disclaimer")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            CandidCrowd được cung cấp trên cơ sở &ldquo;nguyên trạng&rdquo;
            (as-is) và &ldquo;tùy thuộc vào tính sẵn có&rdquo; (as-available).
          </p>
          <p>
            Chúng tôi nỗ lực tối đa để Dịch vụ luôn an toàn, bảo mật và ổn định,
            tuy nhiên chúng tôi không thể đảm bảo rằng:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Dịch vụ sẽ hoạt động liên tục không gián đoạn;
            </li>
            <li className="legal-section__item">
              Dịch vụ hoàn toàn không có lỗi kỹ thuật;
            </li>
            <li className="legal-section__item">
              Lưu trữ là vĩnh cửu tuyệt đối;
            </li>
            <li className="legal-section__item">
              Hoàn toàn tương thích với mọi thiết bị hoặc điều kiện mạng;
            </li>
            <li className="legal-section__item">
              Việc tải lên luôn thành công khi kết nối mạng của người dùng bị
              chập chờn hoặc gián đoạn.
            </li>
          </ul>
          <p>
            Không có nội dung nào trong Điều khoản này loại trừ các bảo đảm hoặc
            quyền lợi của người tiêu dùng mà pháp luật không cho phép loại trừ.
          </p>
        </div>
      </section>

      {/* Mục 21 */}
      <section id="liability" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">21</span>
          <h2 className="legal-section__title">{t("sections.liability")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Trong phạm vi tối đa được pháp luật hiện hành cho phép, CandidCrowd
            sẽ không chịu trách nhiệm đối với các thiệt hại gián tiếp, ngẫu
            nhiên, đặc biệt, mang tính trừng phạt hoặc do hậu quả phát sinh từ
            việc sử dụng Dịch vụ.
          </p>
          <p>
            Đối với các khiếu nại liên quan đến dịch vụ CandidCrowd có trả phí,
            tổng trách nhiệm bồi thường tích lũy tối đa của chúng tôi sẽ không
            vượt quá số tiền lớn hơn giữa:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Số tiền bạn đã thanh toán cho CandidCrowd trong vòng 12 tháng
              trước thời điểm phát sinh sự kiện dẫn đến khiếu nại; hoặc
            </li>
            <li className="legal-section__item">
              100 USD (hoặc tương đương bằng VNĐ).
            </li>
          </ul>
          <p>
            Giới hạn này không áp dụng trong các trường hợp pháp luật hiện hành
            nghiêm cấm việc giới hạn trách nhiệm.
          </p>
        </div>
      </section>

      {/* Mục 22 */}
      <section id="indemnity" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">22</span>
          <h2 className="legal-section__title">{t("sections.indemnity")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Trong phạm vi pháp luật cho phép, bạn đồng ý chịu trách nhiệm và bồi
            hoàn cho CandidCrowd trước các tổn thất, khiếu nại hoặc chi phí phát
            sinh từ:
          </p>
          <ul className="legal-section__list">
            <li className="legal-section__item">
              Nội dung bạn tải lên trái quy định pháp luật;
            </li>
            <li className="legal-section__item">
              Hành vi xâm phạm quyền của người khác;
            </li>
            <li className="legal-section__item">
              Hành vi sử dụng CandidCrowd trái pháp luật;
            </li>
            <li className="legal-section__item">
              Hành vi vi phạm nghiêm trọng các Điều khoản này.
            </li>
          </ul>
        </div>
      </section>

      {/* Mục 23 */}
      <section id="governing-law" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">23</span>
          <h2 className="legal-section__title">{t("sections.governingLaw")}</h2>
        </div>
        <div className="legal-section__body">
          <p>
            Các Điều khoản này được điều chỉnh và giải thích theo pháp luật của{" "}
            <strong>Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam</strong>.
          </p>
          <p>
            Mọi tranh chấp không thể giải quyết thông qua thương lượng hòa giải
            sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền tại Việt Nam, trừ
            trường hợp luật bảo vệ người tiêu dùng bắt buộc cho phép bạn khởi
            kiện tại khu vực pháp lý khác.
          </p>
          <p>
            Các quyền lợi bắt buộc của người tiêu dùng tại quốc gia nơi bạn cư
            trú vẫn được bảo toàn nguyên vẹn.
          </p>
          <p>
            <strong>Ngôn ngữ điều chỉnh:</strong> Các Điều khoản Dịch vụ này
            được lập bằng cả tiếng Việt và tiếng Anh. Trong trường hợp có bất kỳ
            sự khác biệt hoặc mâu thuẫn nào về mặt ngữ nghĩa hoặc cách diễn giải
            pháp lý giữa bản tiếng Việt và bản tiếng Anh, bản tiếng Anh sẽ được
            ưu tiên áp dụng làm chuẩn.
          </p>
        </div>
      </section>

      {/* Mục 24 */}
      <section id="changes" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">24</span>
          <h2 className="legal-section__title">{t("sections.changes")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Chúng tôi có thể cập nhật các Điều khoản này theo thời gian.</p>
          <p>
            Đối với các thay đổi trọng yếu, chúng tôi sẽ thực hiện các thông báo
            hợp lý khi thích hợp.
          </p>
          <p>
            Việc bạn tiếp tục sử dụng Dịch vụ sau khi phiên bản Điều khoản cập
            nhật có hiệu lực đồng nghĩa với việc bạn chấp thuận các Điều khoản
            mới đó theo quy định của pháp luật.
          </p>
        </div>
      </section>

      {/* Mục 25 */}
      <section id="contact" className="legal-section">
        <div className="legal-section__header">
          <span className="legal-section__number">25</span>
          <h2 className="legal-section__title">{t("sections.contact")}</h2>
        </div>
        <div className="legal-section__body">
          <p>Mọi thắc mắc về các Điều khoản này xin vui lòng gửi về:</p>
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
