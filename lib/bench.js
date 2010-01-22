
exports.COUNT = 1000; // how many runs per iteration
exports.TIME = 1000; // how many ms to run tests for.
exports.COMPARE_COUNT = 8; // default number of runs for comparisons.
exports.run = run;
exports.compare = compare;
exports.show = show;



function run (fn, count, time) {
  count = count || exports.COUNT;
  time = time || exports.TIME;
  var runCount = 0,
    go = true,
    start = new Date().getTime(),
    now = start,
    p = new process.Promise();
  
  setTimeout(function () { go = false }, time);
  (function () {
    for (var n = count; n > 0; n --) fn();
    runCount ++;
    if (go) setTimeout(arguments.callee);
    else p.emitSuccess((runCount * count) / ((new Date().getTime()) - start));
  })();
  return p;
};

// danger! necessarily synchronous.  benchmarking, after all.
function compare (set, compareCount, count, time) {
  compareCount = compareCount || exports.COMPARE_COUNT;
  count = count || exports.COUNT;
  time = time || exports.TIME;
  
  var tests = [],
    results = [],
    testCount = 0;
  for (var i in set) {
    testCount ++;
    tests.push({name:i, fn:set[i]});
    results.push([]);
  }
  for (var currentCompare = 0; currentCompare <= (compareCount / testCount); currentCompare ++) {
    // random order.
    var testOrder = randomArray(testCount);
    for (var i = 0; i < testCount; i ++) {
      var current = testOrder[i];
      results[current].push(run(tests[current].fn, count, time).wait());
    }
  }
  
  // now construct the result set with the scores and names.
  var ret = {};
  for (var i = 0; i < testCount; i ++) {
    ret[ tests[i].name ] = results[i];
  }
  
  return ret;
};

// http://rosettacode.org/wiki/Knuth_shuffle#JavaScript
function knuth (a) {
  var n = a.length;
  var r, temp;
  while (n > 1) {
    r = Math.floor(n * Math.random());
    n--;
    temp = a[n];
    a[n] = a[r];
    a[r] = temp;
  }
  return a;
}

function randomArray (l) {
  var a = [];
  while (l --> 0) a.push(l);
  return knuth(a);
}


function print (m,cr) { process.stdio.writeError(m+(cr===false?"":"\n")); return print };

function show (results) {
  var averages = [];
  for (var i in results) {
    averages.push({name:i, avg:avg(results[i])});
  }
  averages.sort(sortScores);
  
  print("Scores: (bigger is better)\n");
  for (var i = 0, l = averages.length; i < l; i ++) {
    var res = results[ averages[i].name ];
    print
      (averages[i].name)
      ("Raw:")
      (" > "+res.join("\n > "))
      ("Average (mean) " + averages[i].avg)
      ("");
  }
  var winner = averages.shift(), second = averages.shift(), loser = averages.pop();
  
  print
    ("Winner: " + winner.name)
    ("Compared with next highest ("+second.name+"), it's:")
    (pct(winner.avg, second.avg)+"% faster")
    (times(winner.avg, second.avg)+" times as fast")
    (oom(winner.avg, second.avg)+" order(s) of magnitude faster");
  if (loser) print
    ("\nCompared with the slowest ("+loser.name+"), it's:")
    (pct(winner.avg, loser.avg)+"% faster")
    (times(winner.avg, loser.avg)+" times as fast")
    (oom(winner.avg, loser.avg)+" order(s) of magnitude faster");
  
  print("");
  return;
};

function sortScores (a, b) {
  return a.avg === b.avg ? 0 : a.avg > b.avg ? -1 : 1;
}

function pct (num1, num2) {
  var nums = [num1, num2];
  return Math.round((1-(Math.min.apply(Math, nums)/Math.max.apply(Math,nums))) * 10000) / 100;
}
function times (num1, num2) {
  var nums = [num1, num2];
  return Math.round((Math.max.apply(Math, nums)/Math.min.apply(Math,nums)) * 100) / 100;
}
function oom (num1, num2) {
  var nums = [num1, num2];
  var ratio = Math.max.apply(Math, nums)/Math.min.apply(Math,nums), oom = 0;
  while ( (ratio/=10) > 1 ) oom++;
  return oom;
}
function avg (nums) {
  var sum = 0;
  nums.forEach(function (n) { sum+=n });
  return sum/nums.length;
};