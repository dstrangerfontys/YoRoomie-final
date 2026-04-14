const express = require("express");
const router = express.Router();
const {
    createHousehold,
    getUserHouseholds,
} = require("../controllers/householdController");

router.post("/", createHousehold);
router.get("/:userId", getUserHouseholds);

module.exports = router;