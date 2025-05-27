const request = require("supertest");
const app = require("../../app");

describe("Test /GET launches", () => {
  it("should respond with 200 success", async () => {
    const response = await request(app).get("/launches");
    expect(response.statusCode).toBe(200);
  });
});
describe("Test /POST launches", () => {
  it("should respond with 200 success", () => {});
  it("should catch required missing properties", () => {});
  it("should catch require invalid dates", () => {});
});
