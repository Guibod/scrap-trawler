import React from "react"
import { Tooltip } from "@heroui/tooltip"
import { Circle, Triangle, Square, Hexagon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"
import { GlobalStatus, FetchStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import statusColors from "~/resources/ui/colors/status"

export const statusDescriptions: {
  scrape: Record<ScrapeStatus, string>,
  pair: Record<PairStatus, string>,
  fetch: Record<FetchStatus, string>
  global: Record<GlobalStatus, string>
} = {
  scrape: {
    [ScrapeStatus.COMPLETED_LIVE]: "The event was scraped, but was not yet finished. You need to scrape again for updates.",
    [ScrapeStatus.COMPLETED_ENDED]: "All data were retrieved from Event Link.",
    [ScrapeStatus.COMPLETED_DEAD]: "This event was scraped, but contains no usable data",
    [ScrapeStatus.NOT_STARTED]: "Scraping process failed. Some data may be missing."
  },
  pair: {
    NOT_STARTED: "Pairing process has not yet started.",
    COMPLETED: "All players have been successfully paired.",
    PARTIAL: "Pairing is partially completed, but some players remain unmatched.",
    UNRESOLVED: "Some pairing data exists, but metadata is incomplete."
  },
  fetch: {
    NOT_STARTED: "No decklists have been fetched yet.",
    COMPLETED: "All decklists have been successfully retrieved.",
    PARTIAL: "Some decklists were fetched, but others failed.",
  },
  global: {
    NOT_STARTED: "No processing has been started yet.",
    COMPLETED: "All tournament data has been successfully processed and is ready.",
    PARTIAL: "Processing is partially completed, with some data still missing.",
    FAILED: "Something went really wrong and processing failed."
  }
}

type StatusIconDescriptiveTooltipProps = {
  shape: ComponentType<{ className?: string }>;
  color: string;
  label: string;
  description: string;
  size?: number;
  disableTooltip?: boolean;
}
type StatusIconExplicitTooltipProps ={
  shape: ComponentType<{ className?: string }>;
  color: string;
  size?: number;
  tooltip?: ReactNode;
};
type StatusIconProps = StatusIconDescriptiveTooltipProps | StatusIconExplicitTooltipProps;

const isStatusIconExplicitTooltipProps = (props: StatusIconProps): props is StatusIconExplicitTooltipProps => {
  return "tooltip" in props;
};

const StatusIcon = (props: StatusIconProps) => {
  const { shape: Shape, color, size = 24 } = props;

  if (isStatusIconExplicitTooltipProps(props)) {
    return (
      <Tooltip showArrow={true} content={props.tooltip}>
        <Shape className={`w-${size} h-${size} ${color}`} />
      </Tooltip>
    );
  }

  if (props.disableTooltip) {
    return <Shape className={`w-${size} h-${size} ${color}`} />;
  }

  return (
    <Tooltip
      showArrow={true}
      content={
        <div className="px-2 py-1 flex items-center gap-2">
          <Shape className={`w-4 h-4 ${color}`} />
          <div>
            <div className="text-sm font-bold">{props.label}</div>
            <div className="text-xs">{props.description}</div>
          </div>
        </div>
      }
    >
      <Shape className={`w-${size} h-${size} ${color}`} />
    </Tooltip>
  );
};


type StatusProps = {
  status: { global: GlobalStatus; scrape: ScrapeStatus; pair: PairStatus; fetch: FetchStatus };
  disableTooltip?: boolean;
  size?: number
};

const GlobalStatusIcon = ({ status, size = 24 }: StatusProps) => (
  <StatusIcon shape={Circle} color={statusColors[status.global]} label="Global Status" aria-label="Global Status"
              description={statusDescriptions.global[status.global]} size={size} tooltip={
    <div className="px-2 flex flex-col">
      <div className="text-sm font-bold">Event Status</div>
      <div className="text-xs flex flex-col items-start gap-0">
        <div className="flex items-center gap-0.5">
          <ScrapeStatusIcon status={status} size={16} disableTooltip={true} />
          {statusDescriptions.scrape[status.scrape]}
        </div>
        <div className="flex items-center gap-0.5">
          <PairStatusIcon status={status} size={16} disableTooltip={true} />           {statusDescriptions.pair[status.pair]}
        </div>
        <div className="flex items-center gap-0.5">
          <FetchStatusIcon status={status} size={16} disableTooltip={true} />
          {statusDescriptions.fetch[status.fetch]}
        </div>
      </div>
    </div>
  } />
)

const ScrapeStatusIcon = ({ status, disableTooltip, size = 24 }: StatusProps) => (
  <StatusIcon shape={Triangle} color={statusColors[status.scrape]} label="Scrape Status" aria-label="Scrape Status"
              description={statusDescriptions.scrape[status.scrape]} size={size} disableTooltip={disableTooltip} />
)

const PairStatusIcon = ({ status, disableTooltip, size = 24 }: StatusProps) => (
  <StatusIcon shape={Square} color={statusColors[status.pair]} label="Pair Status" aria-label="Pair Status"
              description={statusDescriptions.pair[status.pair]} size={size} disableTooltip={disableTooltip} />
)

const FetchStatusIcon = ({ status, disableTooltip, size = 24 }: StatusProps) => (
  <StatusIcon shape={Hexagon} color={statusColors[status.fetch]} label="Fetch Status" aria-label="Fetch Status"
              description={statusDescriptions.fetch[status.fetch]} size={size} disableTooltip={disableTooltip} />
)

export { GlobalStatusIcon, ScrapeStatusIcon, PairStatusIcon, FetchStatusIcon }
