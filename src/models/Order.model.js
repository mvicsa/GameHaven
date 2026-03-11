const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [
        {
          gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true
          },
          quantity: {
            type: Number,
            required: true,
            min: 1
          }
        }
      ],
      default: []
    },
    total: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);