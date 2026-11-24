/**
 * Coming-soon layout for Customers and Suppliers directory pages.
 */

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  highlights: string[];
};

export function ModulePlaceholder({
  title,
  description,
  highlights,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Module foundation</CardTitle>
          <CardDescription>
            This screen is a routed placeholder. Business workflows will be added
            in later steps without changing the shared layout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
