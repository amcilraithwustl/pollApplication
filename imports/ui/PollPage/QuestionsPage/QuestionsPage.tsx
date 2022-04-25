import * as React from "react";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack/Stack";
import { Button, Grid, TextField } from "@mui/material";
import { Meteor } from "meteor/meteor";
import { useParams } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import Container from "@mui/material/Container";
import Switch from "@mui/material/Switch";
import { PollField } from "./PollField";
import {
  fieldTypes,
  PollCollection,
  PollCollectionItemType,
  PollCollectionUpdateMM,
  PollFieldType,
} from "../../../api/pollCollection";
import { deleteOutOfPlace, setOutOfPlace } from "../../../api/utils";

export const QuestionsPage = (): JSX.Element => {
  const [newPoll, setNewPoll] = useState<PollCollectionItemType | undefined>(
    undefined
  );

  const { id } = useParams();
  const poll = useTracker(() => {
    Meteor.subscribe("pollCollectionQuery");
    console.log(PollCollection.find({ _id: id }).fetch());
    return PollCollection.find({ _id: id }).fetch()[0];
  }, []);

  useEffect(() => {
    setNewPoll(poll);
  }, [poll]);

  const pollSubmitHandler = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    console.log(newPoll);
    if (newPoll)
      PollCollectionUpdateMM.call({ newPoll }, (_err, results) => {
        if (!_err) {
          console.log(`${results} has been updated!`);
        } else {
          alert("Please check your input！");
          console.log(`${results} has error: ${_err}`);
        }
      });
  };
  const getDateTime = (d: Date): string => {
    // const s = d.toISOString().slice(0, 16);
    const s = d
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(" ", "T");
    // console.log(s);
    return s;
  };

  if (!newPoll) return <div />;
  return (
    <div style={{ boxSizing: "border-box" }}>
      <Container>
        <form onSubmit={pollSubmitHandler}>
          <Stack spacing={3}>
            <TextField
              value={newPoll.title}
              label="Title"
              placeholder="Title"
              error={newPoll.title === ""}
              helperText={newPoll.title === "" ? "Title cannot be empty" : ""}
              onChange={(event) => {
                setNewPoll({
                  ...newPoll,
                  title: event.target.value,
                });
              }}
            />
            <label htmlFor="meeting-time">Choose a Termination Time:</label>
            <TextField
              type="datetime-local"
              id="meeting-time"
              name="meeting-time"
              value={getDateTime(newPoll.terminationTime)}
              onChange={(event) => {
                console.log(event.target.value);
                setNewPoll({
                  ...newPoll,
                  terminationTime: new Date(event.target.value),
                });
              }}
            />
            <Switch
              checked={newPoll.anonymous}
              onChange={(event) => {
                setNewPoll({
                  ...newPoll,
                  anonymous: event.target.checked,
                });
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
            Anonymous Poll
            {newPoll.fields.map((f, i) => (
              // eslint-disable-next-line max-len
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={i} item xs={12}>
                <PollField
                  field={f}
                  setField={(newField: PollFieldType) =>
                    setNewPoll({
                      ...newPoll,
                      fields: setOutOfPlace(newPoll.fields, newField, i),
                    })
                  }
                  deleteField={() =>
                    setNewPoll({
                      ...newPoll,
                      fields: deleteOutOfPlace(newPoll.fields, i),
                    })
                  }
                />
              </Grid>
            ))}
            <Button
              variant="outlined"
              onClick={() => {
                setNewPoll({
                  ...newPoll,
                  fields: [
                    ...newPoll.fields,
                    {
                      description: "",
                      fieldType: fieldTypes.string,
                      required: true,
                      results: [],
                    },
                  ],
                });
              }}
            >
              Add Field
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={false}
            >
              Save
            </Button>
          </Stack>
        </form>
      </Container>
    </div>
  );
};
