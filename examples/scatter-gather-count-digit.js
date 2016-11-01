// Import the main library
var mp = require('metaparticle');

// A simple function to caculate a uniform integer
var uniform = function (lower, upper) {
    return Math.round(lower + (upper-lower)*Math.random());
};

// This function is executed on each leaf
var leafFunction = function (data) {
    var result = {'n': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
    for (var i = 0; i < 100; i++) {
        var num = uniform(0, 100);
        var str = "" + num;
        for (var j = 0; j < str.length; j++) {
          var digit = parseInt(str.charAt(j));
          result.n[digit]++;
        }
    }
    return result;
};

// This function is executed on each root
var mergeFunction = function (responses) {
    var histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (var i = 0; i < responses.length; i++) {
        for (var j = 0; j < 10; j++) {
            histogram[j] += responses[i].n[j];
        }
    }
    return histogram;
};

var svc = mp.service(
    // name of the service
    "histogram-service",
    // library function that creates a scatter/gather service
    mp.scatter(10, leafFunction, mergeFunction));

// Expose the root service to the world
svc.subservices.gather.expose = true;

// And serve
mp.serve();
