import type { RawSpreadsheetRow, SpreadsheetMetadata } from "~resources/domain/dbos/spreadsheet.dbo"
import SetupUpload from "~resources/ui/components/event/setup/upload"
import SetupMapping from "~resources/ui/components/event/setup/mapping"
import SetupFilters from "~resources/ui/components/event/setup/filters"
import SetupReview from "~resources/ui/components/event/setup/review"

export type SetupStep = {
  key: string;
  title: string;
  subtitle: string;
  component: React.FC;
  isComplete: (meta: SpreadsheetMetadata, data: RawSpreadsheetRow[] | null) => boolean;
};

export const SETUP_STEPS: SetupStep[] = [
  {
    key: "1",
    title: "Upload Spreadsheet",
    subtitle: "Upload your event's spreadsheet to pair players and decklists.",
    component: SetupUpload,
    isComplete: (meta, data) => !!data, // ✅ Complete if data exists
  },
  {
    key: "2",
    title: "Column Mapping",
    subtitle: "Map columns to Scrap Trawler's data model.",
    component: SetupMapping,
    isComplete: (meta) => meta.columns.length > 0, // ✅ Complete if columns exist
  },
  {
    key: "3",
    title: "Filter and Duplicates",
    subtitle: "Clean up the data by filtering and handling duplicates.",
    component: SetupFilters,
    isComplete: (meta) => meta.filters.length > 0, // ✅ Complete if filters exist
  },
  {
    key: "4",
    title: "Summary",
    subtitle: "Review the event's setup.",
    component: SetupReview,
    isComplete: () => true, // ✅ Always complete
  },
];
