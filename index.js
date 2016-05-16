"use strict";
const domain = require('domain');
function HostZoneSetup(zone, opts) {
  // setup by host: node, browser, etc.
  // generally populate [[HostDefined]]
}

// Required for holding zone on domain
let ZONE_META = new WeakMap();
// Used to properly handle zone guarding
let GUARDING = true;

function HandleError(e) {
  if (GUARDING) {
    let zone = this.zone;
    while (zone !== null) {
      const handleError = ZONE_META.get(zone).handleError;
      if (handleError && handleError(e) === true) return;
      zone = zone.parent;
    }
  }
  throw e;
}
function CallInZone(zone, callback, thisArg, argumentsList, guarded) {
  const old_zone = CURRENT_ZONE;
  const old_guard = GUARDING;
  GUARDING = guarded;
  try {
    return ZONE_META.get(zone).domain.run(
      ()=>callback.apply(thisArg, argumentsList)
    );
  }
  finally {
    GUARDING = old_guard;
    CURRENT_ZONE = old_zone;
  }
}

// punch promise to emulate behavior
const $then = Promise.prototype.then;
Promise.prototype.then = function (on_fulfill, on_reject) {
  const zone = Zone.current;
  // Promises do their own Error handling
  // TODO: How can userland code act the same as this?
  return $then.call(this,
    typeof on_fulfill === 'function' ? function () {
      return CallInZone(zone, on_fulfill, this, arguments, false);
    } : on_fulfill,
    typeof on_reject === 'function' ? function () {
      return CallInZone(zone, on_reject, this, arguments, false);
    } : on_reject
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
let HANDLE_ERROR;
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
    let handleError = null;
    Object(options); // require it to be coercible
    const opt_name = options.name;
    if (opt_name !== undefined) name = opt_name;
    const opt_parent = options.parent;
    if (opt_parent !== undefined) parent = opt_parent;
    const opt_handleError = options.handleError;
    if (typeof opt_handleError === 'function') handleError = opt_handleError;
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
    meta.domain._events = HANDLE_ERROR;
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
    meta.handleError = handleError;
    Object.freeze(meta.domain);
    ZONE_META.set(this, meta);
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
HANDLE_ERROR = null;
let CURRENT_ZONE = new Zone({name:'(root zone)'});
ZONE_META.get(CURRENT_ZONE).domain.enter();
HANDLE_ERROR = Object.freeze({
  error: Object.freeze(HandleError)
});
