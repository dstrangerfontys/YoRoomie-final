const express = require("express");
const router = express.Router();
const {
    createHousehold,
    getUserHouseholds,
    joinHousehold,
} = require("../controllers/householdController");

router.post("/", createHousehold);
router.post("/join", joinHousehold);
router.get("/:userId", getUserHouseholds);

module.exports = router;