import {
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useState } from "react";
import {
  checkboxFieldType,
  makeDataValidator,
  numericFieldType,
  radioFieldType,
  stringFieldType,
} from "../../api/pollCollection";
import { setOutOfPlace } from "../../api/utils";

export const NumberPoll = ({
  setValue,
  value,
  fieldMetaData,
}: {
  setValue: (n: number | undefined) => void;
  value: number | undefined;
  fieldMetaData: numericFieldType;
}): JSX.Element => {
  const [error, setError] = useState(false);

  const finalValidator = makeDataValidator(fieldMetaData);
  const validate: TextFieldProps["onChange"] = (e) => {
    const s = e.target.value;
    const intermediate = fieldMetaData.float ? parseFloat(s) : parseInt(s, 10);
    const secondaryIntermediate =
      e.target.value.length === 0 ? undefined : intermediate;
    console.log(
      "SECONDARY",
      secondaryIntermediate,
      finalValidator.safeParse(undefined)
    );
    setError(!finalValidator.safeParse(secondaryIntermediate).success);

    setValue(secondaryIntermediate);
  };

  return (
    <Grid item container spacing={2}>
      <Grid item>
        <Typography>
          {fieldMetaData.description}
          {fieldMetaData.required ? "*" : ""}
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          value={value === undefined ? "" : value}
          onChange={validate}
          error={error}
          helperText={
            error
              ? `Value must be a ${
                  fieldMetaData.float ? "number" : "integer"
                } between ${
                  fieldMetaData.min !== undefined ? fieldMetaData.min : "-inf"
                } and ${
                  fieldMetaData.max !== undefined ? fieldMetaData.max : "inf"
                }`
              : undefined
          }
          type="number"
          required={fieldMetaData.required}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};
export const BoolPoll = ({
  setValues,
  values,
  fieldMetaData,
}: {
  setValues: (n: boolean[]) => void;
  values: boolean[];
  fieldMetaData: checkboxFieldType;
}): JSX.Element => {
  const finalValidator = makeDataValidator(fieldMetaData);

  return (
    <Grid item container spacing={2}>
      <Grid item>
        <Typography>
          {fieldMetaData.description}
          {fieldMetaData.required ? "*" : ""}
        </Typography>
      </Grid>
      {fieldMetaData.choiceOptions.map((option, i) => (
        <Grid item key={option}>
          <FormControlLabel
            control={
              <Checkbox
                value={values[i]}
                onClick={() => {
                  const intermediate = setOutOfPlace(values, !values[i], i);
                  finalValidator.parse(intermediate);
                  setValues(intermediate);
                }}
                required={fieldMetaData.required}
              />
            }
            label={option}
          />
        </Grid>
      ))}
    </Grid>
  );
};
export const StringPoll = ({
  setValue,
  value,
  fieldMetaData,
}: {
  setValue: (n: string) => void;
  value: string;
  fieldMetaData: stringFieldType;
}): JSX.Element => {
  const validator = makeDataValidator(fieldMetaData);

  const [error, setError] = useState(false);
  const validate: TextFieldProps["onChange"] = (e) => {
    const s = e.target.value;
    setError(!validator.safeParse(s).success);
    setValue(s);
  };

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Typography>
          {fieldMetaData.description}
          {fieldMetaData.required ? "*" : ""}
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          value={value}
          onChange={validate}
          required={fieldMetaData.required}
          error={error}
          helperText={error ? "Field Is Required" : undefined}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};
export const RadioPoll = ({
  setValue,
  value,
  fieldMetaData,
}: {
  setValue: (n: number) => void;
  value: number;
  fieldMetaData: radioFieldType;
}): JSX.Element => {
  const finalValidator = makeDataValidator(fieldMetaData);

  const validate: TextFieldProps["onChange"] = (e) => {
    const s = e.target.value;
    const i = parseInt(s, 10);
    finalValidator.parse(i);
    setValue(i);
  };
  return (
    <Grid item container spacing={2}>
      <Grid item>
        <Typography>
          {fieldMetaData.description}
          {fieldMetaData.required ? "*" : ""}
        </Typography>
      </Grid>
      <Grid item>
        <RadioGroup
          defaultValue="female"
          name="radio-buttons-group"
          value={value}
          onChange={validate}
        >
          {fieldMetaData.choiceOptions.map((v, i) => (
            <FormControlLabel key={v} control={<Radio />} label={v} value={i} />
          ))}
        </RadioGroup>
      </Grid>
    </Grid>
  );
};
