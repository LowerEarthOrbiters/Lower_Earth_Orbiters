import Command from "../models/command";
import Log from "../models/log";
import Schedule from "../models/schedule";
import { CommandStatus } from "../types/command";
import nodeSchedule from "node-schedule";
import { getNextPasses } from "../utils/satellite.utils";
import { scheduleJobForNextOverpass } from "../jobs/schedule.job";
import { ScheduleEventEmitter } from "../event/schedule.event";
import { ScheduleStatus } from "../types/schedule";
import SatelliteUser from "../models/satelliteUser";
import globals from "../globals/globals";

const { sendDataToClientAndAwaitResponse } = require("../messageHandler");

const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

// Executes command sequences for the specified schedule
export const executeScheduledCommands = async (
  satelliteId: string,
  scheduleId: string
) => {
  const schedule = await Schedule.findById(scheduleId).exec();
  const filter = {
    scheduleId: scheduleId,
    status: CommandStatus.QUEUED,
  };

  const jobName = satelliteId + "_" + scheduleId;

  // ---- Get commands ----
  const commands = await Command.find(filter)
    .sort({ createdAt: "asc", priority: "asc" })
    .exec();

  const length = commands.length;
  let ind = 0;

  const endTime = schedule?.endDate.getTime();
  let currTime = Date.now();

  // ---- Loop through commands and execute them ----
  while (schedule?.startDate && endTime && endTime > Date.now()) {
    if (ind >= length || !globals.jobFlags[jobName]) {
      break;
    }

    const currCommand = commands[ind];

    // Execute command - second parameter is timeout
    const respMsg = await sendDataToClientAndAwaitResponse(
      currCommand.command,
      3000
    );

    const response = { message: respMsg };

    // update cmd
    await Command.findByIdAndUpdate(currCommand.id, {
      status: CommandStatus.EXECUTED,
    }).exec();

    const logObj = {
      commandId: currCommand.id,
      user: currCommand.userId,
      satelliteId: satelliteId,
      scheduleId: scheduleId,
      response: response,
    };
    // store log
    await Log.create(logObj);

    ind += 1;
    delay(3000); // delay
    currTime = Date.now();
  }

  // ---- Reschedule any left over commands ----
  // const nextSchedule = await rescheduleLeftoverCommands(
  //   satelliteId,
  //   scheduleId
  // );

  //   Emit event to create new schedule
  ScheduleEventEmitter.emit(
    "overpassFinished",
    scheduleId,
    satelliteId
    // nextSchedule?.id,
    // nextSchedule?.startDate
  );
};

// Reschedules remaining commands to a satellite's next overpass
export const rescheduleLeftoverCommands = async (
  satelliteId: string,
  scheduleId: string
) => {
  //   Get next scheduled overpass
  const nextSchedule = await Schedule.findOne({
    satelliteId: satelliteId,
    status: ScheduleStatus.FUTURE,
  })
    .sort({ created: "desc" })
    .exec();

  // Reschedule all commands that have not been executed for the next overpass
  await Command.updateMany(
    { scheduleId: scheduleId, status: CommandStatus.QUEUED },
    { $set: { scheduleId: nextSchedule?.id, priority: 2 } }
  ).exec();

  return nextSchedule;
};

export const verifyUserCommands = async (
  satelliteId: string,
  userId: string,
  commands: string[]
) => {
  // Get satellite data
  const comms = await validateUserCommands(satelliteId, userId);

  // Check if commands are valid
  return commands.every((cmd) => comms?.includes(cmd));
};

export const validateUserCommands = async (
  satelliteId: string,
  userId: string
) => {
  const filter = {
    satelliteId: satelliteId,
    userId: userId,
  };
  const record = await SatelliteUser.find(filter)
    .sort({ createdAt: "desc" })
    .exec();

  if (record == undefined || record.length < 1) {
    return [];
  }

  return record[0].validCommands;
};

// Fetches and records a satellite's overpass schedules for the next 7 days
export const addSchedulesForNext7Days = async (
  satelliteId: string,
  noradId: string
) => {
  const nextPasses = await getNextPasses(noradId);
  let requestObjArray = [];

  // Loop through each overpass and format the request
  for (let overpass of nextPasses) {
    const [enterInfo, exitInfo] = overpass;
    const reqObj = {
      startDate: new Date(enterInfo?.time ?? ""),
      endDate: new Date(exitInfo?.time ?? ""),
      satelliteId: satelliteId,
    };

    requestObjArray.push(reqObj);
  }

  const job = nodeSchedule.scheduledJobs[satelliteId];

  // Bulk write schedules
  const createdSchedules = await Schedule.insertMany(requestObjArray);

  const firstSchedule = createdSchedules[0];

  if (!job) {
    scheduleJobForNextOverpass(
      satelliteId,
      firstSchedule.id,
      firstSchedule.startDate
    );
  }

  return createdSchedules;
};

export const hasSchedulePassed = async (scheduleId: string) => {
  const scheduleRecord = await Schedule.findById(scheduleId);

  const endTime = scheduleRecord?.endDate?.getTime();
  if (endTime && endTime < Date.now()) {
    return true;
  }
  return false;
};
