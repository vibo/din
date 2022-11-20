#!/usr/bin/env node
"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform;
var zlib = require("zlib");
var CAF = require("caf");

// var getStdin = require("get-stdin");

var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "decompress"],
  string: ["file"],
});

processFile = CAF(processFile);

const streamComplete = (stream) =>
  new Promise((res) => {
    stream.on("end", res);
  });

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

var OUTFILE = path.join(BASE_PATH, "out.txt");

if (args.help) {
  printHelp();
} else if (args.in || args._.includes("-")) {
  var tooLong = CAF.timeout(130, "Took too long!");
  processFile(tooLong, process.stdin).catch(error);
} else if (args.file) {
  var stream = fs.createReadStream(path.join(BASE_PATH, args.file));
  var tooLong = CAF.timeout(130, "Took too long!");

  processFile(tooLong, stream)
    .then(() => console.log("Complete!"))
    .catch(error);
} else {
  error("Incorrect usage", true);
}

// *******************
function* processFile(signal, inStream) {
  var outStream = inStream;

  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    outstream = outstream.pipe(gunzipStream);
  }

  var upperStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    },
  });

  outStream = outStream.pipe(upperStream);

  if (args.compress) {
    var gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
  }

  var targetStream;
  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  signal.pr.catch(() => {
    outStream.unpipe(targetStream);
    outStream.destroy();
  });

  yield streamComplete(outStream);
}

function error(msg, includeHelp = false) {
  console.error(msg);

  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

function printHelp() {
  console.log("ex3 usage:");
  console.log("  ex3.js --file={FILENAME}");
  console.log("");
  console.log("--help                   print this help");
  console.log("--file={FILENAME}        process the file");
  console.log("--in, -                  process stdin");
  console.log("--out                    print to stdout");
  console.log("--compress               gzip the output");
  console.log("--decompress             de-gzip the output");
  console.log("");
}
