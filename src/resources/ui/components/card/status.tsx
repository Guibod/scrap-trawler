import React from "react"
import { useMtgJson } from "~/resources/ui/providers/mtgjson"
import { CircularProgress } from "@heroui/react"
import { Link } from "react-router-dom"
import { useCards } from "~/resources/ui/providers/card"

export const CardDatabaseStatus: React.FC = () => {
  const { tableSize, localVersion, importProgress, isOutdated, importSize } = useMtgJson();
  const { isIndexing, indexingProgress } = useCards()

  if (importProgress !== null) {
    return (
      <div className="flex justify-between items-center gap-2">
        <CircularProgress showValueLabel={true} value={importProgress} maxValue={importSize} aria-label="card-database-status-import-progress" size="sm" />
        <span>Importing cards...</span>
      </div>
    )
  }

  if (isIndexing) {
    return (
      <div className="flex justify-between items-center gap-2">
        <CircularProgress showValueLabel={true} value={indexingProgress} maxValue={tableSize} aria-label="card-database-status-indexing-progress" size="sm" />
        <span>Indexing cards...</span>
      </div>
    )
  }

  if (!localVersion) {
    return (
      <div className="flex justify-between items-center">
        <Link to="/settings#card-database">
          <span className="text-warning">
            No card in database yet
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <Link to="/settings#card-database" className="flex">
        <span>
          {tableSize !== null ? `${tableSize} cards` : "Loading..."} • Version: {localVersion || "Unknown"}
        </span>
        {isOutdated && <span className="text-red-500"> • New version available</span>}
      </Link>
    </div>
  );
};

export default CardDatabaseStatus