// stdin streams are a lot more quirky and stdout
process.stdin.read();

// posix, no IO in js spec
// process.stdout.write("Hello world\n");
// these are different streams - posix
console.log("Hello world");
console.error("Oops");
