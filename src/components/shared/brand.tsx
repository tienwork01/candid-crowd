import Link from "next/link";
import { Aperture } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="CandidCrowd home">
      <Aperture aria-hidden="true" strokeWidth={1.4} />
      <span>
        candidcrowd<span className="brand__dot">.</span>
      </span>
    </Link>
  );
}
