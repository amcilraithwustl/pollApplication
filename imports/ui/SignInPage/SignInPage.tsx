import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Navigate, useLocation } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { OauthLogin } from "./OauthLogin";

// Template from MUI

const theme = createTheme();

export default function SignInPage(): JSX.Element {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const from = location?.state?.from?.pathname || "/";
  const userId = useTracker(() => Meteor.userId());
  if (userId) {
    return <Navigate to={from} replace />;
  }
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{ justifyContent: "center", alignContent: "center", height: "90vh" }}
    >
      <OauthLogin />
    </Container>
  );
}
