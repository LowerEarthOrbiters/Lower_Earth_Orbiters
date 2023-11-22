import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const express = require("express");

const router = express.Router();
router.use(express.json());

router.get("", (req: any, res: any) => {
  const ipAddress = "192.168.2.247";
  execAsync(`ping ${ipAddress}`)
    .then(({ stdout }) => {
      res.json({ output: stdout });
    })
    .catch((error) => {
      console.error("Error:", error);

      res
        .status(500)
        .json({ output: `Error executing ping: ${error.message}` });
    });
});
module.exports = router;
