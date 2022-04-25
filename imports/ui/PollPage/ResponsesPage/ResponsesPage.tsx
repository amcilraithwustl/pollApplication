import * as React from "react";
import { useCallback, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { useParams } from "react-router-dom";

import { Button, Grid, Paper, Typography } from "@mui/material";
import {
  fieldTypes,
  PollCollection,
  PollFieldType,
  removeAllResultsMM,
} from "../../../api/pollCollection";

import {
  OverviewGrid,
  TextChart,
  CheckboxChart,
  NumericChart,
  RadioChart,
} from "./TableAndCharts";

export const ResponsesPage = (): JSX.Element => {
  const { id } = useParams();

  const poll = useTracker(() => {
    Meteor.subscribe("pollCollectionQuery");
    return PollCollection.findOne({ _id: id });
  });

  useEffect(() => {
    console.log(poll);
  }, [poll]);

  const selectChartItem = useCallback(
    (f: PollFieldType, i: number) => {
      if (!f.results[0]) {
        return undefined;
      }

      switch (f.fieldType) {
        case fieldTypes.string:
          return (
            <Grid container spacing={3} key={JSON.stringify({ f, i })}>
              <Grid item xs={12}>
                <Typography variant="h5">{f.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {f.results?.length} Responses
                </Typography>
              </Grid>
              <Grid item xs={12} alignItems="center">
                <TextChart results={f.results} />
              </Grid>
            </Grid>
          );
        case fieldTypes.numeric:
          return (
            <Grid container spacing={3} key={JSON.stringify({ f, i })}>
              <Grid item xs={12}>
                <Typography variant="h5">{f.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {f.results?.length} Responses
                </Typography>
              </Grid>
              <Grid item xs={12} alignItems="center">
                <NumericChart results={f.results} />
              </Grid>
            </Grid>
          );
        case fieldTypes.checkbox:
          return (
            <Grid container spacing={3} key={JSON.stringify({ f, i })}>
              <Grid item xs={12}>
                <Typography variant="h5">{f.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {f.results?.length} Responses
                </Typography>
              </Grid>
              <Grid item xs={12} alignItems="center">
                <CheckboxChart
                  results={f.results}
                  choiceOptions={f.choiceOptions}
                />
              </Grid>
            </Grid>
          );
        case fieldTypes.radio:
          return (
            <Grid container spacing={3} key={JSON.stringify({ f, i })}>
              <Grid item xs={12}>
                <Typography variant="h5">{f.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {f.results?.length} Responses
                </Typography>
              </Grid>
              <Grid item xs={12} alignItems="center">
                <RadioChart
                  results={f.results}
                  choiceOptions={f.choiceOptions}
                />
              </Grid>
            </Grid>
          );
        default:
          // ERROR
          return undefined;
      }
    },
    [poll]
  );
  if (!poll) return <div />;
  return (
    <div>
      <Grid container>
        <Typography variant="h3">{poll.title}</Typography>
        <Grid item container spacing={2}>
          <Grid item xs={12}>
            <Paper style={{ padding: 10 }}>
              <OverviewGrid fields={poll.fields} />
            </Paper>
          </Grid>
          {poll.fields.map(selectChartItem).map(
            (item) =>
              item && (
                <Grid key={item.key} item xs={12} >
                  <Paper style={{ padding: 10 }}>{item}</Paper>
                </Grid>
              )
          )}
        </Grid>
        <Grid item>
          <Button
            size="small"
            color="secondary"
            onClick={() => {
              removeAllResultsMM.call({ id: poll._id }, (err: unknown) => {
                if (err) {
                  console.log(err);
                }
              });
            }}
          >
            Delete All Results
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
