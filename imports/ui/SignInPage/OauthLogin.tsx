import { Button, Paper, Typography } from "@mui/material";
import { Meteor } from "meteor/meteor";
import * as React from "react";
import Stack from "@mui/material/Stack/Stack";

export function OauthLogin(): JSX.Element {
  return (
    <Paper sx={{ padding: 3, margin: 3 }} elevation={6}>
      <Stack spacing={5}>
        <Stack>
          <Typography variant="h2" style={{ textAlign: "center" }}>
            Poll Maker
          </Typography>
          <Typography
            variant="h4"
            style={{ textAlign: "center", color: "gray" }}
          >
            CSE330 Final Project
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            Meteor.loginWithGoogle(
              {},
              (error) => error && console.error("OAUTH ERROR", error)
            );
          }}
        >
          Login With Google
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            Meteor.loginWithFacebook(
              {},
              (error) => error && console.error("OAUTH ERROR", error)
            );
          }}
        >
          Login With Facebook
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            Meteor.loginWithGithub(
              {},
              (error) => error && console.error("OAUTH ERROR", error)
            );
          }}
        >
          Login With Github
        </Button>
      </Stack>
    </Paper>
  );
}
