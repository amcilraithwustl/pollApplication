import * as React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Button, IconButton, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  PollCollection,
  PollCollectionInsertMM,
  removePollCollectionMM,
} from "../../api/pollCollection";

export const PollListPage = (): JSX.Element => {
  const { query, subState } = useTracker(() => {
    const s = Meteor.subscribe("pollCollectionQuery");
    return { query: PollCollection.find({}).fetch(), subState: s };
  });

  console.log(query, subState);

  const navigate = useNavigate();

  const theme = createTheme();

  const addNewPollHandler = () => {
    console.log("PRESSED");
    const time = new Date();
    time.setHours(time.getHours() + 24);
    PollCollectionInsertMM.call(
      {
        newPoll: {
          anonymous: false,
          fields: [],
          owner: Meteor.userId() || "",
          terminationTime: time,
          title: "Untitled Poll",
        },
      },
      (error, _id) => {
        if (_id) {
          console.log(_id);
        } else {
          console.error(`INSERT ERROR`, error?.error);
        }
      }
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h2" align="center">
              Your Polls
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={addNewPollHandler}>
                Create A New Poll
              </Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {query.map((poll) => (
              <Grid item key={poll._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      onClick={() => navigate(`/polls/${poll._id}/questions`)}
                    >
                      {poll.title}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Stack>
                      <TextField
                        label="Link to Poll"
                        value={`${window.location.origin}/poll/${poll._id}`}
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/poll/${poll._id}`
                                )
                              }
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          ),
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          navigate(`/poll/${poll._id}`);
                        }}
                      >
                        Take
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          navigate(`/polls/${poll._id}/questions`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          navigate(`/polls/${poll._id}/responses`);
                        }}
                      >
                        Results
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          removePollCollectionMM.call(
                            { id: poll._id },
                            (err: unknown) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </ThemeProvider>
  );
};
