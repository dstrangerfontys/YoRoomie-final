const request = require("supertest");
const express = require("express");

jest.mock("../src/config/db", () => ({
    query: jest.fn(),
}));

const pool = require("../src/config/db");
const householdRoutes = require("../src/routes/householdRoutes");

const app = express();
app.use(express.json());
app.use("/api/households", householdRoutes);

describe("POST /api/households", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("maakt een nieuw huishouden aan en voegt de gebruiker toe als owner", async () => {
        pool.query
            .mockResolvedValueOnce([{ insertId: 1 }])
            .mockResolvedValueOnce([{}]);

        const response = await request(app)
            .post("/api/households")
            .send({
                name: "Test Huis",
                userId: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Household created successfully");
        expect(response.body.household.name).toBe("Test Huis");
        expect(response.body.household.createdByUserId).toBe(1);

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("geeft 400 terug als naam of userId ontbreekt", async () => {
        const response = await request(app)
            .post("/api/households")
            .send({
                name: "",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Name and userId are required");
    });
});