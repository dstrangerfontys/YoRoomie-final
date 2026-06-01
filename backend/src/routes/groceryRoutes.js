const express = require("express");
const router = express.Router();
const {
    createGrocery,
    getGroceriesByHousehold,
    completeGrocery,
    deleteGrocery,
    updateGrocery,
} = require("../controllers/groceryController");

router.post("/", createGrocery);
router.get("/:householdId", getGroceriesByHousehold);
router.patch("/:itemId/complete", completeGrocery);
router.patch("/:itemId", updateGrocery);
router.delete("/:itemId", deleteGrocery);

module.exports = router;