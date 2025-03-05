import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { useEventSetup } from "~resources/ui/components/event/setup/provider"
import { COLUMN_TYPE_META } from "~resources/domain/enums/spreadsheet.dbo"

const SetupReview = () => {
  const { spreadsheetMeta } = useEventSetup();

  return (
    <Card className="mt-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Column Assignments</h3>
      </CardHeader>
      <CardBody>
        <ul className="grid grid-cols-2 gap-2">
          {spreadsheetMeta.columns.map((col) => (
            <li key={col.index} className="flex justify-between items-center">
              <span className="truncate max-w-fit">{col.name}</span>
              <span className={`px-2 py-1 rounded text-white ${COLUMN_TYPE_META[col.type].color}`}>
                {COLUMN_TYPE_META[col.type].label}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default SetupReview;
