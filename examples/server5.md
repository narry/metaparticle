## Metaparticle Code Walk, Chapter 5

So far we have seen patterns for creating distributed systems, but there is more to
distributed systems than topology.  One of the harder problems in distributed systems is
dealing with storage.

Metaparticle attempts to make this straightforward as well by automatically observing the
state of the world and persisting that state to a persistent storage layer automatically for
the developer.

As a first example of this, consider a simple server that keeps track of the number of requests
that it has seen:

```javascript
var mp = require('metaparticle');

var service = mp.service(
    "simple-storage",
    function (request) {
		if (!mp.scope.global.requests) {
			mp.scope.global.requests = 0;
		}
		mp.scope.global.requests++;
		return { "requests": mp.scope.global.requests };
    }
);

service.expose = true;

mp.serve();
```

This looks a lot like our initial server, however, notice that it is manipulating `mp.scope.global.requests`
This is avariable in the global scopeof our overall metaparticle application.  By chaging it's value (`++`)
we are changing the value in general.  Anyone who has played around with distributed systems, however
knows that such a modification is fraught with challenge. Multiple requests on multiple different servers
can lead to incorrect results if the proper concurrency design isn't in place. Metaparticle attempts to
make this simple by handling this for you.

You can try this service as follows:

```console
$ node server5.js
```

As before, you can access this via `client.js` or `curl`

```console
$ node client.js simple-storage
{"requests": 1}
$ curl -X POST \
     -d '{"jsonrpc": "2.0", "params":[{}], "method": "simple-storage", "id": "example"}' \
     -H "Content-Type: application/json" \
     -s localhost:3000/
{"jsonrpc":"2.0","id":"example","result":{"requests":2}}
```
You can see that the number of requests increments with every request.

Behind the scenes, metaparticle is reading data out of storage, executing your code and detecting
changed values, then storing those back in with optimistic concurrency to eliminate races.

Now let's turn down that server:

```console
node server5.js delete
```

But of course, by default the service uses a default storage implementation based on files
that is really only for experimentation.  For real uses cases it's better to use a different
implementation.  For example the Redis server is also supported:

```console
# Run a redis server
docker run -d --net=host redis

# Set up the service to use redis for storage
export REDIS_HOST=<ip-address-of-machine-from-ifconfig>
node server5.js --storage=redis
```

Now access the service:

```console
$ node client.js simple-storage
{ "requests": 1}
```

Now to validate that the storage is working, restart your service:

```console
$ node server5.js delete
$ node server5.js --storage=redis
```

Now make an additional request:

```console
$ node client.js simple-storage
{ "requests": 2}
```

Notice how the previous request count is maintained.

But remember, the real challenge of storage is concurrent requests. Metaparticle simplifies this
as well. To see this in action, try accessing the server a number of times in parallel:

```console
$ for x in 0 1 2 3 4 5 6 7 8 9; do \
    node client.js simple-storage &
  done
```

You should see that despite the requests coming in parallel, metaparticle successfully eliminates
race conditions and correctly counts the number of requests.

Before you move on, remember to tear down your service:

```console
$ node server5.js delete
```

Now, let's move on to [chapter six](server6.md) to see this distributed to a number of replicas.
