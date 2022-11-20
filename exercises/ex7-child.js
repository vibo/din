"use strict";

var fetch = require("node-fetch");

// ************************************

const HTTP_PORT = 8039;

main().catch(() => 1);

// ************************************

async function main() {
  try {
    var res = await fetch("http://localhost:8039/get-records");

    if (res?.ok) {
      let records = await res.json();
      if (records?.length > 0) {
        process.exitCode = 0;
        return;
      }
    }
  } catch (error) {}
  process.exitCode = 1;
}