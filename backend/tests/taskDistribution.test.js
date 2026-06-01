const request = require("supertest");
const express = require("express");

jest.mock("../src/config/db", () => ({
    query: jest.fn(),
}));

const pool = require("../src/config/db");
const taskRoutes = require("../src/routes/taskRoutes");

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

describe("POST /api/tasks - eerlijke taakverdeling", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("wijst een taak toe aan een gebruiker met het laagste aantal taken", async () => {
        pool.query
            .mockResolvedValueOnce([
                [
                    { user_id: 1, name: "Dylan", taskCount: 2 },
                    { user_id: 2, name: "Beau", taskCount: 0 },
                    { user_id: 3, name: "Tijs", taskCount: 1 },
                ],
            ])
            .mockResolvedValueOnce([{ insertId: 10 }]);

        const response = await request(app)
            .post("/api/tasks")
            .send({
                householdId: 5,
                title: "Vuilnis buiten zetten",
                description: "Restafval aan straat zetten",
                dueDate: "2026-05-20",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Task created and assigned to Beau");

        expect(response.body.task).toEqual({
            id: 10,
            householdId: 5,
            title: "Vuilnis buiten zetten",
            description: "Restafval aan straat zetten",
            assignedToUserId: 2,
            assignedToName: "Beau",
            dueDate: "2026-05-20",
            status: "open",
        });

        expect(pool.query).toHaveBeenCalledTimes(2);

        const insertQueryArguments = pool.query.mock.calls[1][1];

        expect(insertQueryArguments).toEqual([
            5,
            "Vuilnis buiten zetten",
            "Restafval aan straat zetten",
            2,
            "2026-05-20",
        ]);
    });

    test("geeft 400 terug als householdId of title ontbreekt", async () => {
        const response = await request(app)
            .post("/api/tasks")
            .send({
                description: "Geen geldige taak",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("householdId and title are required");
    });

    test("geeft 404 terug als er geen household members zijn", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .post("/api/tasks")
            .send({
                householdId: 5,
                title: "Keuken schoonmaken",
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No household members found");
    });
});