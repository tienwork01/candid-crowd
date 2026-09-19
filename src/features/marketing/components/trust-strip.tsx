import {
  DeviceMobile,
  UserFocus,
  LockKey,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

export async function TrustStrip() {
  const t = await getTranslations("marketing.trustStrip");

  const items = [
    {
      key: "noApp",
      label: t("noApp"),
      Icon: DeviceMobile,
    },
    {
      key: "noGuestAccount",
      label: t("noGuestAccount"),
      Icon: UserFocus,
    },
    {
      key: "privateEvent",
      label: t("privateEvent"),
      Icon: LockKey,
    },
    {
      key: "originalQuality",
      label: t("originalQuality"),
      Icon: Sparkle,
    },
  ];

  return (
    <div className="trust-strip" role="region" aria-label={t("ariaLabel")}>
      <div className="container trust-strip__inner">
        {items.map(({ key, label, Icon }) => (
          <div key={key} className="trust-strip__item">
            <span className="trust-strip__icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <span className="trust-strip__text">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
