import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select } from "@heroui/select";
import { SelectItem, useDisclosure } from "@heroui/react"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { COLUMN_TYPE } from "~resources/domain/enums/spreadsheet.dbo";
import { PencilIcon } from "@heroicons/react/24/outline";
import type { SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo";

const SpreadsheetColumn: React.FC<SpreadsheetColumnProps> = ({ column, onUpdate }) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [newName, setNewName] = useState(column.name);
  const [selectedType, setSelectedType] = useState(column.type);

  const handleSave = (onClose: () => void) => {
    onUpdate({ ...column, name: newName, type: selectedType });
    onClose(); // ✅ Close modal after save
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="truncate">{column.name || column.originalName}</span>
        <Button variant="ghost" size="sm" onPress={onOpen}>
          <PencilIcon className="w-4 h-4 text-gray-600" />
        </Button>
      </div>

      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange} aria-labelledby="edit-column-modal">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Column</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus={true}
                  label="Column Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={column.originalName}
                />
                <Select
                  label="Column Type"
                  items={columnOptions}
                  selectedKeys={[selectedType]}
                  onChange={(e) => setSelectedType(e.target.value as COLUMN_TYPE)}
                >
                  {(item) => <SelectItem>{item.label}</SelectItem>}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onPress={onClose}>Cancel</Button>
                <Button onPress={() => handleSave(onClose)}>Save</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

interface SpreadsheetColumnProps {
  column: SpreadsheetColumnMetaData;
  onUpdate: (column: SpreadsheetColumnMetaData) => void;
}

const columnOptions = [
  { key: COLUMN_TYPE.IGNORED_DATA, label: "Ignore" },
  { key: COLUMN_TYPE.ARCHETYPE, label: "Archetype" },
  { key: COLUMN_TYPE.DECKLIST_URL, label: "Decklist" },
  { key: COLUMN_TYPE.UNIQUE_ID, label: "Unique Identifier" },
  { key: COLUMN_TYPE.FIRST_NAME, label: "First Name" },
  { key: COLUMN_TYPE.LAST_NAME, label: "Last Name" },
  { key: COLUMN_TYPE.PLAYER_DATA, label: "Extra player data" },
];

export default SpreadsheetColumn;
