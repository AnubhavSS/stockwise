/** Root route loader while the first screen is compiling or streaming. */

import { PageLoader } from "@/components/shared/page-loader";

export default function RootLoading() {
  return <PageLoader fullScreen label="Starting Stockwise…" />;
}
