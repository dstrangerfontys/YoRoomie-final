const express = require("express");
const router = express.Router();
const {
    createTask,
    getTasksByHousehold,
    completeTask,
    deleteTask,
    updateTask,
} = require("../controllers/taskController");

router.post("/", createTask);
router.get("/:householdId", getTasksByHousehold);
router.patch("/:taskId/complete", completeTask);
router.delete("/:taskId", deleteTask);
router.patch("/:taskId", updateTask);

module.exports = router;