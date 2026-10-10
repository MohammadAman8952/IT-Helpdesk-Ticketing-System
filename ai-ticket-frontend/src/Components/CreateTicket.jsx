import React, { useState } from "react";

function CreateTicket() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 AI analyze (optional)
  const handleAnalyze = async () => {
    if (!description.trim()) {
      alert("Enter issue first ❌");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai-classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      setCategory(data.category || "");
      setPriority(data.priority || "");
    } catch (err) {
      alert("AI service not available ❌");
    }

    setLoading(false);
  };

  // ✅ CREATE TICKET
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first ❌");
      return;
    }

    if (!description.trim()) {
      alert("Description required ❌");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`   // ✅ CORRECT
        },
        body: JSON.stringify({
          description,
          category,
          priority,
        }),
      });

      const data = await res.json();
      console.log("CREATE RESPONSE 👉", data);

      if (!res.ok) {
        alert(data.message || "Failed ❌");
        return;
      }

      alert("Ticket created ✅");

      // reset form
      setDescription("");
      setCategory("");
      setPriority("");

    } catch (err) {
      alert("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-xl font-bold mb-4 text-center">
          Create Ticket
        </h2>

        <textarea
          placeholder="Describe your issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          type="button"
          onClick={handleAnalyze}
          className="bg-blue-500 text-white w-full py-2 mb-3"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <input
          value={category}
          readOnly
          placeholder="Category"
          className="border p-2 w-full mb-3 bg-gray-100"
        />

        <input
          value={priority}
          readOnly
          placeholder="Priority"
          className="border p-2 w-full mb-3 bg-gray-100"
        />

        <button className="bg-green-500 text-white w-full py-2">
          Submit
        </button>

      </form>

    </div>
  );
}

export default CreateTicket;