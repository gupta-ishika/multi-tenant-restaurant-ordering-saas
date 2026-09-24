import { useEffect, useState } from "react";

const BACKEND_URL = "http://127.0.0.1:8000";

function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tableNumber, setTableNumber] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableNumber, setEditingTableNumber] = useState("");

  const getToken = () =>
    localStorage.getItem("access_token") || localStorage.getItem("token");

  const fetchTables = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/tables/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }

      const data = await response.json();
      setTables(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const createTable = async (event) => {
    event.preventDefault();

    if (!tableNumber.trim()) {
      setError("Table number is required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/tables/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          table_number: tableNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create table");
      }

      setTables((previousTables) => [...previousTables, data]);
      setTableNumber("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateTableStatus = async (tableId, isActive) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/tables/${tableId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            is_active: isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update table status");
      }

      setTables((previousTables) =>
        previousTables.map((table) =>
          table.id === tableId ? data : table
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTable = async (tableId) => {
    if (!editingTableNumber.trim()) {
      setError("Table number is required");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/tables/${tableId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            table_number: editingTableNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update table");
      }

      setTables((previousTables) =>
        previousTables.map((table) =>
          table.id === tableId ? data : table
        )
      );

      setEditingTableId(null);
      setEditingTableNumber("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const regenerateQR = async (tableId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/tables/${tableId}/qr`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to regenerate QR");
      }

      setTables((previousTables) =>
        previousTables.map((table) =>
          table.id === tableId ? data : table
        )
      );

      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading tables...</p>;
  }

  return (
    <div>
      <h1>Tables</h1>

      <form onSubmit={createTable}>
        <input
          type="text"
          value={tableNumber}
          onChange={(event) => setTableNumber(event.target.value)}
          placeholder="Enter table number"
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Add Table"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {tables.length === 0 ? (
        <p>No tables found.</p>
      ) : (
        <div>
          {tables.map((table) => (
            <div key={table.id}>
              <h3>Table {table.table_number}</h3>

              <p>
                Status: {table.is_active ? "Active" : "Inactive"}
              </p>

              {editingTableId === table.id ? (
                <div>
                  <input
                    type="text"
                    value={editingTableNumber}
                    onChange={(event) =>
                      setEditingTableNumber(event.target.value)
                    }
                  />

                  <button onClick={() => updateTable(table.id)}>
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setEditingTableId(null);
                      setEditingTableNumber("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingTableId(table.id);
                    setEditingTableNumber(table.table_number);
                  }}
                >
                  Edit
                </button>
              )}

              <button
                onClick={() =>
                  updateTableStatus(table.id, !table.is_active)
                }
              >
                {table.is_active ? "Deactivate" : "Activate"}
              </button>

              {table.qr_code_url && (
                <div>
                  <img
                    src={`${BACKEND_URL}${table.qr_code_url}`}
                    alt={`QR code for table ${table.table_number}`}
                    width="150"
                  />

                  <div>
                    <button
                      onClick={() =>
                        window.open(
                          `${BACKEND_URL}${table.qr_code_url}`,
                          "_blank"
                        )
                      }
                    >
                      View QR
                    </button>

                    <a
                      href={`${BACKEND_URL}${table.qr_code_url}`}
                      download={`table_${table.table_number}_qr.png`}
                    >
                      <button type="button">Download QR</button>
                    </a>

                    <button
                      onClick={() => regenerateQR(table.id)}
                    >
                      Regenerate QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default Tables;
