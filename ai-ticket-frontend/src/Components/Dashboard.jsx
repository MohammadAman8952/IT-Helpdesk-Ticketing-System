import React, { useEffect, useState } from "react";

// helper for token
const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

function Dashboard({ role }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 search
  const [search, setSearch] = useState("");

  // 📄 pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  // fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth("http://localhost:5000/api/tickets");
      const data = await res.json();

      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }

    } catch (err) {
      console.error("Error fetching tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // update ticket
  const updateStatus = async (id) => {
    try {
      await fetchWithAuth(`http://localhost:5000/api/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Resolved" }),
      });

      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket", err);
    }
  };

  // delete ticket
  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;

    try {
      await fetchWithAuth(`http://localhost:5000/api/tickets/${id}`, {
        method: "DELETE",
      });

      fetchTickets();
    } catch (err) {
      console.error("Error deleting ticket", err);
    }
  };

  // stats
  const total = tickets.length;
  const open = tickets.filter(t => t.status === "Open").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  // 🔍 filter
  const filteredTickets = tickets.filter(ticket =>
    ticket.description.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 pagination logic
  const indexOfLast = currentPage * ticketsPerPage;
  const indexOfFirst = indexOfLast - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirst, indexOfLast);

  // loading UI
  if (loading) {
    return <p className="text-center mt-10">Loading tickets...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-3xl font-bold mb-6 text-center">
        {role === "admin" ? "Admin Dashboard" : "My Tickets"}
      </h2>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded p-4 text-center">
          <h3>Total</h3>
          <p className="text-xl font-bold">{total}</p>
        </div>

        <div className="bg-white shadow rounded p-4 text-center">
          <h3>Open</h3>
          <p className="text-xl font-bold text-red-500">{open}</p>
        </div>

        <div className="bg-white shadow rounded p-4 text-center">
          <h3>Resolved</h3>
          <p className="text-xl font-bold text-green-500">{resolved}</p>
        </div>
      </div>

      {/* 🔍 SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 📋 TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        {filteredTickets.length === 0 ? (
          <p className="text-center p-6 text-gray-500">
            No tickets found 🚫
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Status</th>
                  {role === "admin" && <th className="p-3 text-center">Action</th>}
                </tr>
              </thead>

              <tbody>
                {currentTickets.map(ticket => (
                  <tr key={ticket._id} className="border-t hover:bg-gray-50">

                    <td className="p-3">{ticket.description}</td>

                    {/* status badge */}
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded text-white text-sm ${
                          ticket.status === "Open"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    {/* actions */}
                    {role === "admin" && (
                      <td className="p-3 space-x-2 text-center">

                        {ticket.status === "Open" && (
                          <button
                            onClick={() => updateStatus(ticket._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            ✅ Resolve
                          </button>
                        )}

                        <button
                          onClick={() => deleteTicket(ticket._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          🗑 Delete
                        </button>

                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>

            {/* 📄 PAGINATION */}
            <div className="flex justify-center gap-3 p-4">

              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Prev
              </button>

              <span>Page {currentPage}</span>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={indexOfLast >= filteredTickets.length}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Next
              </button>

            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default Dashboard;