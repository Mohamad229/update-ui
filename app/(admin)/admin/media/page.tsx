import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getMedia } from "@/lib/actions/media";

import { MediaLibraryClient } from "./media-library-client";

export default async function MediaLibraryPage() {
  const result = await getMedia({ page: 1, limit: 20 });

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-destructive" />
          Failed to load media library.
        </CardContent>
      </Card>
    );
  }

  return <MediaLibraryClient initialData={result.data} />;
}

export const dynamic = "force-dynamic";
