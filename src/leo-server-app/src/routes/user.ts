import User from "../models/user";

const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
router.use(express.json());

router.post("/createUser", async (req: any, res: any) => {
  const { email, role } = req.query;

  const newUser = new User({
    email: email,
    role: role,
  });
  const user = await User.create(newUser);
  res.status(201).json({ message: "User Created", user });
});

router.get("/getAllOperators", async (req: any, res: any) => {
  const { body } = req;

  const operators = await User.find({});
  res.status(201).json({ message: "Fetched operators", operators });
});

router.patch("/updateOperatorRole/:userId", async (req: any, res: any) => {
  const { body, params } = req;
  const id = new mongoose.Types.ObjectId(params.userId);

  const filter = { _id: id };

  const update = { role: body.body.role };

  await User.findOneAndUpdate(filter, update);

  const operator = await User.findOne(filter);
  res.status(201).json({ message: "Fetched operators", operator });
});

router.get("/getUserSatellites", async (req: any, res: any) => {
  const userId = req.query.userId;

  const satellitesOfInterest = await User.findById(userId).populate(
    "satellites"
  );
  res
    .status(200)
    .json({ message: "Fetched satellites of interest", satellitesOfInterest });
});

router.patch("/updateUserSatellites", async (req: any, res: any) => {
  const { body } = req;

  const updateUserSatellites = await User.findByIdAndUpdate(body.userId, {
    satellites: body.satellites,
  }).exec();

  res.status(201).json({
    message: "Updated User's satellites of interest",
    updateUserSatellites,
  });
});

router.get("/getUserByEmail", async (req: any, res: any) => {
  const { query } = req;

  const filter = { email: query.email };

  const user = await User.findOne(filter).exec();

  res.status(201).json({
    message: "Fetched user information",
    user,
  });
});

module.exports = router;
