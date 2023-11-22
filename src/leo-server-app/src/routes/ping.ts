import { exec } from "child_process";
import { promisify } from "util";

const Ping = require("../models/ping");
const execAsync = promisify(exec);
const express = require("express");

const router = express.Router();
router.use(express.json());

router.get("/ping", (req: any, res: any) => {
  const ipAddress = "192.168.2.247"; 
  execAsync(`ping -c 4 ${ipAddress}`)
    .then(({ stdout }) => {
      const pingResult = new Ping({
        ipAddress,
        pingOutput: stdout,
        success: true,
      });

      res.json({ output: stdout });
    })
    .catch((error) => {
      console.error("Error:", error);
      const pingResult = new Ping({
        ipAddress,
        pingOutput: error.message,
        success: false,
      });

      res
        .status(500)
        .json({ output: `Error executing ping: ${error.message}` });
    });
});
module.exports = router;
