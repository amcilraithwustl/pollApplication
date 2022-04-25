import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import * as z from "zod";
import { ValidatedMethod } from "meteor/mdg:validated-method";

export enum fieldTypes {
  string,
  numeric,
  radio,
  checkbox, // We may not use all of these...
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const fieldResultYup = <T extends z.ZodTypeAny>(dataType: T) =>
  z.object({
    time: z.date(),
    user: z.string().optional(),
    data: dataType,
  });

const baseFieldYup = z.object({
  description: z.string().min(1),
  required: z.boolean(),
});

export const numericFieldYup = baseFieldYup.extend({
  fieldType: z.literal(fieldTypes.numeric),
  results: z.array(fieldResultYup(z.number())),
  float: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export type numericFieldType = z.infer<typeof numericFieldYup>;

export const checkboxFieldYup = baseFieldYup.extend({
  fieldType: z.literal(fieldTypes.checkbox),
  results: z.array(fieldResultYup(z.array(z.boolean()))),
  choiceOptions: z.array(z.string().min(1)),
});

export type checkboxFieldType = z.infer<typeof checkboxFieldYup>;

export const radioFieldYup = baseFieldYup.extend({
  fieldType: z.literal(fieldTypes.radio),
  results: z.array(fieldResultYup(z.number().int())),
  choiceOptions: z.array(z.string().min(1)),
});

export type radioFieldType = z.infer<typeof radioFieldYup>;

export const stringFieldYup = baseFieldYup.extend({
  fieldType: z.literal(fieldTypes.string),
  results: z.array(fieldResultYup(z.string())),
});
export type stringFieldType = z.infer<typeof stringFieldYup>;

export const pollFieldYup = z.discriminatedUnion("fieldType", [
  checkboxFieldYup,
  numericFieldYup,
  stringFieldYup,
  radioFieldYup,
]);

export type PollFieldType = z.infer<typeof pollFieldYup>;

export const pollYup = z.object({
  title: z.string().min(1),
  fields: z.array(pollFieldYup),
  owner: z.string(),
  terminationTime: z.date(),
  anonymous: z.boolean(),
});

export type PollType = z.infer<typeof pollYup>;

const pollCollectionName = "pollCollection";
export const PollCollectionItemZod = pollYup.extend({ _id: z.string().min(5) });
export type PollCollectionItemType = z.infer<typeof PollCollectionItemZod>;
export const PollCollection = new Mongo.Collection<PollCollectionItemType>(
  pollCollectionName
);

export const validationWrapper = <T extends z.ZodTypeAny>(schema: T) =>
  function validationFunction(myArgument: unknown): void {
    const result = schema.safeParse(myArgument);
    if (result.success === false) {
      throw new Meteor.Error(`Invalid Input: ${JSON.stringify(result.error)}`);
    }
  };

export const makeDataValidator = (fieldMetaData: PollFieldType) => {
  if (fieldMetaData.fieldType === fieldTypes.numeric) {
    let validator = z.number();
    if (fieldMetaData.min !== undefined) {
      validator = validator.min(fieldMetaData.min);
    }
    if (fieldMetaData.max !== undefined) {
      validator = validator.max(fieldMetaData.max);
    }
    if (!fieldMetaData.float) validator = validator.int();
    return fieldMetaData.required ? validator : validator.optional();
  }
  if (fieldMetaData.fieldType === fieldTypes.checkbox) {
    const validator = z
      .array(z.boolean())
      .length(fieldMetaData.choiceOptions.length);
    return fieldMetaData.required ? validator : validator.optional();
  }
  if (fieldMetaData.fieldType === fieldTypes.radio) {
    const validator = z
      .number()
      .min(0)
      .max(fieldMetaData.choiceOptions.length - 1);
    return fieldMetaData.required ? validator : validator.optional();
  }
  if (fieldMetaData.fieldType === fieldTypes.string) {
    return fieldMetaData.required ? z.string().min(1) : z.string().min(0);
  }
  return z.any();
};

export const PollCollectionInsertMM = new ValidatedMethod({
  name: "PollCollection.insert",
  validate: validationWrapper(z.object({ newPoll: pollYup })),
  run({ newPoll }: { newPoll: PollType }) {
    if (this.userId) {
      const temp: PollType = { ...newPoll, owner: this.userId };
      return PollCollection.insert(temp);
    }
    return null;
  },
});

export const PollCollectionAddResultMM = new ValidatedMethod({
  name: "PollCollection.addResult",
  validate: validationWrapper(
    z.object({
      item: fieldResultYup(z.any()),
      index: z.number().int().min(0),
      id: z.string().min(5),
    })
  ),
  run({
    item,
    index,
    id,
  }: {
    item: z.infer<typeof pollFieldYup>["results"][number];
    index: number;
    id: string;
  }) {
    const targetPoll = PollCollection.findOne({ _id: id });
    // Ensure that there is something to insert into
    if (!targetPoll) throw new Meteor.Error(`Poll Does Not Exist: ${id}`);
    if (targetPoll.anonymous === false && !this.userId) {
      throw new Meteor.Error("Please login to take this poll");
    }
    const targetField = targetPoll.fields[index];
    console.log(targetField);
    if (!targetField) throw new Meteor.Error("Field does not exist");

    // Make sure item's data is of the correct type
    makeDataValidator(targetField).parse(item.data);

    if (Meteor.isServer) {
      // Validate item against that field
      const newTestValue = {
        ...targetField,
        results: [...targetField.results, item],
      };
      const testValidation = pollFieldYup.safeParse(newTestValue);

      if (testValidation.success === false) {
        console.error(`Failed Update Type Validation ${testValidation.error}`);
        throw new Meteor.Error(
          `Failed Update Type Validation ${testValidation.error}`
        );
      }
    }
    PollCollection.update(
      { _id: id },
      {
        $push: {
          [`fields.${index}.results`]: item,
        },
      }
    );
  },
});

export const PollCollectionUpdateMM = new ValidatedMethod({
  name: "PollCollection.update",
  validate: validationWrapper(z.object({ newPoll: PollCollectionItemZod })),
  run({ newPoll }: { newPoll: PollCollectionItemType }) {
    if (this.userId) {
      return PollCollection.update(
        // eslint-disable-next-line no-underscore-dangle
        { _id: newPoll._id },
        {
          $set: {
            title: newPoll.title,
            fields: newPoll.fields,
            terminationTime: newPoll.terminationTime,
            anonymous: newPoll.anonymous,
          },
        }
      );
    }
    return null;
  },
});
export const removePollCollectionMM = new ValidatedMethod({
  name: "PollCollection.remove",
  validate: validationWrapper(z.object({ id: z.string().min(5) })),
  run({ id }) {
    if (!id) {
      throw new Meteor.Error("No id");
    }

    if (PollCollection.findOne({ _id: id }).owner !== this.userId) {
      throw new Meteor.Error("You don't have permission to delete this");
    }

    return PollCollection.remove({ _id: id });
  },
});

export const removeAllResultsMM = new ValidatedMethod({
  name: "PollCollection.removeResults",
  validate: validationWrapper(z.object({ id: z.string().min(5) })),
  run({ id }) {
    if (!id) {
      throw new Meteor.Error("No id");
    }

    if (PollCollection.findOne({ _id: id }).owner !== this.userId) {
      throw new Meteor.Error("You don't have permission to delete this");
    }

    return PollCollection.update(
      // eslint-disable-next-line no-underscore-dangle
      { _id: id },
      {
        $set: {
          "fields.$[].results": [],
        },
      }
    );
  },
});

if (Meteor.isServer) {
  PollCollection.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
  });

  Meteor.publish("pollCollectionQuery", function () {
    if (!this.userId) {
      return null;
    }
    // You can show someone all of the data about a poll they own
    return PollCollection.find({ owner: this.userId });
  });

  Meteor.publish("publicQueries", function () {
    // We allow anyone to access this
    const activePolls = PollCollection.find()
      .fetch()
      .filter((i) => i.terminationTime >= new Date(Date.now()))
      .filter((i) => (this.userId ? true : i.anonymous))
      .map((i) => i._id);

    console.log("POLLS",activePolls);
    // Return any poll you want, but don't show the results
    return PollCollection.find(
      {
        _id: { $in: activePolls },
      },
      {
        fields: {
          "fields.results": 0,
        },
      }
    );
  });
}
