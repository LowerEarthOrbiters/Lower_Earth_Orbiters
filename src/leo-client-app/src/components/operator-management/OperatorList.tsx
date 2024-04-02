import { useGetAllOperators } from "@/constants/hooks";
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import EditUserRoleModal from "./EditUserRoleModal";
import {getValidCommands} from "@/constants/api";
import axios from "axios";
import { useRouter } from "next/router";



const OperatorList: React.FC = () => {

  const router = useRouter();
  let { satId } = router.query as {
    satId: string;
  };

  const satelliteId = satId;

  const [open, setOpen] = useState(false);
  const operators = useGetAllOperators();

  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  const [commands, setCommands] = useState([]);
  const [loadingCommands, setLoadingCommands] = useState(false);
  
  const fetchCommands = async (satelliteId: string, user:string) => {
    setLoadingCommands(true);
    const fetchedCommands = await getValidCommands(satelliteId, user);
    setCommands(fetchedCommands);
    setLoadingCommands(false);
  };

  const handleClickOpen = (user:string) => {
    fetchCommands(satelliteId, user);
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleModalOpen = (userData: any) => {
    setUserToEdit(userData);
    setOpenEditModal(true);
  };

  const handleModalClose = () => {
    setUserToEdit(null);
    setOpenEditModal(false);
  };



  return (
    <Stack sx={{ width: "100%" }} alignItems="center" spacing={3} py={5}>
      <Typography variant="h5">Users</Typography>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 800,
          background: "#40403fb0",
        }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white !important" }} align="left">
                Email
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Role
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Edit
              </TableCell>
              <TableCell sx={{ color: "white !important" }} align="left">
                Manage Commands
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operators?.data &&
              operators.data.operators.map((user: any, index: number) => (
                <TableRow
                  key={user._id + index}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}>
                  <TableCell
                    sx={{ color: "white !important" }}
                    align="left"
                    component="th"
                    scope="row">
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    {user.role}
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                    <Button
                      variant="text"
                      sx={{ color: "#6cb6ff" }}
                      onClick={() => handleModalOpen(user)}>
                      Edit Role
                    </Button>
                  </TableCell>
                  <TableCell sx={{ color: "white !important" }} align="left">
                  <Button
                      key={index}
                      variant="text"
                      sx={{
                        color: 'var(--material-theme-white)',
                        backgroundColor: 'var(--material-theme-sys-dark-primary)',
                        borderRadius: '10px',
                      }}
                      onClick={() => handleClickOpen(user)} 
                    >
                      View Commands
                    </Button>
                    <Dialog open={open} onClose={handleClose}>
                      <DialogTitle>View Commands</DialogTitle>
                        <DialogContent>
                          <Typography variant = "h7"> Commands for this User:</Typography>
                          {loadingCommands ? (
                            <Typography>Loading...</Typography>
                            ) : (
                              commands.length > 0 ? (
                                commands.map((command, index) => (
                                  <Typography key={index}>{command}</Typography>
                                ))
                              ) : (
                                <Typography>No commands found.</Typography>
                              )
                            )}
                          <TextField
                            margin="dense"
                            id="Add Command"
                            label="Add Command"
                            type="number"
                            fullWidth
                            variant="standard"
                            required
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleClose}>Cancel</Button>
                          <Button type="submit">Add Command</Button>
                        </DialogActions>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <EditUserRoleModal
        open={openEditModal}
        userData={userToEdit}
        handleClose={handleModalClose}
      />
    </Stack>
  );
};

export default OperatorList;
