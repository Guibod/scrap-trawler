import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select } from "@heroui/select";
import { SelectItem, useDisclosure } from "@heroui/react"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { COLUMN_TYPE, COLUMN_TYPE_META } from "~resources/domain/enums/spreadsheet.dbo"
import { PencilIcon } from "@heroicons/react/24/outline";
import type { SpreadsheetColumnMetaData } from "~resources/domain/dbos/spreadsheet.dbo";
import { Chip } from "@heroui/chip"

type SpreadsheetColumnProps = {
  column: SpreadsheetColumnMetaData;
  onUpdate: (column: SpreadsheetColumnMetaData) => void;
  showType?: boolean;
}

const SpreadsheetColumn: React.FC<SpreadsheetColumnProps> = ({ column, onUpdate, showType = false }) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [newName, setNewName] = useState(column.name);
  const [selectedType, setSelectedType] = useState(column.type);

  const handleSave = (onClose: () => void) => {
    onUpdate({ ...column, name: newName, type: selectedType });
    onClose();
  };

  return (
    <div className="w-full h-full flex items-center justify-between gap-x-4">
      <span className="flex-1 truncate">{column.name || column.originalName}</span>

      {showType && (
        <Chip size="sm" className={`text-white ${COLUMN_TYPE_META[column.type].color}`}>
          {COLUMN_TYPE_META[column.type].label}
        </Chip>
      )}

      <Button variant="ghost" size="sm" onPress={onOpen} title="Edit Column" className="ml-auto">
        <PencilIcon className="w-4 h-4 text-gray-600" />
      </Button>

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
                  items={Object.entries(COLUMN_TYPE_META).map(([key, value]) => ({ key, ...value }))}
                  selectedKeys={[selectedType]}
                  onChange={(e) => setSelectedType(e.target.value as COLUMN_TYPE)}
                >
                  {(item) => <SelectItem>{item.label}</SelectItem>}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onPress={onClose} aria-label="Cancel">Cancel</Button>
                <Button onPress={() => handleSave(onClose)} aria-label="Save">Save</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SpreadsheetColumn;
