import {
  getActiveLocations,
  getActiveCategories,
  getPriorities,
} from "@/lib/queries/lookup.queries";
import { NewRequestForm } from "@/components/requests/request-form";

export default async function NewRequestPage() {
  const [{ data: locations }, { data: categories }, { data: priorities }] =
    await Promise.all([
      getActiveLocations(),
      getActiveCategories(),
      getPriorities(),
    ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          New Maintenance Request
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below. A ticket number will be assigned
          automatically.
        </p>
      </div>
      <NewRequestForm
        locations={locations ?? []}
        categories={categories ?? []}
        //priorities={priorities ?? []}
      />
    </div>
  );
}
