import Link from "next/link";
import { Aperture } from "@phosphor-icons/react/dist/ssr";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CandidCrowd home">
      <Aperture aria-hidden="true" />
      <span>
        candidcrowd<span className="brand__dot">.</span>
      </span>
    </Link>
  );
}
