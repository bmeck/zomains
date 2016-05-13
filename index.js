"use strict";
const domain = require('domain');
function HostZoneSetup(zone, opts) {
  // setup by host: node, browser, etc.
  // generally populate [[HostDefined]]
}

// Required for special cases like Domains
let CALL_MAP = new WeakMap();
function HandleError(e) {
  let zone = this.zone;
  let handled = false;
  while (handled !== true && zone !== null) {
    const meta = CALL_MAP.get(zone);
    if (typeof meta.handleError === 'function') {
      handled = meta.handleError(e);
    }
    zone = zone.parent; 
  }
  if (handled !== true) {
    throw e;
  }
}
function CallInZone(zone, callback, thisArg, argumentsList, guarded) {
  if (!CALL_MAP.has(zone)) {
    throw TypeError(`Expected Zone ${zone} to have Call`);
  }
  const tmp = CURRENT_ZONE;
  CURRENT_ZONE = zone;
  const meta = CALL_MAP.get(zone);
  const domain = meta.domain;
  try {
    let ret;
    domain.enter()
    ret = callback.apply(thisArg, argumentsList);
    domain.exit();
    return ret;
  }
  catch (e) {
    if (guarded) {
      try {
        HandleError.call(domain, e);
        domain.exit();
        return;
      }
      catch (re) {
        e = re;
      }
    }
    domain.exit();
    throw e;
  }
  finally {
    CURRENT_ZONE = tmp;
  }
}

// punch promise to emulate behavior
const $then = Promise.prototype.then;
Promise.prototype.then = function (on_fulfill, on_reject) {
  const zone = Zone.current;
  const guarded = true;
  return $then.call(this,
    function () {
      return Call(zone, on_fulfill, this, arguments, guarded);
    },
    function () {
      return Call(zone, on_reject, this, arguments, guarded);
    }
  );
}
Promise.prototype.catch = function (on_reject) {
  return this.then(undefined, on_reject);
}

// where we will store [[ParentZone]]
const ParentZoneMap = new WeakMap();
// where we will store [[HostDefined]]
const HostDefinedZoneMap = new WeakMap();

// Zone constructor is %Zone%
// Zone.prototype is %ZonePrototype%
global.Zone = class Zone extends Object {
  
  static get current() {
    return CURRENT_ZONE;
  }
  
  // { "name": String? , "parent": Zone | null }
  constructor(options) {
    super();
    options = typeof options === 'undefined' ? {} : options;
    let name = '(unnamed zone)';
    let parent = null;
    Object(options); // require it to be coercible
    const opt_name = options.name;
    if (opt_name !== undefined) name = opt_name;
    const opt_parent = options.parent;
    if (opt_parent !== undefined) parent = opt_parent;
    if (parent !== null) {
      if (ParentZoneMap.has(parent) !== true) {
        throw TypeError();
      }
    }
    
    ParentZoneMap.set(this, parent);
    Object.defineProperty(this, 'name', {
      value: name,
      writable: false,
      enumerable: false, //?
      cofigurable: true
    });
    HostZoneSetup(this, options);
    // VM: optimize to per class, not per instance
    const meta = {
      domain: domain.create()
    };
    const self = this;
    const $enter = meta.domain.enter;
    const $exit = meta.domain.exit;
    let last_zone;
    // rage against the domain
    meta.domain._events = {
      error: [HandleError]
    };
    delete meta.domain.addListener;
    delete meta.domain.removeListener;
    delete meta.domain.on;
    delete meta.domain.removeAllListeners;
    meta.domain.enter = function enter() {
      last_zone = CURRENT_ZONE;
      CURRENT_ZONE = self;
      return $enter.apply(this, arguments);
    }
    meta.domain.exit = function exit() {
      CURRENT_ZONE = last_zone;
      const ret = $exit.apply(this, arguments);
      return ret;
    }
    meta.domain.zone = this;
    meta.handleError = options.handleError;
    Object.freeze(meta.domain);
    CALL_MAP.set(this, meta);
  }
  
  
  get parent() {
    return ParentZoneMap.get(this);
  }
  
  
  fork(options) {
    options = typeof options === 'undefined' ?
      { }
      : options;
    let name = typeof options.name === 'undefined' ?
      (''+this.name) + " child" :
      options.name;
    let handleError = typeof options.handleError === 'function' ?
      options.handleError :
      undefined;
    return new (this.constructor)({
      name,
      parent: this,
      handleError
    });
  }
  
  
  wrap(callback) {
    return this.run.bind(this, callback);
  }
  
  wrapGuarded(callback) {
    return this.runGuarded.bind(this, callback);
  }

  
  run(callback) {
    const zone = this;
    return CallInZone(zone, callback, undefined, [], false);
  }
  runGuarded(callback) {
    const zone = this;
    return CallInZone(zone, callback, undefined, [], true);
  }
}
Object.defineProperty(Zone, 'prototype', {
  value: Zone.prototype,
  writable: false,
  enumerable: false,
  configurable: false
});
// this is [[CurrentZone]]
let CURRENT_ZONE = new Zone({name:'(root zone)'});
CALL_MAP.get(CURRENT_ZONE).domain.enter();
CALL_MAP.get(CURRENT_ZONE).domain._events.error = null;
