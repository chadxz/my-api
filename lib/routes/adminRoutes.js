"use strict";
const express = require("express");
const { get } = require("lodash");
const router = express.Router();

router.get("/", (req, res) => {
  req.services.pocket.getLocalAuthorization((err, auth) => {
    if (err) {
      res.serverError(err);
      return;
    }

    const pocketUsername = get(auth, "username");
    res.render("admin", { pocketUsername });
  });
});

module.exports = router;
