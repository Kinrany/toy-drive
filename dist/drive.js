/** @license MIT License (c) copyright 2010-2016 original author or authors */

// append :: a -> [a] -> [a]
// a with x appended
function append (x, a) {
  var l = a.length;
  var b = new Array(l + 1);
  for (var i = 0; i < l; ++i) {
    b[i] = a[i];
  }

  b[l] = x;
  return b
}

// map :: (a -> b) -> [a] -> [b]
// transform each element with f
function map (f, a) {
  var l = a.length;
  var b = new Array(l);
  for (var i = 0; i < l; ++i) {
    b[i] = f(a[i]);
  }
  return b
}

// reduce :: (a -> b -> a) -> a -> [b] -> a
// accumulate via left-fold
function reduce (f, z, a) {
  var r = z;
  for (var i = 0, l = a.length; i < l; ++i) {
    r = f(r, a[i], i);
  }
  return r
}

// remove :: Int -> [a] -> [a]
// remove element at index
function remove (i, a) {  // eslint-disable-line complexity
  if (i < 0) {
    throw new TypeError('i must be >= 0')
  }

  var l = a.length;
  if (l === 0 || i >= l) { // exit early if index beyond end of array
    return a
  }

  if (l === 1) { // exit early if index in bounds and length === 1
    return []
  }

  return unsafeRemove(i, a, l - 1)
}

// unsafeRemove :: Int -> [a] -> Int -> [a]
// Internal helper to remove element at index
function unsafeRemove (i, a, l) {
  var b = new Array(l);
  var j;
  for (j = 0; j < i; ++j) {
    b[j] = a[j];
  }
  for (j = i; j < l; ++j) {
    b[j] = a[j + 1];
  }

  return b
}

// findIndex :: a -> [a] -> Int
// find index of x in a, from the left
function findIndex (x, a) {
  for (var i = 0, l = a.length; i < l; ++i) {
    if (x === a[i]) {
      return i
    }
  }
  return -1
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */

// id :: a -> a
var id = function (x) { return x; };

// curry2 :: ((a, b) -> c) -> (a -> b -> c)
function curry2 (f) {
  function curried (a, b) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return function (b) { return f(a, b); }
      default: return f(a, b)
    }
  }
  return curried
}

// curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
function curry3 (f) {
  function curried (a, b, c) { // eslint-disable-line complexity
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry2(function (b, c) { return f(a, b, c); })
      case 2: return function (c) { return f(a, b, c); }
      default:return f(a, b, c)
    }
  }
  return curried
}

var RelativeScheduler = function RelativeScheduler (origin, scheduler) {
  this.origin = origin;
  this.scheduler = scheduler;
};

RelativeScheduler.prototype.currentTime = function currentTime () {
  return this.scheduler.currentTime() - this.origin
};

RelativeScheduler.prototype.scheduleTask = function scheduleTask (localOffset, delay, period, task) {
  return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task)
};

RelativeScheduler.prototype.relative = function relative (origin) {
  return new RelativeScheduler(origin + this.origin, this.scheduler)
};

RelativeScheduler.prototype.cancel = function cancel (task) {
  return this.scheduler.cancel(task)
};

RelativeScheduler.prototype.cancelAll = function cancelAll (f) {
  return this.scheduler.cancelAll(f)
};

// Schedule a task to run after a millisecond delay
var delay = curry3(function (delay, task, scheduler) { return scheduler.scheduleTask(0, delay, -1, task); });

// Cancel all ScheduledTasks for which a predicate
// is true
var cancelAllTasks = curry2(function (predicate, scheduler) { return scheduler.cancelAll(predicate); });

var schedulerRelativeTo = curry2(function (offset, scheduler) { return new RelativeScheduler(offset, scheduler); });

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var disposeNone = function () { return NONE; };
var NONE = new ((function () {
  function DisposeNone () {}

  DisposeNone.prototype.dispose = function dispose () {};

  return DisposeNone;
}()))();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Wrap an existing disposable (which may not already have been once()d)
// so that it will only dispose its underlying resource at most once.
var disposeOnce = function (disposable) { return new DisposeOnce(disposable); };

var DisposeOnce = function DisposeOnce (disposable) {
  this.disposed = false;
  this.disposable = disposable;
};

DisposeOnce.prototype.dispose = function dispose () {
  if (!this.disposed) {
    this.disposed = true;
    this.disposable.dispose();
    this.disposable = undefined;
  }
};

// Aggregate Error type for DisposeAll
var DisposeAllError = (function (Error) {
  function DisposeAllError (message, errors) {
    Error.call(this, message);
    this.message = message;
    this.name = this.constructor.name;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.stack = "" + (this.stack) + (formatErrorStacks(this.errors));
  }

  if ( Error ) DisposeAllError.__proto__ = Error;
  DisposeAllError.prototype = Object.create( Error && Error.prototype );
  DisposeAllError.prototype.constructor = DisposeAllError;

  DisposeAllError.prototype.toString = function toString () {
    return this.stack
  };

  return DisposeAllError;
}(Error));

var formatErrorStacks = function (errors) { return reduce(formatErrorStack, '', errors); };

var formatErrorStack = function (s, e, i) { return s + "\n[" + ((i + 1)) + "] " + (e.stack); };

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Try to dispose the disposable.  If it throws, send
// the error to sink.error with the provided Time value
var tryDispose = curry3(function (t, disposable, sink) {
  try {
    disposable.dispose();
  } catch (e) {
    sink.error(t, e);
  }
});

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function fatalError (e) {
  setTimeout(rethrow, 0, e);
}

function rethrow (e) {
  throw e
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var propagateTask$1 = function (run, value, sink) { return new PropagateTask(run, value, sink); };

var propagateEventTask$1 = function (value, sink) { return propagateTask$1(runEvent, value, sink); };

var propagateEndTask = function (sink) { return propagateTask$1(runEnd, undefined, sink); };

var PropagateTask = function PropagateTask (run, value, sink) {
  this._run = run;
  this.value = value;
  this.sink = sink;
  this.active = true;
};

PropagateTask.prototype.dispose = function dispose$$1 () {
  this.active = false;
};

PropagateTask.prototype.run = function run (t) {
  if (!this.active) {
    return
  }
  var run = this._run;
  run(t, this.value, this.sink);
};

PropagateTask.prototype.error = function error (t, e) {
  // TODO: Remove this check and just do this.sink.error(t, e)?
  if (!this.active) {
    return fatalError(e)
  }
  this.sink.error(t, e);
};

var runEvent = function (t, x, sink) { return sink.event(t, x); };

var runEnd = function (t, _, sink) { return sink.end(t); };

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var never = function () { return NEVER; };

var Never = function Never () {};

Never.prototype.run = function run () {
  return disposeNone()
};

var NEVER = new Never();

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/** @author Brian Cavalier */

var Pipe = function Pipe (sink) {
  this.sink = sink;
};

Pipe.prototype.event = function event (t, x) {
  return this.sink.event(t, x)
};

Pipe.prototype.end = function end (t) {
  return this.sink.end(t)
};

Pipe.prototype.error = function error (t, e) {
  return this.sink.error(t, e)
};

var ZipArrayValuesSink = (function (Pipe$$1) {
  function ZipArrayValuesSink (f, values, sink) {
    Pipe$$1.call(this, sink);
    this.f = f;
    this.values = values;
    this.index = 0;
  }

  if ( Pipe$$1 ) ZipArrayValuesSink.__proto__ = Pipe$$1;
  ZipArrayValuesSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  ZipArrayValuesSink.prototype.constructor = ZipArrayValuesSink;

  ZipArrayValuesSink.prototype.event = function event (t, b) {
    var f = this.f;
    this.sink.event(t, f(this.values[this.index], b));

    this.index += 1;
    if (this.index >= this.values.length) {
      this.sink.end(t);
    }
  };

  return ZipArrayValuesSink;
}(Pipe));

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Run a Stream, sending all its events to the
// provided Sink.
var run$1 = function (sink, scheduler, stream) { return stream.run(sink, scheduler); };

var RelativeSink = function RelativeSink (offset, sink) {
  this.sink = sink;
  this.offset = offset;
};

RelativeSink.prototype.event = function event (t, x) {
  this.sink.event(t + this.offset, x);
};

RelativeSink.prototype.error = function error (t, e) {
  this.sink.error(t + this.offset, e);
};

RelativeSink.prototype.end = function end (t) {
  this.sink.end(t + this.offset);
};

// Create a stream with its own local clock
// This transforms time from the provided scheduler's clock to a stream-local
// clock (which starts at 0), and then *back* to the scheduler's clock before
// propagating events to sink.  In other words, upstream sources will see local times,
// and downstream sinks will see non-local (original) times.
var withLocalTime$1 = function (origin, stream) { return new WithLocalTime(origin, stream); };

var WithLocalTime = function WithLocalTime (origin, source) {
  this.origin = origin;
  this.source = source;
};

WithLocalTime.prototype.run = function run (sink, scheduler) {
  return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler))
};

// Accumulate offsets instead of nesting RelativeSinks, which can happen
// with higher-order stream and combinators like continueWith when they're
// applied recursively.
var relativeSink = function (origin, sink) { return sink instanceof RelativeSink
    ? new RelativeSink(origin + sink.offset, sink.sink)
    : new RelativeSink(origin, sink); };

var LoopSink = (function (Pipe$$1) {
  function LoopSink (stepper, seed, sink) {
    Pipe$$1.call(this, sink);
    this.step = stepper;
    this.seed = seed;
  }

  if ( Pipe$$1 ) LoopSink.__proto__ = Pipe$$1;
  LoopSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  LoopSink.prototype.constructor = LoopSink;

  LoopSink.prototype.event = function event (t, x) {
    var result = this.step(this.seed, x);
    this.seed = result.seed;
    this.sink.event(t, result.value);
  };

  return LoopSink;
}(Pipe));

var ScanSink = (function (Pipe$$1) {
  function ScanSink (f, z, sink) {
    Pipe$$1.call(this, sink);
    this.f = f;
    this.value = z;
  }

  if ( Pipe$$1 ) ScanSink.__proto__ = Pipe$$1;
  ScanSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  ScanSink.prototype.constructor = ScanSink;

  ScanSink.prototype.event = function event (t, x) {
    var f = this.f;
    this.value = f(this.value, x);
    this.sink.event(t, this.value);
  };

  return ScanSink;
}(Pipe));

var ContinueWithSink = (function (Pipe$$1) {
  function ContinueWithSink (f, source, sink, scheduler) {
    Pipe$$1.call(this, sink);
    this.f = f;
    this.scheduler = scheduler;
    this.active = true;
    this.disposable = disposeOnce(source.run(this, scheduler));
  }

  if ( Pipe$$1 ) ContinueWithSink.__proto__ = Pipe$$1;
  ContinueWithSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  ContinueWithSink.prototype.constructor = ContinueWithSink;

  ContinueWithSink.prototype.event = function event (t, x) {
    if (!this.active) {
      return
    }
    this.sink.event(t, x);
  };

  ContinueWithSink.prototype.end = function end (t) {
    if (!this.active) {
      return
    }

    tryDispose(t, this.disposable, this.sink);

    this._startNext(t, this.sink);
  };

  ContinueWithSink.prototype._startNext = function _startNext (t, sink) {
    try {
      this.disposable = this._continue(this.f, t, sink);
    } catch (e) {
      sink.error(t, e);
    }
  };

  ContinueWithSink.prototype._continue = function _continue (f, t, sink) {
    return run$1(sink, this.scheduler, withLocalTime$1(t, f()))
  };

  ContinueWithSink.prototype.dispose = function dispose$$1 () {
    this.active = false;
    return this.disposable.dispose()
  };

  return ContinueWithSink;
}(Pipe));

var FilterSink = (function (Pipe$$1) {
  function FilterSink (p, sink) {
    Pipe$$1.call(this, sink);
    this.p = p;
  }

  if ( Pipe$$1 ) FilterSink.__proto__ = Pipe$$1;
  FilterSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  FilterSink.prototype.constructor = FilterSink;

  FilterSink.prototype.event = function event (t, x) {
    var p = this.p;
    p(x) && this.sink.event(t, x);
  };

  return FilterSink;
}(Pipe));

var FilterMapSink = (function (Pipe$$1) {
  function FilterMapSink (p, f, sink) {
    Pipe$$1.call(this, sink);
    this.p = p;
    this.f = f;
  }

  if ( Pipe$$1 ) FilterMapSink.__proto__ = Pipe$$1;
  FilterMapSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  FilterMapSink.prototype.constructor = FilterMapSink;

  FilterMapSink.prototype.event = function event (t, x) {
    var f = this.f;
    var p = this.p;
    p(x) && this.sink.event(t, f(x));
  };

  return FilterMapSink;
}(Pipe));

var MapSink = (function (Pipe$$1) {
  function MapSink (f, sink) {
    Pipe$$1.call(this, sink);
    this.f = f;
  }

  if ( Pipe$$1 ) MapSink.__proto__ = Pipe$$1;
  MapSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  MapSink.prototype.constructor = MapSink;

  MapSink.prototype.event = function event (t, x) {
    var f = this.f;
    this.sink.event(t, f(x));
  };

  return MapSink;
}(Pipe));

var TapSink = (function (Pipe$$1) {
  function TapSink (f, sink) {
    Pipe$$1.call(this, sink);
    this.f = f;
  }

  if ( Pipe$$1 ) TapSink.__proto__ = Pipe$$1;
  TapSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  TapSink.prototype.constructor = TapSink;

  TapSink.prototype.event = function event (t, x) {
    var f = this.f;
    f(x);
    this.sink.event(t, x);
  };

  return TapSink;
}(Pipe));

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var IndexSink = (function (Sink) {
  function IndexSink (i, sink) {
    Sink.call(this, sink);
    this.index = i;
    this.active = true;
    this.value = undefined;
  }

  if ( Sink ) IndexSink.__proto__ = Sink;
  IndexSink.prototype = Object.create( Sink && Sink.prototype );
  IndexSink.prototype.constructor = IndexSink;

  IndexSink.prototype.event = function event (t, x) {
    if (!this.active) {
      return
    }
    this.value = x;
    this.sink.event(t, this);
  };

  IndexSink.prototype.end = function end (t) {
    if (!this.active) {
      return
    }
    this.active = false;
    this.sink.event(t, this);
  };

  return IndexSink;
}(Pipe));

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function invoke (f, args) {
  /* eslint complexity: [2,7] */
  switch (args.length) {
    case 0: return f()
    case 1: return f(args[0])
    case 2: return f(args[0], args[1])
    case 3: return f(args[0], args[1], args[2])
    case 4: return f(args[0], args[1], args[2], args[3])
    case 5: return f(args[0], args[1], args[2], args[3], args[4])
    default:
      return f.apply(void 0, args)
  }
}

var CombineSink = (function (Pipe$$1) {
  function CombineSink (disposables, sinks, sink, f) {
    Pipe$$1.call(this, sink);
    this.disposables = disposables;
    this.sinks = sinks;
    this.f = f;

    var l = sinks.length;
    this.awaiting = l;
    this.values = new Array(l);
    this.hasValue = new Array(l).fill(false);
    this.activeCount = sinks.length;
  }

  if ( Pipe$$1 ) CombineSink.__proto__ = Pipe$$1;
  CombineSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  CombineSink.prototype.constructor = CombineSink;

  CombineSink.prototype.event = function event (t, indexedValue) {
    if (!indexedValue.active) {
      this._dispose(t, indexedValue.index);
      return
    }

    var i = indexedValue.index;
    var awaiting = this._updateReady(i);

    this.values[i] = indexedValue.value;
    if (awaiting === 0) {
      this.sink.event(t, invoke(this.f, this.values));
    }
  };

  CombineSink.prototype._updateReady = function _updateReady (index) {
    if (this.awaiting > 0) {
      if (!this.hasValue[index]) {
        this.hasValue[index] = true;
        this.awaiting -= 1;
      }
    }
    return this.awaiting
  };

  CombineSink.prototype._dispose = function _dispose (t, index) {
    tryDispose(t, this.disposables[index], this.sink);
    if (--this.activeCount === 0) {
      this.sink.end(t);
    }
  };

  return CombineSink;
}(Pipe));

var MergeSink = (function (Pipe$$1) {
  function MergeSink (disposables, sinks, sink) {
    Pipe$$1.call(this, sink);
    this.disposables = disposables;
    this.activeCount = sinks.length;
  }

  if ( Pipe$$1 ) MergeSink.__proto__ = Pipe$$1;
  MergeSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  MergeSink.prototype.constructor = MergeSink;

  MergeSink.prototype.event = function event (t, indexValue) {
    if (!indexValue.active) {
      this._dispose(t, indexValue.index);
      return
    }
    this.sink.event(t, indexValue.value);
  };

  MergeSink.prototype._dispose = function _dispose (t, index) {
    tryDispose(t, this.disposables[index], this.sink);
    if (--this.activeCount === 0) {
      this.sink.end(t);
    }
  };

  return MergeSink;
}(Pipe));

var SampleSink = (function (Pipe$$1) {
  function SampleSink (f, source, sink) {
    Pipe$$1.call(this, sink);
    this.source = source;
    this.f = f;
    this.hold = new SampleHold(this);
  }

  if ( Pipe$$1 ) SampleSink.__proto__ = Pipe$$1;
  SampleSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SampleSink.prototype.constructor = SampleSink;

  SampleSink.prototype.event = function event (t, x) {
    if (this.hold.hasValue) {
      var f = this.f;
      this.sink.event(t, f(x, this.hold.value));
    }
  };

  return SampleSink;
}(Pipe));

var SampleHold = (function (Pipe$$1) {
  function SampleHold (sink) {
    Pipe$$1.call(this, sink);
    this.hasValue = false;
  }

  if ( Pipe$$1 ) SampleHold.__proto__ = Pipe$$1;
  SampleHold.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SampleHold.prototype.constructor = SampleHold;

  SampleHold.prototype.event = function event (t, x) {
    this.value = x;
    this.hasValue = true;
  };

  SampleHold.prototype.end = function end () {};

  return SampleHold;
}(Pipe));

var ZipSink = (function (Pipe$$1) {
  function ZipSink (f, buffers, sinks, sink) {
    Pipe$$1.call(this, sink);
    this.f = f;
    this.sinks = sinks;
    this.buffers = buffers;
  }

  if ( Pipe$$1 ) ZipSink.__proto__ = Pipe$$1;
  ZipSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  ZipSink.prototype.constructor = ZipSink;

  ZipSink.prototype.event = function event (t, indexedValue) {
    /* eslint complexity: [1, 5] */
    if (!indexedValue.active) {
      this._dispose(t, indexedValue.index);
      return
    }

    var buffers = this.buffers;
    var buffer = buffers[indexedValue.index];

    buffer.push(indexedValue.value);

    if (buffer.length() === 1) {
      if (!ready(this.buffers)) {
        return
      }

      emitZipped(this.f, t, buffers, this.sink);

      if (ended(this.buffers, this.sinks)) {
        this.sink.end(t);
      }
    }
  };

  ZipSink.prototype._dispose = function _dispose (t, index) {
    var buffer = this.buffers[index];
    if (buffer.isEmpty()) {
      this.sink.end(t);
    }
  };

  return ZipSink;
}(Pipe));

var emitZipped = function (f, t, buffers, sink) { return sink.event(t, invoke(f, map(head, buffers))); };

var head = function (buffer) { return buffer.shift(); };

function ended (buffers, sinks) {
  for (var i = 0, l = buffers.length; i < l; ++i) {
    if (buffers[i].isEmpty() && !sinks[i].active) {
      return true
    }
  }
  return false
}

function ready (buffers) {
  for (var i = 0, l = buffers.length; i < l; ++i) {
    if (buffers[i].isEmpty()) {
      return false
    }
  }
  return true
}

var SkipRepeatsSink = (function (Pipe$$1) {
  function SkipRepeatsSink (equals, sink) {
    Pipe$$1.call(this, sink);
    this.equals = equals;
    this.value = void 0;
    this.init = true;
  }

  if ( Pipe$$1 ) SkipRepeatsSink.__proto__ = Pipe$$1;
  SkipRepeatsSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SkipRepeatsSink.prototype.constructor = SkipRepeatsSink;

  SkipRepeatsSink.prototype.event = function event (t, x) {
    if (this.init) {
      this.init = false;
      this.value = x;
      this.sink.event(t, x);
    } else if (!this.equals(this.value, x)) {
      this.value = x;
      this.sink.event(t, x);
    }
  };

  return SkipRepeatsSink;
}(Pipe));

var SliceSink = (function (Pipe$$1) {
  function SliceSink (skip, take, sink, disposable) {
    Pipe$$1.call(this, sink);
    this.skip = skip;
    this.take = take;
    this.disposable = disposable;
  }

  if ( Pipe$$1 ) SliceSink.__proto__ = Pipe$$1;
  SliceSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SliceSink.prototype.constructor = SliceSink;

  SliceSink.prototype.event = function event (t, x) {
    /* eslint complexity: [1, 4] */
    if (this.skip > 0) {
      this.skip -= 1;
      return
    }

    if (this.take === 0) {
      return
    }

    this.take -= 1;
    this.sink.event(t, x);
    if (this.take === 0) {
      this.disposable.dispose();
      this.sink.end(t);
    }
  };

  return SliceSink;
}(Pipe));

var TakeWhileSink = (function (Pipe$$1) {
  function TakeWhileSink (p, sink, disposable) {
    Pipe$$1.call(this, sink);
    this.p = p;
    this.active = true;
    this.disposable = disposable;
  }

  if ( Pipe$$1 ) TakeWhileSink.__proto__ = Pipe$$1;
  TakeWhileSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  TakeWhileSink.prototype.constructor = TakeWhileSink;

  TakeWhileSink.prototype.event = function event (t, x) {
    if (!this.active) {
      return
    }

    var p = this.p;
    this.active = p(x);

    if (this.active) {
      this.sink.event(t, x);
    } else {
      this.disposable.dispose();
      this.sink.end(t);
    }
  };

  return TakeWhileSink;
}(Pipe));

var SkipWhileSink = (function (Pipe$$1) {
  function SkipWhileSink (p, sink) {
    Pipe$$1.call(this, sink);
    this.p = p;
    this.skipping = true;
  }

  if ( Pipe$$1 ) SkipWhileSink.__proto__ = Pipe$$1;
  SkipWhileSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SkipWhileSink.prototype.constructor = SkipWhileSink;

  SkipWhileSink.prototype.event = function event (t, x) {
    if (this.skipping) {
      var p = this.p;
      this.skipping = p(x);
      if (this.skipping) {
        return
      }
    }

    this.sink.event(t, x);
  };

  return SkipWhileSink;
}(Pipe));

var SkipAfterSink = (function (Pipe$$1) {
  function SkipAfterSink (p, sink) {
    Pipe$$1.call(this, sink);
    this.p = p;
    this.skipping = false;
  }

  if ( Pipe$$1 ) SkipAfterSink.__proto__ = Pipe$$1;
  SkipAfterSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  SkipAfterSink.prototype.constructor = SkipAfterSink;

  SkipAfterSink.prototype.event = function event (t, x) {
    if (this.skipping) {
      return
    }

    var p = this.p;
    this.skipping = p(x);
    this.sink.event(t, x);

    if (this.skipping) {
      this.sink.end(t);
    }
  };

  return SkipAfterSink;
}(Pipe));

var Bound = (function (Pipe$$1) {
  function Bound (value, sink) {
    Pipe$$1.call(this, sink);
    this.value = value;
  }

  if ( Pipe$$1 ) Bound.__proto__ = Pipe$$1;
  Bound.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  Bound.prototype.constructor = Bound;

  Bound.prototype.event = function event () {};
  Bound.prototype.end = function end () {};

  Bound.prototype.dispose = function dispose$$1 () {};

  return Bound;
}(Pipe));

var TimeWindowSink = (function (Pipe$$1) {
  function TimeWindowSink (min, max, sink) {
    Pipe$$1.call(this, sink);
    this.min = min;
    this.max = max;
  }

  if ( Pipe$$1 ) TimeWindowSink.__proto__ = Pipe$$1;
  TimeWindowSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  TimeWindowSink.prototype.constructor = TimeWindowSink;

  TimeWindowSink.prototype.event = function event (t, x) {
    if (t >= this.min.value && t < this.max.value) {
      this.sink.event(t, x);
    }
  };

  return TimeWindowSink;
}(Pipe));

var LowerBound = (function (Pipe$$1) {
  function LowerBound (signal, sink, scheduler) {
    Pipe$$1.call(this, sink);
    this.value = Infinity;
    this.disposable = signal.run(this, scheduler);
  }

  if ( Pipe$$1 ) LowerBound.__proto__ = Pipe$$1;
  LowerBound.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  LowerBound.prototype.constructor = LowerBound;

  LowerBound.prototype.event = function event (t /*, x */) {
    if (t < this.value) {
      this.value = t;
    }
  };

  LowerBound.prototype.end = function end () {};

  LowerBound.prototype.dispose = function dispose$$1 () {
    return this.disposable.dispose()
  };

  return LowerBound;
}(Pipe));

var UpperBound = (function (Pipe$$1) {
  function UpperBound (signal, sink, scheduler) {
    Pipe$$1.call(this, sink);
    this.value = Infinity;
    this.disposable = signal.run(this, scheduler);
  }

  if ( Pipe$$1 ) UpperBound.__proto__ = Pipe$$1;
  UpperBound.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  UpperBound.prototype.constructor = UpperBound;

  UpperBound.prototype.event = function event (t, x) {
    if (t < this.value) {
      this.value = t;
      this.sink.end(t);
    }
  };

  UpperBound.prototype.end = function end () {};

  UpperBound.prototype.dispose = function dispose$$1 () {
    return this.disposable.dispose()
  };

  return UpperBound;
}(Pipe));

var DelaySink = (function (Pipe$$1) {
  function DelaySink (dt, sink, scheduler) {
    Pipe$$1.call(this, sink);
    this.dt = dt;
    this.scheduler = scheduler;
  }

  if ( Pipe$$1 ) DelaySink.__proto__ = Pipe$$1;
  DelaySink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  DelaySink.prototype.constructor = DelaySink;

  DelaySink.prototype.dispose = function dispose$$1 () {
    var this$1 = this;

    cancelAllTasks(function (task) { return task.sink === this$1.sink; }, this.scheduler);
  };

  DelaySink.prototype.event = function event (t, x) {
    delay(this.dt, propagateEventTask$1(x, this.sink), this.scheduler);
  };

  DelaySink.prototype.end = function end (t) {
    delay(this.dt, propagateEndTask(this.sink), this.scheduler);
  };

  return DelaySink;
}(Pipe));

var ThrottleSink = (function (Pipe$$1) {
  function ThrottleSink (period, sink) {
    Pipe$$1.call(this, sink);
    this.time = 0;
    this.period = period;
  }

  if ( Pipe$$1 ) ThrottleSink.__proto__ = Pipe$$1;
  ThrottleSink.prototype = Object.create( Pipe$$1 && Pipe$$1.prototype );
  ThrottleSink.prototype.constructor = ThrottleSink;

  ThrottleSink.prototype.event = function event (t, x) {
    if (t >= this.time) {
      this.time = t + this.period;
      this.sink.event(t, x);
    }
  };

  return ThrottleSink;
}(Pipe));

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function tryEvent (t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
}

function tryEnd (t, sink) {
  try {
    sink.end(t);
  } catch (e) {
    sink.error(t, e);
  }
}

var MulticastSource = function MulticastSource (source) {
  this.source = source;
  this.sinks = [];
  this.disposable = disposeNone();
};

MulticastSource.prototype.run = function run (sink, scheduler) {
  var n = this.add(sink);
  if (n === 1) {
    this.disposable = this.source.run(this, scheduler);
  }
  return disposeOnce(new MulticastDisposable(this, sink))
};

MulticastSource.prototype.dispose = function dispose$$1 () {
  var disposable = this.disposable;
  this.disposable = disposeNone();
  return disposable.dispose()
};

MulticastSource.prototype.add = function add (sink) {
  this.sinks = append(sink, this.sinks);
  return this.sinks.length
};

MulticastSource.prototype.remove = function remove$1 (sink) {
  var i = findIndex(sink, this.sinks);
  // istanbul ignore next
  if (i >= 0) {
    this.sinks = remove(i, this.sinks);
  }

  return this.sinks.length
};

MulticastSource.prototype.event = function event (time, value) {
  var s = this.sinks;
  if (s.length === 1) {
    return s[0].event(time, value)
  }
  for (var i = 0; i < s.length; ++i) {
    tryEvent(time, value, s[i]);
  }
};

MulticastSource.prototype.end = function end (time) {
  var s = this.sinks;
  for (var i = 0; i < s.length; ++i) {
    tryEnd(time, s[i]);
  }
};

MulticastSource.prototype.error = function error (time, err) {
  var s = this.sinks;
  for (var i = 0; i < s.length; ++i) {
    s[i].error(time, err);
  }
};

var MulticastDisposable = function MulticastDisposable (source, sink) {
  this.source = source;
  this.sink = sink;
};

MulticastDisposable.prototype.dispose = function dispose$$1 () {
  if (this.source.remove(this.sink) === 0) {
    this.source.dispose();
  }
};

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ProxyStream = /** @class */ (function (_super) {
    __extends(ProxyStream, _super);
    function ProxyStream() {
        var _this = _super.call(this, never()) || this;
        _this.attached = false;
        _this.running = false;
        return _this;
    }
    ProxyStream.prototype.run = function (sink, scheduler) {
        this.scheduler = scheduler;
        this.add(sink);
        var shouldRun = this.attached && !this.running;
        if (shouldRun) {
            this.running = true;
            this.disposable = this.source.run(this, scheduler);
            return this.disposable;
        }
        return new ProxyDisposable(this, sink);
    };
    ProxyStream.prototype.attach = function (stream) {
        if (this.attached)
            throw new Error('Can only attach 1 stream');
        this.attached = true;
        this.source = stream;
        var hasMoreSinks = this.sinks.length > 0;
        if (hasMoreSinks)
            this.disposable = stream.run(this, this.scheduler);
        return stream;
    };
    ProxyStream.prototype.error = function (time, error) {
        this.cleanup();
        _super.prototype.error.call(this, time, error);
    };
    ProxyStream.prototype.end = function (time) {
        this.cleanup();
        _super.prototype.end.call(this, time);
    };
    ProxyStream.prototype.cleanup = function () {
        this.attached = false;
        this.running = false;
    };
    return ProxyStream;
}(MulticastSource));
var ProxyDisposable = /** @class */ (function () {
    function ProxyDisposable(source, sink) {
        this.source = source;
        this.sink = sink;
        this.disposed = false;
    }
    ProxyDisposable.prototype.dispose = function () {
        if (this.disposed)
            return;
        var _a = this, source = _a.source, sink = _a.sink;
        this.disposed = true;
        var remainingSinks = source.remove(sink);
        var hasNoMoreSinks = remainingSinks === 0;
        return hasNoMoreSinks && source.dispose();
    };
    return ProxyDisposable;
}());

function create(f) {
    if (f === void 0) { f = id; }
    var source = new ProxyStream();
    return [source, f(source)];
}

function drive(model, view, intent) {
    var intentSetters = {};
    Object.keys(intent).forEach(function (key) {
        // create a Subject
        var _a = create(), attachSink = _a[0], source = _a[1];
        // pass the Subject's output stream
        intent[key](source);
        // save the Subject's sink setter
        intentSetters[key] = attachSink;
    });
    // initialize sources
    var viewStreams = {};
    Object.keys(view).forEach(function (key) {
        viewStreams[key] = view[key]();
    });
    // initialize sinks 
    var intentStreams = model(viewStreams);
    // start driving
    Object.keys(intentStreams).forEach(function (key) {
        var setter = intentSetters[key];
        setter(intentStreams[key]);
    });
}

export default drive;
