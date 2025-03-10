import { Card, CardBody, CardHeader } from "@heroui/card"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import React, { useState } from "react"
import { DUPLICATE_STRATEGY_META, FILTER_OPERATOR } from "~/resources/domain/enums/spreadsheet.dbo"
import { Radio, RadioGroup } from "@heroui/radio"
import { Button } from "@heroui/button"
import FilterInput from "~/resources/ui/components/event/setup/filter"
import { type SpreadsheetFilter, type SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { Alert } from "@heroui/alert"
import { Accordion, AccordionItem } from "@heroui/react"
import Duplicates from "~/resources/ui/components/event/setup/duplicates"

const strategies = Object.entries(DUPLICATE_STRATEGY_META).map(([key, value]) => ({
  key,
  ...value,
}));

const SetupFilters = () => {
  const { status, spreadsheetMeta, handleStrategy, handleFilters } = useEventSetup();
  const [filters, setFilters] = useState<SpreadsheetFilter[]>(spreadsheetMeta.filters);

  const addFilter = () => {
    setFilters([...filters, { column: null, operator: FILTER_OPERATOR.INCLUDES, values: [] }]);
  };

  const updateFilter = (index: number, updatedFilter: SpreadsheetFilter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    setFilters(newFilters);
    handleFilters(newFilters)
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index)
    setFilters(newFilters);
    handleFilters(newFilters)
  };

  return (
    <Card>
      <CardBody className={"gap-2"}>
        {status.hasDuplicates && (
          <Alert className="mb-1" title="Some rows are considered duplicates" color={"danger"}>
            <p>Some rows shares the same values in the columns that are being used to identify unique players.</p>

            <p>Using current settings, we isolated {status.duplicateRows} duplicates, out of the {status.rows} lines.</p>
          </Alert>
        )}

        {!status.hasDuplicates && (
          <Alert className="mb-1" title="Some rows are considered duplicates" color={"success"} isClosable={true}>
            <p>Congratulations, the mappings settings are complete.
              There were <strong>{status.rawDuplicateRows}</strong> duplicates rows before
              filters were applied.</p>
          </Alert>
        )}

        <div className="flex flex-grow gap-3">
          <Card className="w-3/4">
            <CardHeader className="text-medium flex">
              Use filters to hide data

              <Button onPress={addFilter} className="mt-4 bg-green-500 text-white px-4 py-2 rounded ml-auto">
                + Add Filter
              </Button>
            </CardHeader>
            <CardBody>
              {filters.length === 0 && (
                <p className="text-small text-gray-500">No filters applied</p>
              )}
              {filters.map((filter, index) => (
                <FilterInput
                  key={index}
                  filter={filter}
                  onChange={(updatedFilter) => updateFilter(index, updatedFilter)}
                  onRemove={() => removeFilter(index)}
                />
              ))}
            </CardBody>
          </Card>

          <Card className="w-1/4">
            <CardHeader className="text-medium">Use a duplicate strategy</CardHeader>
            <CardBody>
              <RadioGroup
                size="sm"
                aria-label={"Select a strategy"}
                value={spreadsheetMeta.duplicateStrategy}
                onValueChange={(strategy) => handleStrategy(strategy)}
              >
                {strategies.map((strategy) => (
                  <Radio key={strategy.key} value={strategy.key} description={strategy.description}>{strategy.label}</Radio>
                ))}
              </RadioGroup>
            </CardBody>
          </Card>
        </div>

        {status.hasDuplicates && (
          <Card>
            <CardHeader className="text-medium">Individual Actions</CardHeader>
            <CardBody>
              <Duplicates />
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  );
};

export default SetupFilters;