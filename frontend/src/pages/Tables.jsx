import { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [updatingTable, setUpdatingTable] = useState(null);
  const [error, setError] = useState("");

  const fetchTables = async () => {
    setRefreshing(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/tables`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tables.");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setTables(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const createTable = async () => {
    if (!tableNumber.trim()) {
      setError("Table number is required.");
      return;
    }

    setAddingTable(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          table_number: tableNumber.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create table.");
      }

      const newTable = await response.json();
      setTables((current) => [...current, newTable]);
      setTableNumber("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingTable(false);
    }
  };

  const toggleTableStatus = async (table) => {
    setUpdatingTable(table.id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/tables/${table.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            is_active: !table.is_active,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update table.");
      }

      const updatedTable = await response.json();

      setTables((current) =>
        current.map((item) =>
          item.id === updatedTable.id ? updatedTable : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingTable(null);
    }
  };

  const activeCount = tables.filter((table) => table.is_active).length;
  const inactiveCount = tables.filter((table) => !table.is_active).length;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold text-gray-900">Tables</h1>
      <p className="mt-2 text-gray-500">
        Manage your restaurant tables and QR codes.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Restaurant Tables
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {tables.length} {tables.length === 1 ? "table" : "tables"} ({activeCount} active, {inactiveCount} inactive)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Table number (e.g. 1, A1)"
            className="rounded-md border px-3 py-2 text-sm"
          />

          <button
            onClick={createTable}
            disabled={addingTable}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {addingTable ? "Adding..." : "Add Table"}
          </button>

          <button
            onClick={fetchTables}
            disabled={refreshing}
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-500">Loading tables...</p>
        ) : tables.length === 0 ? (
          <p className="text-gray-500">No tables found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className="rounded-lg border bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Table {table.table_number}
                  </h3>

                  <span
                    className={`text-sm font-medium ${
                      table.is_active
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {table.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  ID: {table.id}
                </p>

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700">
                    QR Code
                  </p>

                  {table.qr_code_url ? (
                    <div className="mt-2 flex items-center justify-between">
                      <a
                        href={table.qr_code_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View QR Code
                      </a>

                      <a
                        href={`/menu/table/${table.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Open Menu Page ↗
                      </a>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      No QR code generated
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleTableStatus(table)}
                  disabled={updatingTable === table.id}
                  className="mt-4 w-full rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {updatingTable === table.id
                    ? "Updating..."
                    : table.is_active
                    ? "Disable Table"
                    : "Enable Table"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tables;
