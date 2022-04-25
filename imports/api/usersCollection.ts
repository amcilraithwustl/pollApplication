import { Meteor } from "meteor/meteor";

Meteor.users.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

if (Meteor.isServer) {
  Meteor.publish("users", function () {
    if (!this.userId) return null;

    return Meteor.users.find({});
  });
}
