const express = require("express");
const router = express.Router();
const {
    createGrocery,
    getGroceriesByHousehold,
    completeGrocery,
} = require("../controllers/groceryController");

router.post("/", createGrocery);
router.get("/:householdId", getGroceriesByHousehold);
router.patch("/:itemId/complete", completeGrocery);

module.exports = router;