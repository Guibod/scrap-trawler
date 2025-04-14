import SetupUpload from "~/resources/ui/components/event/setup/upload"
import SetupFilters from "~/resources/ui/components/event/setup/filters"
import SetupMapping from "~/resources/ui/components/event/setup/mapping"
import type { SetupStatus } from "~/resources/ui/components/event/setup/status"
import SetupPairing from "~/resources/ui/components/event/setup/pairing"
import SetupFinalize from "~/resources/ui/components/event/setup/finalize"

export type SetupStep = {
  key: number;
  title: string;
  subtitle: string;
  component: React.FC;
  isComplete: (status: SetupStatus) => boolean;
};

export const SETUP_STEPS: SetupStep[] = [
  {
    key: 1,
    title: "Upload Spreadsheet",
    subtitle: "Upload your event's spreadsheet to pair players and decklists.",
    component: SetupUpload,
    isComplete: (status) => status.hasData,
  },
  {
    key: 2,
    title: "Column Mappings",
    subtitle: "Review the spreadsheet columns and their data types.",
    component: SetupMapping,
    isComplete: (status) => status.isMappingComplete,
  },
  {
    key: 3,
    title: "Filter and Duplicates",
    subtitle: "Clean up the data by filtering and handling duplicates.",
    component: SetupFilters,
    isComplete: (status) => !status.hasDuplicates,
  },
  {
    key: 4,
    title: "Pair Players",
    subtitle: "Pair players with their decklists.",
    component: SetupPairing,
    isComplete: (status) => status.hasAllPairings,
  },
  {
    key: 5,
    title: "Wrap Up",
    subtitle: "Finalize the setup and save your event.",
    component: SetupFinalize,
    isComplete: (status) => false,
  }
];
