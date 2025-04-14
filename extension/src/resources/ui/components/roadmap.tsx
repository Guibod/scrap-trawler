import { Accordion } from "@heroui/accordion";
import { CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";
import { type Feature, features } from "../../features";
import React from "react"
import { AccordionItem } from "@heroui/react"
import { Tooltip } from "@heroui/tooltip" // Adjust import path

// Map statuses to colors & icons
const statusMap: Record<Feature["status"], { color: string; description: string; icon: React.ReactNode }> = {
  done: { color: "text-green-500", description: "Completed", icon: <CheckCircleIcon className="w-5 h-5 text-green-500" /> },
  partial: { color: "text-yellow-500", description: "Partially supported", icon: <ClockIcon className="w-5 h-5 text-yellow-500" /> },
  "in development": { color: "text-blue-500", description: "In development", icon: <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500" /> },
  planned: { color: "text-gray-400", description: "Planned", icon: <RocketLaunchIcon className="w-5 h-5 text-gray-400" /> },
};

const Icon = ({ status }: { status: string }) => {
  const icon = statusMap[status]?.icon
  const description = statusMap[status]?.description

  return <Tooltip content={description} placement="top">{icon}</Tooltip>
}

const Roadmap = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 shadow-lg rounded-lg">
      <Accordion>
        {features.map((feature, index) => (
          <AccordionItem key={index}
            startContent={<Icon status={feature.status} />}
            title={feature.title}>
            <div className="p-2 space-y-2">
              {feature.items?.map((subFeature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {statusMap[subFeature.status]?.icon}
                  <span className={`text-sm ${statusMap[subFeature.status]?.color}`}>{subFeature.title}</span>
                </div>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Roadmap;
