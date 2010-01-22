var path = require("path"),
  url = require("url");

var args = process.ARGV.slice(0);
while (args.shift() !== __filename);

// strip the extension.
var test = url.resolve(process.cwd()+"/", path.join(
    path.dirname(args[0]),
    path.basename(args[0], path.extname(args[0]))
  )),
  bench = require("./bench");

process.stdio.writeError("benchmarking "+test+"\nPlease be patient.\n");
test = require(test)

bench.show(bench.compare(
  test.compare,
  test.compareCount || bench.COMPARE_COUNT, 
  test.count || bench.COUNT,
  test.time || bench.TIME
));