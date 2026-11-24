/**
 * In-page loader shown while a workspace hydrates or a Suspense boundary waits.
 */

import { PageLoader } from "@/components/shared/page-loader";

type LoadingStateProps = {
  rows?: number;
  label?: string;
};

export function LoadingState({ label = "Loading page…" }: LoadingStateProps) {
  return <PageLoader label={label} />;
}
