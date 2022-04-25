import { Accounts } from "meteor/accounts-base";
import { Button } from "@mui/material";
import React from "react";

export const LogoutButton = (): JSX.Element => {
  return <Button onClick={() => Accounts.logout()}>Logout</Button>;
};
