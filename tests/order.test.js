const supertest = require("supertest");
const Game = require("../src/models/Game.model");
const Cart = require("../src/models/Cart.model");
const app = require("../app");

const request = supertest(app);

describe("Order API", () => {
  let token = null;
  let gameId = null;
  let userId = null;
  let orderId = null;

  beforeAll(async () => {
    const game = await Game.create({
      title: "Test Game",
      description: "Great test game",
      genre: "Adventure",
      platform: "PC",
      price: 60,
      stock: 20,
    });
    gameId = game._id;

    const user = {
      name: "Test User",
      email: `test${Date.now()}@email.com`,
      password: "password123",
    };

    await request.post("/api/auth/register").send(user);
    const loginRes = await request.post("/api/auth/login").send(user);
    token = loginRes.body.token;
    userId = loginRes.body.user.id;

    await request
      .post("/api/cart")
      .send({ gameId, quantity: 2 })
      .set("authorization", `Bearer ${token}`);
  });


  it("POST /api/orders - should create an order, clear cart, and reduce game stock", async () => {
    const gameBefore = await Game.findById(gameId);
    const initialStock = gameBefore.stock;

    // Place the order
    const res = await request
      .post("/api/orders")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Order placed successfully");
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.total).toBe(120); // 60 * 2

    orderId = res.body.data._id;

    const cart = await Cart.findOne({
      userId,
    });


    expect(cart.items).toHaveLength(0);

    const gameAfter = await Game.findById(gameId);
    expect(gameAfter.stock).toBe(initialStock - 2);
  });

  it("GET /api/orders - should get user's orders", async () => {
    const res = await request
      .get("/api/orders")
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);

    const order = res.body.data[0];

    expect(order.orderId).toBe(orderId);
    expect(order.total).toBe(120);
    expect(order.status).toBe("placed");
  });

  it("DELETE /api/orders/:orderId - should cancel the order", async () => {
    const res = await request
      .delete(`/api/orders/${orderId}`)
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order has been cancelled successfully.");
    expect(res.body.data.status).toBe("cancelled");
  });
});
