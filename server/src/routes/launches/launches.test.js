const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongooseDiconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongooseDiconnect();
  });

  describe("Test /GET launches", () => {
    it("should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  describe("Test /POST launches", () => {
    const completeLaunchData = {
      mission: "Kepler Exploration",
      rocket: "Explorer IS1",
      launchDate: new Date("December 27, 2030"),
      target: "Kepler-442 b",
    };

    const launchDataWithoutDate = {
      mission: "Kepler Exploration",
      rocket: "Explorer IS1",
      target: "Kepler-442 b",
    };

    const launchDataWithInvalidDate = {
      mission: "Kepler Exploration",
      rocket: "Explorer IS1",
      launchDate: "hello world",
      target: "Kepler-442 b",
    };

    it("should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
    it("should catch required missing properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    it("should catch require invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({ error: "Invalid launch date" });
    });
  });
});
