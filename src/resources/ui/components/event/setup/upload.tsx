import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { useEventSetup } from "~resources/ui/components/event/setup/provider"

const SetupUpload = () => {
  const { handleFileUpload } = useEventSetup();

  return (
    <Card>
      <CardHeader title={"Upload Spreadsheet"} />
      <CardBody>
        <p>Upload your event's spreadsheet to pair players and decklists.</p>
        <Input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      </CardBody>
    </Card>
  );
};

export default SetupUpload;
