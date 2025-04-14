import type { SpreadsheetData } from "~/resources/domain/dbos/spreadsheet.dbo"
import { Accordion, AccordionItem, TableColumn } from "@heroui/react"
import React from "react"
import { useEventSetup } from "~/resources/ui/components/event/setup/provider"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@heroui/table"

const itemClasses = {
  base: "py-0 w-full",
  title: "font-normal text-medium",
  trigger: "px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
  indicator: "text-medium",
  content: "text-small px-2",
};

type DuplicateProps = {

}

const isEqual = (a: any, b: any): boolean =>
  JSON.stringify(a) === JSON.stringify(b)

const summarizeDuplicates = (rows: SpreadsheetData): string => {
  if (rows.every((row) => isEqual(row, rows[0]))) {
    return "✅ All rows are identical";
  }

  const differingValues = rows.reduce((acc, row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (!isEqual(value, rows[0][key])) {
        acc[key] = acc[key] || new Set();
        acc[key].add(value);
      }
    });
    return acc;
  }, {} as Record<string, Set<any>>);

  const keys = Object.keys(differingValues)
  if (keys.every((key) => key.startsWith("decklist"))) {
    return "⚠️ Decklist differs, use 'keep last' strategy to handle that properly"
  }

  if (keys.some((key) => key.endsWith("Name"))) {
    return "❌ Name columns are not identical, this is likely an error or the same email was used to register multiple players. This needs to be handled manually."
  }

  return `❌ Many items differs, that’s pretty bad, please check your data mapping.`;
}

const Duplicates = ({}: DuplicateProps) => {
  const { status } = useEventSetup();

  return (
    <Accordion
      className="p-2 flex flex-col gap-1 w-full"
      itemClasses={itemClasses}
      showDivider={false}
      variant="shadow">

      {Object.entries(status.duplicates).map(([id, rows]: [string, SpreadsheetData]) => (
        <AccordionItem
          key={id}
          aria-label={id}
          subtitle={
            <p className="flex">
              {summarizeDuplicates(rows)}
            </p>
          }
          title={id}
        >
          <Table aria-label="duplicates-table">
            <TableHeader>
              <TableColumn>First Name</TableColumn>
              <TableColumn>Last Name</TableColumn>
              <TableColumn>Archetype</TableColumn>
              <TableColumn>Decklist Url</TableColumn>
              <TableColumn>Decklist Txt</TableColumn>
            </TableHeader>
            <TableBody items={rows.map((row, index) => ({ ...row, index }))}>
              {(row) => (
                <TableRow key={`${row.id}${row.index}`}>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  <TableCell>{row.archetype}</TableCell>
                  <TableCell>{row.decklistUrl}</TableCell>
                  <TableCell>{row.decklistTxt}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default Duplicates
