const fs = require("fs");
const got = require("got");
const qty = require("js-quantities");
const formatDistance = require("date-fns/formatDistance");
const format = require("date-fns/format");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_LOCATION_ID = "35956";
const WEATHER_API_URL = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${WEATHER_LOCATION_ID}?apikey=${WEATHER_API_KEY}`;
const WORK_AT = "RD Station";
const WORK_AT_SITE = "https://rdstation.com";
const WORK_AT_SINCE = new Date(2023, 2, 1);

const emojis = {
  1: "☀️",
  2: "☀️",
  3: "🌤",
  4: "🌤",
  5: "🌤",
  6: "🌥",
  7: "☁️",
  8: "☁️",
  11: "🌫",
  12: "🌧",
  13: "🌦",
  14: "🌦",
  15: "⛈",
  16: "⛈",
  17: "🌦",
  18: "🌧",
  19: "🌨",
  20: "🌨",
  21: "🌨",
  22: "❄️",
  23: "❄️",
  24: "🌧",
  25: "🌧",
  26: "🌧",
  29: "🌧",
  30: "🌫",
  31: "🥵",
  32: "🥶",
};

// TODO: variable bubble width, need to replace with something fancy later :P
const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
};

// Time working
const today = new Date();
const todayDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
  today,
);
const workTime = formatDistance(WORK_AT_SINCE, today, { addSuffix: false });
const workAtSite = WORK_AT_SITE;
const workAtLocation = WORK_AT;

got(WEATHER_API_URL)
  .then((response) => {
    const json = JSON.parse(response.body);

    const degF = Math.round(json.DailyForecasts[0].Temperature.Maximum.Value);
    const degC = Math.round(qty(`${degF} tempF`).to("tempC").scalar);
    const icon = json.DailyForecasts[0].Day.Icon;

    fs.readFile("templates/chat.svg", "utf-8", (error, data) => {
      if (error) {
        return;
      }

      data = data.replace("{degF}", degF);
      data = data.replace("{degC}", degC);
      data = data.replace("{weatherEmoji}", emojis[icon]);
      data = data.replace("{todayDay}", todayDay);
      data = data.replace("{dayBubbleWidth}", dayBubbleWidths[todayDay]);
      data = data.replace("{workAtSince}", format(WORK_AT_SINCE, "yyyy"));
      data = data.replace("{workAtSite}", WORK_AT_SITE);
      data = data.replace("{workAt}", WORK_AT);
      data = data.replace("{workTime}", workTime);

      data = fs.writeFile("chat.svg", data, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
