const express = require("express");
const router = express.Router();
const {
    createExpense,
    getExpensesByHousehold,
    getBalancesByHousehold,
    getExpenseParticipants,
    settleParticipant,
    getSettlementsByHousehold,
} = require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/:householdId/balances", getBalancesByHousehold);
router.get("/:expenseId/participants", getExpenseParticipants);
router.get("/:householdId/settlements", getSettlementsByHousehold);
router.get("/:householdId", getExpensesByHousehold);
router.patch("/participants/:participantId/settle", settleParticipant);

module.exports = router;