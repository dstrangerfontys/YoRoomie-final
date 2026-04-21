const express = require("express");
const router = express.Router();
const {
    createExpense,
    getExpensesByHousehold,
} = require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/:householdId", getExpensesByHousehold);

module.exports = router;