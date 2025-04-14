import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { SETUP_STEPS } from "~/resources/ui/components/event/setup/config"
import React, { useState } from "react"
import { Tab, Tabs } from "@heroui/tabs"

const SetupSteps = () => {
  const { status } = useEventSetup();

  return (
    <div className="w-[80%] mx-auto">
      <Tabs
        aria-label="Steps"
        className="w-full mt-5 flex justify-center"
        color="primary"
        variant="bordered"
        defaultSelectedKey={String(status.furthestStepIndex + 1)}
      >
      {SETUP_STEPS.map(({ key, title, subtitle, component: StepComponent }) => (
          <Tab key={String(key)} title={
            <span className="flex justify-between items-center gap-5">
              <span className="font-mtg text-3xl">{key}</span>
              <span>{title}</span>
            </span>
          } isDisabled={status.isStepDisabled(key)}>
            <div className="flex gap-4">
              <h1 className="text-2xl font-mtg mt-4">{subtitle}</h1>
            </div>
            <StepComponent />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default SetupSteps;
