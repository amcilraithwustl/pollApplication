import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Button, Grid, Paper, Typography } from "@mui/material";
import Stack from "@mui/material/Stack/Stack";
import Container from "@mui/material/Container";
import {
  checkboxFieldType,
  fieldTypes,
  makeDataValidator,
  numericFieldType,
  PollCollection,
  PollCollectionAddResultMM,
  PollFieldType,
  radioFieldType,
  stringFieldType,
} from "../../api/pollCollection";
import { setOutOfPlace } from "../../api/utils";
import { BoolPoll, NumberPoll, RadioPoll, StringPoll } from "./PollElements";

type pollFieldElement = PollFieldType["results"][number];
type optionalElements = Partial<pollFieldElement> &
  Pick<pollFieldElement, "time" | "user">;
export const TakePollPage = (): JSX.Element => {
  const { id } = useParams();
  const poll = useTracker(() => {
    Meteor.subscribe("publicQueries");
    Meteor.subscribe("users");
    console.log(PollCollection.find().fetch());
    return PollCollection.findOne({ _id: id });
  }, [id]);

  const [fieldData, setFieldData] = useState<optionalElements[]>([]);
  useEffect(() => {
    setFieldData(
      poll?.fields.map((f) => {
        switch (f.fieldType) {
          case fieldTypes.string:
            return {
              time: new Date(),
              user: poll.anonymous ? undefined : Meteor.userId() || undefined,
              data: "",
            } as stringFieldType["results"][number];

          case fieldTypes.checkbox:
            return {
              time: new Date(),
              user: poll.anonymous ? undefined : Meteor.userId() || undefined,
              data: f.choiceOptions.map(() => false),
            } as checkboxFieldType["results"][number];

          case fieldTypes.numeric:
          case fieldTypes.radio:
          default:
            return {
              time: new Date(),
              user: poll.anonymous ? undefined : Meteor.userId() || undefined,
              data: 0,
            } as (radioFieldType & numericFieldType)["results"][number];
        }
      }) || []
    );
  }, [poll?.anonymous, poll?.fields, setFieldData]);

  const selectPollItem = useCallback(
    (f: PollFieldType, i: number) => {
      if (!fieldData[i]) return undefined;

      switch (f.fieldType) {
        case fieldTypes.string:
          return (
            <StringPoll
              key={JSON.stringify({ f, i })}
              fieldMetaData={f}
              setValue={(n) =>
                setFieldData(
                  setOutOfPlace(
                    fieldData,
                    {
                      ...fieldData[i],
                      data: n,
                    },
                    i
                  )
                )
              }
              value={fieldData[i].data as string}
            />
          );
        case fieldTypes.numeric:
          return (
            <NumberPoll
              key={JSON.stringify(f)}
              fieldMetaData={f}
              setValue={(n) =>
                setFieldData(
                  setOutOfPlace(
                    fieldData,
                    {
                      ...fieldData[i],
                      data: n,
                    },
                    i
                  )
                )
              }
              value={fieldData[i].data as number}
            />
          );
        case fieldTypes.checkbox:
          return (
            <BoolPoll
              key={JSON.stringify(f)}
              fieldMetaData={f}
              setValues={(n) =>
                setFieldData(
                  setOutOfPlace(
                    fieldData,
                    {
                      ...fieldData[i],
                      data: n,
                    },
                    i
                  )
                )
              }
              values={fieldData[i].data as boolean[]}
            />
          );
        case fieldTypes.radio:
          return (
            <RadioPoll
              key={JSON.stringify(f)}
              fieldMetaData={f}
              setValue={(n) =>
                setFieldData(
                  setOutOfPlace(
                    fieldData,
                    {
                      ...fieldData[i],
                      data: n,
                    },
                    i
                  )
                )
              }
              value={fieldData[i].data as number}
            />
          );
        default:
          // ERROR
          return undefined;
      }
    },
    [fieldData]
  );

  if (!poll)
    return (
      <Container>
        <Stack>
          <Typography textAlign="center">This Poll is not currently available.</Typography>
        </Stack>
      </Container>
    );
  const areRemainingValues = poll.fields
    .map((f, i) => makeDataValidator(f).safeParse(fieldData?.[i]?.data).success)
    .includes(false);
  return (
    <Container>
      <Stack spacing={3}>
        <Typography variant="h3" textAlign="center">
          {poll.title}
        </Typography>
        {poll.fields.map(selectPollItem).map(
          (pollItem) =>
            pollItem && (
              <Paper style={{ padding: 10 }} key={pollItem.key}>
                {pollItem}
              </Paper>
            )
        )}
        <Button
          variant={areRemainingValues ? "outlined" : "contained"}
          onClick={() => {
            if (areRemainingValues) throw new Meteor.Error("Failed Fields");
            fieldData.forEach(
              (item, index) =>
                id &&
                item.data !== undefined &&
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                PollCollectionAddResultMM.call({ item, index, id })
            );
          }}
          disabled={areRemainingValues}
        >
          Submit Answers{areRemainingValues ? " (not yet complete)" : ""}
        </Button>
      </Stack>
    </Container>
  );
};
