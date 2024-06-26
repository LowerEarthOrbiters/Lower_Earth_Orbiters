import {
  BACKEND_URL,
  executeSchedule,
  removeCommandFromSchedule,
  stopSchedule,
} from "@/constants/api";
import { useGetCommandsBySchedule, useGetPingSocket } from "@/constants/hooks";
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SchedulerTerminal from "./SchedulerTerminal";
import LogByCommandModal from "./LogByCommandModal";
import SocketConnection from "./SocketConnection";

const socket = io(`${BACKEND_URL}/logs_connect`);

const ExecuteScheduleCard = () => {
  //   Router
  const router = useRouter();
  const userId: string = "65a8181f36ea10b4366e1dd9";
  const satelliteId = router.query?.satId?.toString() ?? "";
  const scheduleId = router.query?.scheduleId?.toString() ?? "";

  //   React-query Fetching hooks
  const commandsData = useGetCommandsBySchedule(scheduleId);
  const pingSocket = useGetPingSocket();
  const queryClient = useQueryClient();

  // -------- Constants --------
  const isSocketActive =
    pingSocket.data?.output &&
    pingSocket.data.output !== "WEBSOCKET_NOT_CONNECT";

  // -------- States --------
  const [error, setError] = useState("");

  //   Executing schedule states
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [commandToLogMap, setCommandToLogMap] = useState<any>({});
  const [isQueueEmpty, setIsQueueEmpty] = useState<boolean>(false);

  //   Modal states
  const [openLog, setOpenLog] = useState<boolean>(false);
  const [commandToView, setCommandToView] = useState<string>("");

  // -------- Helpers --------

  // Log Modal
  const handleLogOpen = (id: string) => {
    setCommandToView(id);
    setOpenLog(true);
  };

  const handleLogClose = () => {
    setCommandToView("");
    setOpenLog(false);
  };

  // Schedule Queue
  const executeScheduleQueue = async () => {
    try {
      setIsExecuting(true);
      await executeSchedule(scheduleId, satelliteId);
    } catch (error) {
      setIsExecuting(false);
      console.error(error);
    }
  };

  const stopScheduleQueue = async () => {
    setIsExecuting(false);
    try {
      await stopSchedule(scheduleId, satelliteId);
    } catch (error) {
      console.error(error);
    }
  };

  // Mutation function for deletion
  const { mutate } = useMutation({
    mutationFn: (values: any) =>
      removeCommandFromSchedule(values.commandId, values.userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },

    onError: () => {
      setError("Invalid permissions");
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["useGetCommandsBySchedule"] });
    },
  });

  const removeCommand = async (commandId: string) => {
    setError("");
    mutate({ commandId, userId });
  };

  //   -------- useEffect hooks --------

  //   Manages socket connection (real-time communication)
  useEffect(() => {
    socket.on("logUpdate", async (update) => {
      const id = update?.fullDocument?.commandId ?? "";
      if (id) {
        setCommandToLogMap((prevCommands: any) => ({
          ...prevCommands,
          [id]: update.fullDocument.response,
        }));
      }
      await queryClient.invalidateQueries({
        queryKey: ["useGetCommandsBySchedule"],
      });
    });

    return () => {
      if (socket.active.valueOf()) {
        socket.off("logUpdate");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Updates every time commands updates
  useEffect(() => {
    if (commandsData.data?.commands?.length) {
      let tempMap: any = {};
      for (const cmd of commandsData.data.commands) {
        tempMap[cmd._id] = null;
      }
      const hasOneQueuedCommand = commandsData.data?.commands?.some(
        (cmd: any) => cmd.status === "QUEUED"
      );
      setCommandToLogMap(tempMap);
      if (!hasOneQueuedCommand) {
        setIsExecuting(false);
      }
      setIsQueueEmpty(!hasOneQueuedCommand);
    }
    setError("");
  }, [commandsData.data]);

  return (
    <Stack
      sx={{ width: "100%", maxWidth: 1000 }}
      alignItems="center"
      spacing={4}
      py={10}>
      <Typography
        align="center"
        variant="h3"
        style={{
          width: "100%",
          color: "var(--material-theme-sys-light-secondary-container",
          marginBottom: "1px",
        }}>
        Schedule
      </Typography>
      {error && (
        <Typography style={{ color: "var(--material-theme-sys-light-error)" }}>
          {error}
        </Typography>
      )}
      <SocketConnection isSocketActive={isSocketActive} />
      <br></br>
      <Stack direction={"row"} width={800} justifyContent={"flex-end"}>
        <Button
          disabled={isQueueEmpty || !isSocketActive}
          sx={{
            "&.Mui-disabled": {
              opacity: 0.64,
              backgroundColor: "gray",
              color: "white",
            },
          }}
          color={!isQueueEmpty && isExecuting ? "error" : "success"}
          onClick={() => {
            if (isQueueEmpty) {
              return;
            }

            if (isExecuting) {
              stopScheduleQueue();
            } else {
              executeScheduleQueue();
            }
          }}
          variant="contained">
          {!isQueueEmpty && isExecuting ? "Stop" : "Execute"}
        </Button>
      </Stack>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 800,
          background: "var(--material-theme-sys-dark-primary-fixed)",
        }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderLeft: 2,
                  borderRight: 2,
                }}
                align="left">
                Command
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Status
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Operator
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Created
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Delete
              </TableCell>
              <TableCell
                sx={{
                  color: "var(--material-theme-black)",
                  borderTop: 2,
                  borderRight: 2,
                }}
                align="left">
                Logs
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commandsData.data?.commands &&
              commandsData.data.commands.length > 0 &&
              commandsData.data.commands.map((item: any, index: number) => (
                <TableRow
                  key={item._id + index}
                  sx={{
                    borderBottom: 2,
                    borderTop: 2,
                    borderLeft: 2,
                    borderRight: 2,
                    // "&:last-child td, &:last-child th": { border: 1 },
                  }}>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left"
                    component="th"
                    scope="row">
                    {item.command}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    {item.status === "EXECUTED"
                      ? item.status
                      : commandToLogMap[item._id]
                      ? "EXECUTED"
                      : "QUEUED"}
                    {/* {item.status} */}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    {item.userId.email}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    {new Date(item.createdAt.toString()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ color: "black !important", borderRight: 2 }}
                    align="left">
                    <Button
                      variant="text"
                      sx={{ color: "var(--material-theme-sys-light-error)" }}
                      disabled={item.status === "EXECUTED" || isExecuting}
                      onClick={() => removeCommand(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    {item.status === "EXECUTED" || commandToLogMap[item._id] ? (
                      <Button
                        variant="text"
                        sx={{
                          color: "var(--material-theme-sys-dark-on-primary)",
                          backgroundColor:
                            "var(--material-theme-sys-dark-primary)",
                          borderRadius: "10px",
                        }}
                        onClick={() => handleLogOpen(item._id)}>
                        Show Logs
                      </Button>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack sx={{ width: "100%" }} spacing={3} alignItems="center">
        <Typography variant="h3">Scheduler Terminal</Typography>
        <Typography variant="h6">
          You can also send commands through this integrated terminal instead by
          stopping the above schedule. <br></br>
          Note: The terminal cannot be used during execution of the above
          schedule.
        </Typography>
        <br></br>
        <SocketConnection isSocketActive={isSocketActive} />

        <SchedulerTerminal
          disabled={(isExecuting && !isQueueEmpty) || !isSocketActive}
        />
      </Stack>
      <LogByCommandModal
        open={openLog}
        commandId={commandToView}
        handleClose={handleLogClose}
      />
    </Stack>
  );
};

export default ExecuteScheduleCard;
