const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Game = require('../models/Game.model');

class OrderService {
  async createOrder(userId) {
    const cart = await Cart.findOne({ userId }).populate("items.gameId", "price stock");

    if (!cart || !cart.items || cart.items.length === 0) {
      const error = new Error("Cart is empty");
      error.status = 400;
      throw error;
    }

    for (const item of cart.items) {
      if (item.quantity > item.gameId.stock) {
        const error = new Error(`Not enough stock for game: ${item.gameId._id}`);
        error.status = 400;
        throw error;
      }
    }

    const totalPrice = cart.items.reduce((total, item) => {
      const gamePrice = item.gameId.price || 0;
      return total + gamePrice * item.quantity;
    }, 0);

    const order = new Order({
      userId,
      items: cart.items.map(({ gameId, quantity }) => ({
        gameId: gameId._id || gameId,
        quantity
      })),
      total: totalPrice,
      status: "placed",
    });

    await order.save();

    for (const item of cart.items) {
      const game = await Game.findById(item.gameId._id || item.gameId);
      game.stock -= item.quantity;
      await game.save();
    }

    cart.items = [];
    await cart.save();

    return order;
  }

  async getOrdersByUser(userId) {
    const orders = await Order.find({ userId }).populate("items.gameId");

    return orders.map(order => {
      const items = order.items.map(item => {
        const { title, price } = item.gameId;
        const quantity = item.quantity;
        const totalPrice = price * quantity;

        return {
          title: title.trim(),
          price,
          quantity,
          totalPrice
        };
      });

      return {
        orderId: order._id,
        items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });
  }

  async updateOrderStatus(orderId, newStatus) {
    const allowedStatuses = ["placed", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(newStatus)) {
      const error = new Error("Invalid order status");
      error.status = 400;
      throw error;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      throw error;
    }

    if (newStatus === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const game = await Game.findById(item.gameId._id || item.gameId);
        game.stock += item.quantity;
        await game.save();
      }
    }

    order.status = newStatus;
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
