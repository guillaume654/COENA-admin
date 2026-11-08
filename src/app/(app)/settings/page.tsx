import { Plug } from "lucide-react";
import { ModulePage } from "@/components/ModulePage";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function Page() {
  const { t } = await getServerDictionary();
  return (
    <ModulePage module="settings">
      <h2 className="mb-3 mt-8 font-serif text-xl">{t.integrations.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {t.integrations.items.map((item) => (
          <div key={item.name} className="flex flex-col rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <Plug className="size-4 text-brand" aria-hidden />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted">{item.body}</p>
            <span className="mt-3 w-fit rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">
              {t.integrations.status}
            </span>
          </div>
        ))}
      </div>
    </ModulePage>
  );
}
