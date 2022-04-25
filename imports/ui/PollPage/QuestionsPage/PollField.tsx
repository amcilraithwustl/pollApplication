import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack/Stack";
import { deleteOutOfPlace, setOutOfPlace } from "../../../api/utils";
import { fieldTypes, PollFieldType } from "../../../api/pollCollection";

/*
 * A issue happens when you define a component
 *  inside the scope of another function which is
 * called each render of your App component. This
 * gives you a completely new FormComponent each
 * time your App component is re-rendered and calls
 *  useState. That new component is then, well,
 *  without focus.
 */
const FieldTypeSelection = ({
  field,
  setField,
}: {
  field: PollFieldType;
  setField: (arg0: PollFieldType) => void;
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={field.fieldType}
        label="FieldType"
        onChange={(event: SelectChangeEvent<fieldTypes>) => {
          event.preventDefault();
          const newFieldType = event.target.value as fieldTypes;

          if (
            (field.fieldType === fieldTypes.checkbox ||
              field.fieldType === fieldTypes.radio) &&
            (newFieldType === fieldTypes.checkbox ||
              newFieldType === fieldTypes.radio)
          ) {
            setField({
              ...field,
              results: [],
              fieldType: newFieldType,
            });
          } else {
            switch (newFieldType) {
              case fieldTypes.checkbox:
                setField({
                  fieldType: newFieldType,
                  results: [],
                  description: field.description,
                  required: field.required,
                  choiceOptions: [""],
                });
                break;

              case fieldTypes.numeric:
                setField({
                  fieldType: newFieldType,
                  results: [],
                  float: false,
                  description: field.description,
                  required: field.required,
                });
                break;
              case fieldTypes.radio:
                setField({
                  fieldType: newFieldType,
                  results: [],
                  description: field.description,
                  required: field.required,
                  choiceOptions: [""],
                });
                break;
              case fieldTypes.string:
                setField({
                  fieldType: newFieldType,
                  results: [],
                  description: field.description,
                  required: field.required,
                });
                break;
              default:
            }
          }
        }}
      >
        <MenuItem value={fieldTypes.string}>Text Answer</MenuItem>
        <MenuItem value={fieldTypes.numeric}>Numeric</MenuItem>
        <MenuItem value={fieldTypes.radio}>Single Choices</MenuItem>
        <MenuItem value={fieldTypes.checkbox}>Checkboxes</MenuItem>
      </Select>
    </FormControl>
  );
};

const FieldDescription = ({
  field,
  setField,
}: {
  field: PollFieldType;
  setField: (arg0: PollFieldType) => void;
}) => {
  return (
    <TextField
      label="Description"
      placeholder="Description"
      value={field.description}
      onChange={(event) => {
        setField({
          ...field,
          description: event.target.value,
        });
      }}
      error={field.description === ""}
      helperText={field.description === "" ? "Description cannot be empty" : ""}
    />
  );
};

const FieldResults = ({
  field,
  setField,
}: {
  field: PollFieldType;
  setField: (arg0: PollFieldType) => void;
}) => {
  if (field.fieldType === fieldTypes.string) {
    return <div />;
  }

  if (field.fieldType === fieldTypes.numeric) {
    console.log(field.min, field.max, field.float);
    return (
      <Stack spacing={2}>
        <TextField
          type="number"
          label="Minimum Value (Optional)"
          value={field.min === undefined ? "" : field.min}
          onChange={(v) => {
            const targetValue =
              v.target.value.length > 0
                ? parseFloat(v.target.value)
                : undefined;
            const newOther =
              field.max !== undefined &&
              targetValue !== undefined &&
              targetValue > field.max // Make sure the boundaries make sense
                ? targetValue
                : field.max;
            setField({
              ...field,
              min: targetValue,
              max: newOther,
            });
          }}
        />
        <TextField
          type="number"
          label="Maximum Value (Optional)"
          value={field.max === undefined ? "" : field.max}
          onChange={(v) => {
            const targetValue =
              v.target.value.length > 0
                ? parseFloat(v.target.value)
                : undefined;
            const newOther =
              field.min !== undefined &&
              targetValue !== undefined &&
              targetValue < field.min // Make sure the boundaries make sense
                ? targetValue
                : field.min;

            setField({
              ...field,
              max: targetValue,
              min: newOther,
            });
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              value={field.float}
              onClick={() => {
                setField({ ...field, float: !field.float });
              }}
            />
          }
          label="Float"
        />
      </Stack>
    );
  }
  return (
    <Grid spacing={3} container>
      {!!field.choiceOptions &&
        field.choiceOptions.map((o: string, i: number) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Grid item container key={i} spacing={2} alignItems="center">
              <Grid item>
                {field.fieldType === fieldTypes.checkbox ? (
                  <CheckBoxOutlineBlankIcon />
                ) : (
                  <RadioButtonUncheckedIcon />
                )}
              </Grid>
              <Grid item>
                <TextField
                  label={`Option ${i + 1}`}
                  placeholder="Option"
                  value={o}
                  onChange={(event) => {
                    setField({
                      ...field,
                      choiceOptions: setOutOfPlace(
                        field.choiceOptions,
                        event.target.value,
                        i
                      ),
                    });
                  }}
                  error={o === ""}
                  helperText={o === "" ? "Option cannot be empty" : ""}
                />
              </Grid>
              <Grid item>
                <IconButton
                  aria-label="delete"
                  onClick={() => {
                    setField({
                      ...field,
                      choiceOptions: deleteOutOfPlace(field.choiceOptions, i),
                    });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}
      <Grid item xs={8}>
        <Button
          variant="contained"
          style={{ width: "100%" }}
          onClick={() => {
            setField({
              ...field,
              choiceOptions: [...field.choiceOptions, ""],
            });
          }}
          aria-label="Add"
        >
          <AddIcon />
        </Button>
      </Grid>
    </Grid>
  );
};

export const PollField = ({
  deleteField,
  field,
  setField,
}: {
  field: PollFieldType;
  setField: (arg0: PollFieldType) => void;
  deleteField: () => void;
}): JSX.Element => {
  return (
    <Box>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid container rowSpacing={2} item xs={7}>
          <Grid item xs={12}>
            <FieldDescription field={field} setField={setField} />
          </Grid>
          <Grid item xs={12}>
            <FieldResults field={field} setField={setField} />
          </Grid>
        </Grid>
        <Grid container item xs={4} rowSpacing={2}>
          <Grid item xs={12}>
            <FieldTypeSelection field={field} setField={setField} />
          </Grid>
          <Grid item xs={12}>
            <Switch
              checked={field.required}
              onChange={(event) => {
                setField({
                  ...field,
                  required: event.target.checked,
                });
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
            Required
          </Grid>
        </Grid>
        <IconButton
          onClick={() => {
            deleteField();
          }}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
      <Divider />
    </Box>
  );
};

// export default React.memo(PollField);
