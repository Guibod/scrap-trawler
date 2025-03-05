import { Accordion, AccordionItem, Progress } from "@heroui/react";
import { useEventSetup } from "~resources/ui/components/event/setup/provider"
import { SETUP_STEPS } from "~resources/ui/components/event/setup/config"

const SetupSteps = () => {
  const { progressPercentage, currentStep } = useEventSetup();

  return (
    <div className="w-[80%] mx-auto">
      <Progress aria-label="Setup Progress" size="lg" value={progressPercentage} className="font-mtg mt-5" label="setup progress"/>

      <Accordion defaultExpandedKeys={[currentStep.key]}>
        {SETUP_STEPS.map(({ key, title, subtitle, component: StepComponent }) => (
          <AccordionItem key={key} title={title} subtitle={subtitle} startContent={
            <div className="w-6 h-6 font-mtg text-4xl flex items-center justify-center text-gray-800">
              {key}
            </div>
          }>
            <StepComponent />
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SetupSteps;
