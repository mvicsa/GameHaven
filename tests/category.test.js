const User = require("../src/models/User.model");
const supertest = require("supertest");
const app =  require("../app");

const request = supertest(app);

describe("Category Controller", () => {
  let userId = null;
  let categoryId = null;
  let token;

  beforeAll(async () => {
    const user = {
      name: "Mohamed",
      email: `mohamed${Date.now()}@email.com`,
      password: "test123",
      role: "admin"
    };
    
    await User.create(user);

    const logged = await request.post("/api/auth/login").send({ email: user.email, password: user.password });
    userId = logged.body.user._id;
    token = logged.body.token;
  });

  it("GET /api/categories - should return empty array if categories is empty", async () => {
    const res = await request.get("/api/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/categories - should add new Category", async () => {
    const res = await request.post("/api/categories").send({
      name: "Category"
    }).set({ authorization: `Bearer ${token}` });

    categoryId = res.body.data._id;
    
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Category Added Successfully!");
    expect(res.body.data).toHaveProperty("name");
  });

  it("PUT /api/categories/:categoryId - should update category name", async () => {
    const res = await request.put(`/api/categories/${categoryId}`).send({
      name: "Category 2"
    }).set({ authorization: `Bearer ${token}` });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category Updated Successfully!");
  });

  it("DELETE /api/categories/:categoryId - should delete item from cart", async () => {
    const res = await request.delete(`/api/categories/${categoryId}`).set({ authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category Deleted Successfully!");
  });
});
