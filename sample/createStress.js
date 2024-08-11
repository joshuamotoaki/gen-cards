import fs from "fs";

const FILEPATH = "./stress.csv";
const ROWS = 100000;
const COLUMNS = 10;

const input = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLUMNS }, () => Math.random().toString(36).substring(2))
    .join(",")
    .concat("\n")
).join("");

fs.writeFileSync(FILEPATH, input);
