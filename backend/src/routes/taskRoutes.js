const express = require("express");
const router = express.Router();
const {
    createTask,
    getTasksByHousehold,
    completeTask,
} = require("../controllers/taskController");

router.post("/", createTask);
router.get("/:householdId", getTasksByHousehold);
router.patch("/:taskId/complete", completeTask);

module.exports = router;