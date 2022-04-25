import * as React from "react";
import Box from "@mui/material/Box";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Button, Divider, Paper } from "@mui/material";

export const PollPage = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div style={{ boxSizing: "border-box" }}>
      <Box sx={{ boxSizing: "border-box" }}>
        <Grid item container spacing={2}>
          <Grid item>
            <Button
              onClick={() => navigate("./questions")}
              variant={
                window.location.pathname.endsWith("/questions")
                  ? "contained"
                  : "outlined"
              }
            >
              QUESTIONS
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => navigate("./responses")}
              variant={
                window.location.pathname.endsWith("/responses")
                  ? "contained"
                  : "outlined"
              }
            >
              RESPONSES
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Divider style={{ marginBottom: 15, marginTop: 15 }} />
      <Outlet />
    </div>
  );
};
