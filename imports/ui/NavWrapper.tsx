import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Outlet, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { Accounts } from "meteor/accounts-base";

export const NavWrapper = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => navigate("/polls")}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Polling
          </Typography>
          <Button color="inherit" onClick={() => Accounts.logout()}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ padding: 10 }}>
        <div style={{ boxSizing: "border-box" }}>
          <Outlet />
        </div>
      </div>
    </Box>
  );
};
