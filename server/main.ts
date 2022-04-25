import { Meteor } from "meteor/meteor";
import { ServiceConfiguration } from "meteor/service-configuration";
import "../imports/api/pollCollection";

const { settings } = Meteor;

Meteor.startup(() => {
  // Need to use Meteor.settings to hold appid and secret
  // Can access api at https://console.cloud.google.com/
  ServiceConfiguration.configurations.upsert(
    {
      service: "google",
    },
    {
      $set: {
        clientId: settings.google.id,
        loginStyle: "popup",
        secret: settings.google.secret,
        appId: settings.google.id,
      },
    }
  );

  ServiceConfiguration.configurations.upsert(
    {
      service: "facebook",
    },
    {
      $set: {
        clientId: settings.facebook.id,
        loginStyle: "popup",
        secret: settings.facebook.secret,
        appId: settings.facebook.id,
      },
    }
  );

  ServiceConfiguration.configurations.upsert(
    {
      service: "github",
    },
    {
      $set: {
        clientId: settings.github.id,
        loginStyle: "popup",
        secret: settings.github.secret,
        appId: settings.github.id,
      },
    }
  );
});
