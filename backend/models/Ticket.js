import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  description: String,
  category: String,
  priority: String,
  status: {
    type: String,
    default: "Open"
  },
  userId: String   // ✅ IMPORTANT (owner)
});

export default mongoose.model("Ticket", ticketSchema);