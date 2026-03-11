const supertest = require("supertest");
const Game = require("../src/models/Game.model");
const app =  require("../app");

const request = supertest(app);

describe("Cart API", () => {
  let userId = null;
  let gameId = null;
  let token = null;

  beforeAll(async () => {
    const game = await Game.create({ 
      title: "Test Game", 
      description: "description", 
      genre: "Fantasy", 
      platform: "Steam", 
      price: 100, 
      stock: 10 
    });
    gameId = game._id;

    const user = {
      name: "Mohamed",
      email: `mohamed${Date.now()}@email.com`,
      password: "test123",
    };

    await request.post("/api/auth/register").send(user);
    const loginRes = await request.post("/api/auth/login").send(user);
    userId = loginRes.body.user._id;
    token = loginRes.body.token;
  });

  it("GET /api/cart - should return empty array if cart is empty", async () => {
    const res = await request.get("/api/cart").set("authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it("POST /api/cart - should add item to cart", async () => {
    console.log(gameId, "gameId");
    const res = await request
      .post("/api/cart")
      .send({ gameId, quantity: 2 })
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Game Added to Cart");
    expect(res.body.data.items).toHaveLength(1);
  });

  it("PUT /api/cart/:gameId - should update cart item quantity", async () => {
    const res = await request
      .put(`/api/cart/${gameId}`)
      .send({ quantity: 5 })
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Game Updated in Cart");
  });

  it("DELETE /api/cart/:gameId - should delete item from cart", async () => {
    const res = await request
      .delete(`/api/cart/${gameId}`)
      .set("authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Game Deleted from Cart");
  });
});
