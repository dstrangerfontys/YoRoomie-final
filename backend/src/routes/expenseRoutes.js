const express = require("express");
const router = express.Router();
const {
    createExpense,
    getExpensesByHousehold,
    getBalancesByHousehold,
} = require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/:householdId/balances", getBalancesByHousehold);
router.get("/:householdId", getExpensesByHousehold);

module.exports = router;