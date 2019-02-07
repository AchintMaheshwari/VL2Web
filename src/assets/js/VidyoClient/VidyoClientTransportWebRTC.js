(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":3}],3:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
module.exports = function(dependencies) {
  var window = dependencies && dependencies.window;

  // Utils.
  var utils = require('./utils');
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog
  };

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      utils.shimCreateObjectURL(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia(window);
      utils.shimCreateObjectURL(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;

      edgeShim.shimGetUserMedia(window);
      utils.shimCreateObjectURL(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      // shim window.URL.createObjectURL Safari (technical preview)
      utils.shimCreateObjectURL(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimGetUserMedia(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};

},{"./chrome/chrome_shim":4,"./edge/edge_shim":1,"./firefox/firefox_shim":6,"./safari/safari_shim":8,"./utils":9}],4:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

var chromeShim = {
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = self.getReceivers().find(function(r) {
                  return r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = self.getReceivers().find(function(r) {
                  return r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimGetSendersWithDtmf: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      window.RTCPeerConnection.prototype.getSenders = function() {
        return this._senders || [];
      };
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;

      if (!window.RTCPeerConnection.prototype.addTrack) {
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          if (pc.signalingState === 'closed') {
            throw new DOMException(
              'The RTCPeerConnection\'s signalingState is \'closed\'.',
              'InvalidStateError');
          }
          var streams = [].slice.call(arguments, 1);
          if (streams.length !== 1 ||
              !streams[0].getTracks().find(function(t) {
                return t === track;
              })) {
            // this is not fully correct but all we can manage without
            // [[associated MediaStreams]] internal slot.
            throw new DOMException(
              'The adapter.js addTrack polyfill only supports a single ' +
              ' stream which is associated with the specified track.',
              'NotSupportedError');
          }

          pc._senders = pc._senders || [];
          var alreadyExists = pc._senders.find(function(t) {
            return t.track === track;
          });
          if (alreadyExists) {
            throw new DOMException('Track already exists.',
                'InvalidAccessError');
          }

          pc._streams = pc._streams || {};
          var oldStream = pc._streams[stream.id];
          if (oldStream) {
            oldStream.addTrack(track);
            pc.removeStream(oldStream);
            pc.addStream(oldStream);
          } else {
            var newStream = new window.MediaStream([track]);
            pc._streams[stream.id] = newStream;
            pc.addStream(newStream);
          }

          var sender = {
            track: track,
            get dtmf() {
              if (this._dtmf === undefined) {
                if (track.kind === 'audio') {
                  this._dtmf = pc.createDTMFSender(track);
                } else {
                  this._dtmf = null;
                }
              }
              return this._dtmf;
            }
          };
          pc._senders.push(sender);
          return sender;
        };
      }
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push({
            track: track,
            get dtmf() {
              if (this._dtmf === undefined) {
                if (track.kind === 'audio') {
                  this._dtmf = pc.createDTMFSender(track);
                } else {
                  this._dtmf = null;
                }
              }
              return this._dtmf;
            }
          });
        });
      };

      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
      });
    }
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              console.warn('RTCIceServer.url is deprecated! Use urls instead.');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var self = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(self, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var self = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(self, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var self = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(self, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimGetSendersWithDtmf: chromeShim.shimGetSendersWithDtmf,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":9,"./getusermedia":5}],5:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 61;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        InvalidStateError: 'NotReadableError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotReadableError',
        MediaDeviceKillSwitchOn: 'NotReadableError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        onError(shimError_(e));
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":9}],6:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

var firefoxShim = {
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":9,"./getusermedia":7}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    console.warn('navigator.getUserMedia has been replaced by ' +
                 'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":9}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var self = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(self, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var self = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            self.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            var stream = e.streams[0];
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            this._remoteStreams.push(stream);
            var event = new Event('addstream');
            event.stream = e.streams[0];
            this.dispatchEvent(event);
          }.bind(this));
        }
      });
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  }
};

// Expose public methods.
module.exports = {
  shimCallbacksAPI: safariShim.shimCallbacksAPI,
  shimLocalStreamsAPI: safariShim.shimLocalStreamsAPI,
  shimRemoteStreamsAPI: safariShim.shimRemoteStreamsAPI,
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
      } else { // Safari (in an unpublished version) or unknown webkit-based.
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/(\d+)\./, 1);
        } else { // unknown webkit-based browser.
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
        // Safari, with webkitGetUserMedia removed.
      result.browser = 'safari';
      result.version = this.extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if (0 && 'getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        console.log('URL.createObjectURL(stream) is deprecated! ' +
                    'Use elem.srcObject = stream instead!');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  extractVersion: utils.extractVersion,
  shimCreateObjectURL: utils.shimCreateObjectURL,
  detectBrowser: utils.detectBrowser.bind(utils)
};

},{}]},{},[2])(2)
});
(function(w) {

// Converted from MAX_CROP_PCT from VidyoClient/VidyoLocalRenderer.h
const MIN_VISIBLE_PCT_WIDTH = 60;
const MIN_VISIBLE_PCT_HEIGHT = 75;

var layoutMaker = {
	aspectW: 16,
	aspectH: 9,
	minVisiblePctX: MIN_VISIBLE_PCT_WIDTH,
	minVisiblePctY: MIN_VISIBLE_PCT_HEIGHT,
	equalSizes: true,
	strict: true,
	fill: true
};


/*  1 Participant                N xd yd #             0     */
const subRect_01_01_01_0 = [{ x:0,  y:0,  s:1}];

const layout1 =
[
	{ xd:1,  yd:1, full:true,  lovely:true,  flipped: true,  w:subRect_01_01_01_0}
];

/*  2 Participants               N xd yd #             0             1     */
const subRect_02_02_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}];

const layout2 =
[
	{ xd:2,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_02_02_01_0}
];

/*  3 Participants               N xd yd #             0             1             2     */
const subRect_03_04_04_0 = [{ x:1,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}];
const subRect_03_03_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:1}, { x:2,  y:1,  s:1}];
const subRect_03_03_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}];

const layout3 =
[
	{ xd:4,  yd:4, full:false, lovely:true,  flipped:false, w:subRect_03_04_04_0},
	{ xd:3,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_03_03_02_0},
	{ xd:3,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_03_03_01_0}
];

/*  4 Participants               N xd yd #             0             1             2             3     */
const subRect_04_02_02_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:0,  y:1,  s:1}, { x:1,  y:1,  s:1}];
const subRect_04_04_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:1}, { x:3,  y:1,  s:1}, { x:3,  y:2,  s:1}];
const subRect_04_05_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:3,  y:2,  s:1}, { x:4,  y:2,  s:1}];
const subRect_04_05_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:1}, { x:4,  y:1,  s:1}];
const subRect_04_04_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}];

const layout4 =
[
	{ xd:2,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_04_02_02_0},
	{ xd:4,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_04_04_03_0},
	{ xd:5,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_04_05_03_0},
	{ xd:5,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_04_05_02_0},
	{ xd:4,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_04_04_01_0}
];

/*  5 Participants               N xd yd #             0             1             2             3             4     */
const subRect_05_07_06_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:3}, { x:4,  y:3,  s:3}, { x:0,  y:4,  s:2}, { x:2,  y:4,  s:2}];
const subRect_05_06_05_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:0,  y:3,  s:2}, { x:2,  y:3,  s:2}, { x:4,  y:3,  s:2}];
const subRect_05_05_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:1}, { x:4,  y:1,  s:1}, { x:4,  y:2,  s:1}, { x:4,  y:3,  s:1}];
const subRect_05_07_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:2}, { x:5,  y:2,  s:2}, { x:5,  y:4,  s:1}, { x:6,  y:4,  s:1}];
const subRect_05_06_04_0 = [{ x:1,  y:0,  s:2}, { x:3,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}, { x:4,  y:2,  s:2}];
const subRect_05_08_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:3}, { x:5,  y:3,  s:2}, { x:7,  y:3,  s:1}, { x:7,  y:4,  s:1}];
const subRect_05_07_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:3}, { x:4,  y:3,  s:1}, { x:5,  y:3,  s:1}, { x:6,  y:3,  s:1}];
const subRect_05_04_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:1}, { x:2,  y:1,  s:1}, { x:3,  y:0,  s:1}, { x:3,  y:1,  s:1}];
const subRect_05_07_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:1}, { x:6,  y:1,  s:1}, { x:6,  y:2,  s:1}];
const subRect_05_08_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:2}, { x:6,  y:2,  s:1}, { x:7,  y:2,  s:1}];
const subRect_05_07_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:1}, { x:6,  y:1,  s:1}];
const subRect_05_05_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}];

const layout5 =
[
	{ xd:7,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_05_07_06_0},
	{ xd:6,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_05_06_05_0},
	{ xd:5,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_05_05_04_0},
	{ xd:7,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_05_07_05_0},
	{ xd:6,  yd:4, full:false, lovely:true,  flipped:false, w:subRect_05_06_04_0},
	{ xd:8,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_05_08_05_0},
	{ xd:7,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_05_07_04_0},
	{ xd:4,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_05_04_02_0},
	{ xd:7,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_05_07_03_0},
	{ xd:8,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_05_08_03_0},
	{ xd:7,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_05_07_02_0},
	{ xd:5,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_05_05_01_0}
];

/*  6 Participants               N xd yd #             0             1             2             3             4             5     */
const subRect_06_03_03_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:1}, { x:2,  y:1,  s:1}, { x:0,  y:2,  s:1}, { x:1,  y:2,  s:1}, { x:2,  y:2,  s:1}];
const subRect_06_11_10_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:5}, { x:6,  y:5,  s:5}, { x:0,  y:6,  s:4}, { x:4,  y:6,  s:2}, { x:4,  y:8,  s:2}];
const subRect_06_10_09_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, { x:0,  y:5,  s:4}, { x:6,  y:5,  s:4}, { x:4,  y:5,  s:2}, { x:4,  y:7,  s:2}];
const subRect_06_06_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:1}, { x:5,  y:1,  s:1}, { x:5,  y:2,  s:1}, { x:5,  y:3,  s:1}, { x:5,  y:4,  s:1}];
const subRect_06_05_04_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:3,  y:2,  s:2}, { x:0,  y:3,  s:1}, { x:1,  y:3,  s:1}, { x:2,  y:3,  s:1}];
const subRect_06_04_03_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:0,  y:2,  s:1}, { x:1,  y:2,  s:1}, { x:2,  y:2,  s:1}, { x:3,  y:2,  s:1}];
const subRect_06_03_02_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:0,  y:1,  s:1}, { x:1,  y:1,  s:1}, { x:2,  y:1,  s:1}];
const subRect_06_06_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:2}, { x:4,  y:2,  s:1}, { x:5,  y:2,  s:1}, { x:4,  y:3,  s:1}, { x:5,  y:3,  s:1}];
const subRect_06_09_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:4}, { x:5,  y:4,  s:1}, { x:6,  y:4,  s:1}, { x:7,  y:4,  s:1}, { x:8,  y:4,  s:1}];
const subRect_06_11_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:3}, { x:6,  y:3,  s:3}, { x:9,  y:0,  s:2}, { x:9,  y:2,  s:2}, { x:9,  y:4,  s:2}];
const subRect_06_13_07_0 = [{ x:0,  y:0,  s:7}, { x:7,  y:0,  s:4}, { x:7,  y:4,  s:3}, {x:10,  y:4,  s:3}, {x:11,  y:0,  s:2}, {x:11,  y:2,  s:2}];
const subRect_06_13_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:4}, {x:10,  y:0,  s:3}, {x:10,  y:3,  s:3}, { x:6,  y:4,  s:2}, { x:8,  y:4,  s:2}];
const subRect_06_11_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:3}, { x:8,  y:0,  s:3}, { x:5,  y:3,  s:2}, { x:7,  y:3,  s:2}, { x:9,  y:3,  s:2}];
const subRect_06_09_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:1}, { x:8,  y:1,  s:1}, { x:8,  y:2,  s:1}, { x:8,  y:3,  s:1}];
const subRect_06_12_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, {x:10,  y:0,  s:2}, {x:10,  y:2,  s:2}, {x:10,  y:4,  s:1}, {x:11,  y:4,  s:1}];
const subRect_06_13_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, {x:10,  y:0,  s:3}, {x:10,  y:3,  s:2}, {x:12,  y:3,  s:1}, {x:12,  y:4,  s:1}];
const subRect_06_11_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:3}, { x:8,  y:3,  s:1}, { x:9,  y:3,  s:1}, {x:10,  y:3,  s:1}];
const subRect_06_06_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:1}, { x:5,  y:0,  s:1}, { x:4,  y:1,  s:1}, { x:5,  y:1,  s:1}];
const subRect_06_10_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:1}, { x:9,  y:1,  s:1}, { x:9,  y:2,  s:1}];
const subRect_06_11_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:2}, { x:9,  y:2,  s:1}, {x:10,  y:2,  s:1}];
const subRect_06_09_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:1}, { x:8,  y:1,  s:1}];
const subRect_06_06_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}, { x:5,  y:0,  s:1}];

const layout6 =
[
	{ xd:3,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_06_03_03_0},
	{xd:11, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_06_11_10_0},
	{xd:10,  yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_06_10_09_0},
	{ xd:6,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_06_06_05_0},
	{ xd:5,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_06_05_04_0},
	{ xd:4,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_06_04_03_0},
	{ xd:3,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_06_03_02_0},
	{ xd:6,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_06_06_04_0},
	{ xd:9,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_06_09_05_0},
	{xd:11,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_06_11_06_0},
	{xd:13,  yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_06_13_07_0},
	{xd:13,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_06_13_06_0},
	{xd:11,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_06_11_05_0},
	{ xd:9,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_06_09_04_0},
	{xd:12,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_06_12_05_0},
	{xd:13,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_06_13_05_0},
	{xd:11,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_06_11_04_0},
	{ xd:6,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_06_06_02_0},
	{xd:10,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_06_10_03_0},
	{xd:11,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_06_11_03_0},
	{ xd:9,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_06_09_02_0},
	{ xd:6,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_06_06_01_0}
];

/*  7 Participants               N xd yd #             0             1             2             3             4             5             6     */
const subRect_07_04_04_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:1}, { x:3,  y:2,  s:1}, { x:2,  y:3,  s:1}, { x:3,  y:3,  s:1}];
const subRect_07_06_06_0 = [{ x:1,  y:0,  s:2}, { x:3,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}, { x:4,  y:2,  s:2}, { x:1,  y:4,  s:2}, { x:3,  y:4,  s:2}];
const subRect_07_15_14_0 = [{ x:0,  y:0,  s:9}, { x:9,  y:3,  s:6}, { x:0,  y:9,  s:5}, { x:5,  y:9,  s:5}, {x:10,  y:9,  s:5}, { x:9,  y:0,  s:3}, {x:12,  y:0,  s:3}];
const subRect_07_14_13_0 = [{ x:0,  y:0,  s:7}, { x:7,  y:0,  s:7}, { x:0,  y:7,  s:6}, { x:8,  y:7,  s:6}, { x:6,  y:7,  s:2}, { x:6,  y:9,  s:2}, { x:6,  y:11, s:2}];
const subRect_07_13_12_0 = [{ x:0,  y:0,  s:9}, { x:9,  y:0,  s:4}, { x:9,  y:4,  s:4}, { x:9,  y:8,  s:4}, { x:0,  y:9,  s:3}, { x:3,  y:9,  s:3}, { x:6,  y:9,  s:3}];
const subRect_07_12_11_0 = [{ x:0,  y:0,  s:8}, { x:8,  y:0,  s:4}, { x:8,  y:4,  s:4}, { x:0,  y:8,  s:3}, { x:3,  y:8,  s:3}, { x:6,  y:8,  s:3}, { x:9,  y:8,  s:3}];
const subRect_07_08_06_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:0,  y:3,  s:3}, { x:3,  y:3,  s:3}, { x:6,  y:0,  s:2}, { x:6,  y:2,  s:2}, { x:6,  y:4,  s:2}];
const subRect_07_15_11_0 = [{ x:0,  y:0,  s:6}, { x:9,  y:0,  s:6}, { x:0,  y:6,  s:5}, { x:5,  y:6,  s:5}, {x:10,  y:6,  s:5}, { x:6,  y:0,  s:3}, { x:6,  y:3,  s:3}];
const subRect_07_07_05_0 = [{ x:0,  y:0,  s:3}, { x:4,  y:2,  s:3}, { x:3,  y:0,  s:2}, { x:5,  y:0,  s:2}, { x:0,  y:3,  s:2}, { x:2,  y:3,  s:2}, { x:3,  y:2,  s:1}];
const subRect_07_10_07_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, { x:0,  y:5,  s:2}, { x:2,  y:5,  s:2}, { x:4,  y:5,  s:2}, { x:6,  y:5,  s:2}, { x:8,  y:5,  s:2}];
const subRect_07_05_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}, { x:3,  y:1,  s:1}, { x:4,  y:1,  s:1}, { x:3,  y:2,  s:1}, { x:4,  y:2,  s:1}];
const subRect_07_10_06_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:3}, { x:7,  y:0,  s:3}, { x:4,  y:3,  s:3}, { x:7,  y:3,  s:3}, { x:0,  y:4,  s:2}, { x:2,  y:4,  s:2}];
const subRect_07_17_10_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:6}, {x:12,  y:0,  s:5}, {x:12,  y:5,  s:5}, { x:0,  y:6,  s:4}, { x:4,  y:6,  s:4}, { x:8,  y:6,  s:4}];
const subRect_07_12_07_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:4}, { x:0,  y:4,  s:3}, { x:3,  y:4,  s:3}, { x:6,  y:4,  s:3}, { x:9,  y:4,  s:3}];
const subRect_07_07_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:2}, { x:4,  y:2,  s:2}, { x:6,  y:0,  s:1}, { x:6,  y:1,  s:1}, { x:6,  y:2,  s:1}, { x:6,  y:3,  s:1}];
const subRect_07_06_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:5,  y:0,  s:1}, { x:5,  y:1,  s:1}, { x:3,  y:2,  s:1}, { x:4,  y:2,  s:1}, { x:5,  y:2,  s:1}];
const subRect_07_08_04_0 = [{ x:1,  y:0,  s:2}, { x:3,  y:0,  s:2}, { x:5,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}, { x:4,  y:2,  s:2}, { x:6,  y:2,  s:2}];
const subRect_07_07_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:5,  y:0,  s:2}, { x:3,  y:2,  s:1}, { x:4,  y:2,  s:1}, { x:5,  y:2,  s:1}, { x:6,  y:2,  s:1}];
const subRect_07_05_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}, { x:2,  y:1,  s:1}, { x:3,  y:1,  s:1}, { x:4,  y:1,  s:1}];
const subRect_07_17_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:6}, {x:12,  y:0,  s:3}, {x:12,  y:3,  s:3}, {x:15,  y:0,  s:2}, {x:15,  y:2,  s:2}, {x:15,  y:4,  s:2}];
const subRect_07_19_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:6}, {x:12,  y:0,  s:4}, {x:16,  y:0,  s:3}, {x:16,  y:3,  s:3}, {x:12,  y:4,  s:2}, {x:14,  y:4,  s:2}];
const subRect_07_16_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, {x:10,  y:0,  s:3}, {x:13,  y:0,  s:3}, {x:10,  y:3,  s:2}, {x:12,  y:3,  s:2}, {x:14,  y:3,  s:2}];
const subRect_07_13_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:4}, {x:12,  y:0,  s:1}, {x:12,  y:1,  s:1}, {x:12,  y:2,  s:1}, {x:12,  y:3,  s:1}];
const subRect_07_15_04_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:4}, {x:12,  y:0,  s:3}, {x:12,  y:3,  s:1}, {x:13,  y:3,  s:1}, {x:14,  y:3,  s:1}];
const subRect_07_08_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:1}, { x:7,  y:0,  s:1}, { x:6,  y:1,  s:1}, { x:7,  y:1,  s:1}];
const subRect_07_13_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:3}, {x:12,  y:0,  s:1}, {x:12,  y:1,  s:1}, {x:12,  y:2,  s:1}];
const subRect_07_14_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:3}, {x:12,  y:0,  s:2}, {x:12,  y:2,  s:1}, {x:13,  y:2,  s:1}];
const subRect_07_11_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:2}, {x:10,  y:0,  s:1}, {x:10,  y:1,  s:1}];
const subRect_07_07_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}, { x:5,  y:0,  s:1}, { x:6,  y:0,  s:1}];

const layout7 =
[
	{ xd:4,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_07_04_04_0},
	{ xd:6,  yd:6, full:false, lovely:true,  flipped:false, w:subRect_07_06_06_0},
	{xd:15, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_07_15_14_0},
	{xd:14, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_07_14_13_0},
	{xd:13, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_07_13_12_0},
	{xd:12, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_07_12_11_0},
	{ xd:8,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_07_08_06_0},
	{xd:15, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_07_15_11_0},
	{ xd:7,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_07_07_05_0},
	{xd:10,  yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_07_10_07_0},
	{ xd:5,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_07_05_03_0},
	{xd:10,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_07_10_06_0},
	{xd:17, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_07_17_10_0},
	{xd:12,  yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_07_12_07_0},
	{ xd:7,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_07_07_04_0},
	{ xd:6,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_07_06_03_0},
	{ xd:8,  yd:4, full:false, lovely:true,  flipped:false, w:subRect_07_08_04_0},
	{ xd:7,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_07_07_03_0},
	{ xd:5,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_07_05_02_0},
	{xd:17,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_07_17_06_0},
	{xd:19,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_07_19_06_0},
	{xd:16,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_07_16_05_0},
	{xd:13,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_07_13_04_0},
	{xd:15,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_07_15_04_0},
	{ xd:8,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_07_08_02_0},
	{xd:13,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_07_13_03_0},
	{xd:14,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_07_14_03_0},
	{xd:11,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_07_11_02_0},
	{ xd:7,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_07_07_01_0}
];

/*  8 Participants               N xd yd #             0             1             2             3             4             5             6             7     */
const subRect_08_04_04_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:1}, { x:3,  y:1,  s:1}, { x:3,  y:2,  s:1}, { x:0,  y:3,  s:1}, { x:1,  y:3,  s:1}, { x:2,  y:3,  s:1}, { x:3,  y:3,  s:1}];
const subRect_08_05_05_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:0,  y:3,  s:2}, { x:3,  y:3,  s:2}, { x:3,  y:2,  s:1}, { x:4,  y:2,  s:1}, { x:2,  y:3,  s:1}, { x:2,  y:4,  s:1}];
const subRect_08_06_06_0 = [{ x:1,  y:0,  s:2}, { x:3,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}, { x:4,  y:2,  s:2}, { x:0,  y:4,  s:2}, { x:2,  y:4,  s:2}, { x:4,  y:4,  s:2}];
const subRect_08_07_06_0 = [{ x:0,  y:0,  s:3}, { x:0,  y:3,  s:3}, { x:3,  y:0,  s:2}, { x:3,  y:2,  s:2}, { x:3,  y:4,  s:2}, { x:5,  y:0,  s:2}, { x:5,  y:2,  s:2}, { x:5,  y:4,  s:2}];
const subRect_08_25_21_0 = [{ x:0,  y:0, s:12}, { x:0, y:12,  s:9}, { x:9, y:12,  s:9}, {x:18,  y:0,  s:7}, {x:18,  y:7,  s:7}, {x:18, y:14,  s:7}, {x:12,  y:0,  s:6}, {x:12,  y:6,  s:6}];
const subRect_08_06_05_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:1,  y:3,  s:2}, { x:3,  y:3,  s:2}, { x:0,  y:3,  s:1}, { x:0,  y:4,  s:1}, { x:5,  y:3,  s:1}, { x:5,  y:4,  s:1}];
const subRect_08_12_10_0 = [{ x:3,  y:0,  s:6}, { x:0,  y:6,  s:4}, { x:4,  y:6,  s:4}, { x:8,  y:6,  s:4}, { x:0,  y:0,  s:3}, { x:0,  y:3,  s:3}, { x:9,  y:0,  s:3}, { x:9,  y:3,  s:3}];
const subRect_08_05_04_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:0,  y:2,  s:2}, { x:2,  y:2,  s:2}, { x:4,  y:0,  s:1}, { x:4,  y:1,  s:1}, { x:4,  y:2,  s:1}, { x:4,  y:3,  s:1}];
const subRect_08_14_10_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, { x:0,  y:5,  s:5}, { x:5,  y:5,  s:5}, {x:10,  y:0,  s:4}, {x:10,  y:4,  s:4}, {x:10,  y:8,  s:2}, {x:12,  y:8,  s:2}];
const subRect_08_06_04_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:0,  y:3,  s:1}, { x:1,  y:3,  s:1}, { x:2,  y:3,  s:1}, { x:3,  y:3,  s:1}, { x:4,  y:3,  s:1}, { x:5,  y:3,  s:1}];
const subRect_08_09_06_0 = [{ x:3,  y:0,  s:4}, { x:0,  y:0,  s:3}, { x:0,  y:3,  s:3}, { x:7,  y:0,  s:2}, { x:7,  y:2,  s:2}, { x:3,  y:4,  s:2}, { x:5,  y:4,  s:2}, { x:7,  y:4,  s:2}];
const subRect_08_23_15_0 = [{ x:0,  y:0,  s:9}, { x:9,  y:0,  s:9}, { x:0,  y:9,  s:6}, { x:6,  y:9,  s:6}, {x:12,  y:9,  s:6}, {x:18,  y:0,  s:5}, {x:18,  y:5,  s:5}, {x:18, y:10,  s:5}];
const subRect_08_20_13_0 = [{ x:0,  y:0,  s:8}, {x:12,  y:0,  s:8}, { x:0,  y:8,  s:5}, { x:5,  y:8,  s:5}, {x:10,  y:8,  s:5}, {x:15,  y:8,  s:5}, { x:8,  y:0,  s:4}, { x:8,  y:4,  s:4}];
const subRect_08_16_10_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:5}, {x:11,  y:0,  s:5}, { x:6,  y:5,  s:5}, {x:11,  y:5,  s:5}, { x:0,  y:6,  s:4}, { x:4,  y:6,  s:2}, { x:4,  y:8,  s:2}];
const subRect_08_21_13_0 = [{ x:0,  y:0,  s:7}, { x:7,  y:0,  s:7}, {x:14,  y:0,  s:7}, { x:0,  y:7,  s:6}, { x:6,  y:7,  s:6}, {x:12,  y:7,  s:6}, {x:18,  y:7,  s:3}, {x:18, y:10,  s:3}];
const subRect_08_07_04_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:2}, { x:5,  y:0,  s:2}, { x:3,  y:2,  s:2}, { x:5,  y:2,  s:2}, { x:0,  y:3,  s:1}, { x:1,  y:3,  s:1}, { x:2,  y:3,  s:1}];
const subRect_08_11_06_0 = [{ x:0,  y:0,  s:4}, { x:4,  y:0,  s:4}, { x:8,  y:0,  s:3}, { x:8,  y:3,  s:3}, { x:0,  y:4,  s:2}, { x:2,  y:4,  s:2}, { x:4,  y:4,  s:2}, { x:6,  y:4,  s:2}];
const subRect_08_28_15_0 = [{ x:0,  y:0, s:10}, {x:10,  y:0,  s:9}, {x:19,  y:0,  s:9}, {x:10,  y:9,  s:6}, {x:16,  y:9,  s:6}, {x:22,  y:9,  s:6}, { x:0, y:10,  s:5}, { x:5, y:10,  s:5}];
const subRect_08_15_08_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, {x:10,  y:0,  s:5}, { x:0,  y:5,  s:3}, { x:3,  y:5,  s:3}, { x:6,  y:5,  s:3}, { x:9,  y:5,  s:3}, {x:12,  y:5,  s:3}];
const subRect_08_04_02_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:0,  y:1,  s:1}, { x:1,  y:1,  s:1}, { x:2,  y:1,  s:1}, { x:3,  y:1,  s:1}];
const subRect_08_14_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:3}, { x:6,  y:3,  s:3}, { x:9,  y:3,  s:3}, {x:12,  y:0,  s:2}, {x:12,  y:2,  s:2}, {x:12,  y:4,  s:2}];
const subRect_08_08_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:1}, { x:7,  y:0,  s:1}, { x:6,  y:1,  s:1}, { x:7,  y:1,  s:1}, { x:6,  y:2,  s:1}, { x:7,  y:2,  s:1}];
const subRect_08_16_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:4}, {x:10,  y:0,  s:3}, {x:13,  y:0,  s:3}, {x:10,  y:3,  s:3}, {x:13,  y:3,  s:3}, { x:6,  y:4,  s:2}, { x:8,  y:4,  s:2}];
const subRect_08_27_10_0 = [{ x:0,  y:0, s:10}, {x:10,  y:0,  s:6}, {x:16,  y:0,  s:6}, {x:22,  y:0,  s:5}, {x:22,  y:5,  s:5}, {x:10,  y:6,  s:4}, {x:14,  y:6,  s:4}, {x:18,  y:6,  s:4}];
const subRect_08_19_07_0 = [{ x:0,  y:0,  s:7}, { x:7,  y:0,  s:4}, {x:11,  y:0,  s:4}, {x:15,  y:0,  s:4}, { x:7,  y:4,  s:3}, {x:10,  y:4,  s:3}, {x:13,  y:4,  s:3}, {x:16,  y:4,  s:3}];
const subRect_08_09_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:1}, { x:8,  y:1,  s:1}, { x:6,  y:2,  s:1}, { x:7,  y:2,  s:1}, { x:8,  y:2,  s:1}];
const subRect_08_10_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:2}, { x:6,  y:2,  s:1}, { x:7,  y:2,  s:1}, { x:8,  y:2,  s:1}, { x:9,  y:2,  s:1}];
const subRect_08_07_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:1}, { x:5,  y:0,  s:1}, { x:6,  y:0,  s:1}, { x:4,  y:1,  s:1}, { x:5,  y:1,  s:1}, { x:6,  y:1,  s:1}];
const subRect_08_23_06_0 = [{ x:0,  y:0,  s:6}, { x:6,  y:0,  s:6}, {x:12,  y:0,  s:6}, {x:18,  y:0,  s:3}, {x:18,  y:3,  s:3}, {x:21,  y:0,  s:2}, {x:21,  y:2,  s:2}, {x:21,  y:4,  s:2}];
const subRect_08_21_05_0 = [{ x:0,  y:0,  s:5}, { x:5,  y:0,  s:5}, {x:10,  y:0,  s:5}, {x:15,  y:0,  s:3}, {x:18,  y:0,  s:3}, {x:15,  y:3,  s:2}, {x:17,  y:3,  s:2}, {x:19,  y:3,  s:2}];
const subRect_08_10_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:1}, { x:9,  y:0,  s:1}, { x:8,  y:1,  s:1}, { x:9,  y:1,  s:1}];
const subRect_08_16_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:3}, {x:12,  y:0,  s:3}, {x:15,  y:0,  s:1}, {x:15,  y:1,  s:1}, {x:15,  y:2,  s:1}];
const subRect_08_17_03_0 = [{ x:0,  y:0,  s:3}, { x:3,  y:0,  s:3}, { x:6,  y:0,  s:3}, { x:9,  y:0,  s:3}, {x:12,  y:0,  s:3}, {x:15,  y:0,  s:2}, {x:15,  y:2,  s:1}, {x:16,  y:2,  s:1}];
const subRect_08_13_02_0 = [{ x:0,  y:0,  s:2}, { x:2,  y:0,  s:2}, { x:4,  y:0,  s:2}, { x:6,  y:0,  s:2}, { x:8,  y:0,  s:2}, {x:10,  y:0,  s:2}, {x:12,  y:0,  s:1}, {x:12,  y:1,  s:1}];
const subRect_08_08_01_0 = [{ x:0,  y:0,  s:1}, { x:1,  y:0,  s:1}, { x:2,  y:0,  s:1}, { x:3,  y:0,  s:1}, { x:4,  y:0,  s:1}, { x:5,  y:0,  s:1}, { x:6,  y:0,  s:1}, { x:7,  y:0,  s:1}];

const layout8 =
[
	{ xd:4,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_08_04_04_0},
	{ xd:5,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_08_05_05_0},
	{ xd:6,  yd:6, full:false, lovely:true,  flipped:false, w:subRect_08_06_06_0},
	{ xd:7,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_07_06_0},
	{xd:25, yd:21, full:true,  lovely:true,  flipped:true,  w:subRect_08_25_21_0},
	{ xd:6,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_08_06_05_0},
	{xd:12, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_08_12_10_0},
	{ xd:5,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_08_05_04_0},
	{xd:14, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_08_14_10_0},
	{ xd:6,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_08_06_04_0},
	{ xd:9,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_09_06_0},
	{xd:23, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_08_23_15_0},
	{xd:20, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_08_20_13_0},
	{xd:16, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_08_16_10_0},
	{xd:21, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_08_21_13_0},
	{ xd:7,  yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_08_07_04_0},
	{xd:11,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_11_06_0},
	{xd:28, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_08_28_15_0},
	{xd:15,  yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_08_15_08_0},
	{ xd:4,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_08_04_02_0},
	{xd:14,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_14_06_0},
	{ xd:8,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_08_08_03_0},
	{xd:16,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_16_06_0},
	{xd:27, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_08_27_10_0},
	{xd:19,  yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_08_19_07_0},
	{ xd:9,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_08_09_03_0},
	{xd:10,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_08_10_03_0},
	{ xd:7,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_08_07_02_0},
	{xd:23,  yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_08_23_06_0},
	{xd:21,  yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_08_21_05_0},
	{xd:10,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_08_10_02_0},
	{xd:16,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_08_16_03_0},
	{xd:17,  yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_08_17_03_0},
	{xd:13,  yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_08_13_02_0},
	{ xd:8,  yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_08_08_01_0}
];

/*  9 Participants               N xd yd #             0             1             2             3             4             5             6             7             8     */
const subRect_09_03_03_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}];
const subRect_09_06_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:2}, {x:5, y:3, s:1}, {x:5, y:4, s:1}, {x:3, y:5, s:1}, {x:4, y:5, s:1}, {x:5, y:5, s:1}];
const subRect_09_13_12_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:0, s:4}, {x:6, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:0, s:3}, {x:10, y:3, s:3}, {x:10, y:6, s:3}, {x:10, y:9, s:3}];
const subRect_09_10_09_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:4}, {x:4, y:5, s:2}, {x:6, y:5, s:2}, {x:8, y:5, s:2}, {x:4, y:7, s:2}, {x:6, y:7, s:2}, {x:8, y:7, s:2}];
const subRect_09_05_04_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}];
const subRect_09_10_08_0 = [{x:0, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:4, y:6, s:2}, {x:6, y:6, s:2}, {x:8, y:6, s:2}];
const subRect_09_04_03_0 = [{x:1, y:0, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:3, y:0, s:1}, {x:3, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}];
const subRect_09_06_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_09_06_04_1 = [{x:0, y:0, s:4}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_09_08_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:1, s:2}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}];
const subRect_09_05_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:4, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}];
const subRect_09_09_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:8, y:3, s:1}, {x:8, y:4, s:1}];
const subRect_09_11_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:0, s:2}, {x:9, y:2, s:2}, {x:9, y:4, s:2}];
const subRect_09_26_14_0 = [{x:14, y:0, s:8}, {x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:0, y:7, s:7}, {x:7, y:7, s:7}, {x:14, y:8, s:6}, {x:20, y:8, s:6}, {x:22, y:0, s:4}, {x:22, y:4, s:4}];
const subRect_09_28_15_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:0, y:8, s:7}, {x:7, y:8, s:7}, {x:14, y:8, s:7}, {x:21, y:8, s:7}, {x:24, y:0, s:4}, {x:24, y:4, s:4}];
const subRect_09_06_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}];
const subRect_09_13_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:10, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:10, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}];
const subRect_09_22_10_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:5}, {x:17, y:0, s:5}, {x:12, y:5, s:5}, {x:17, y:5, s:5}, {x:0, y:6, s:4}, {x:4, y:6, s:4}, {x:8, y:6, s:4}];
const subRect_09_31_14_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:24, y:0, s:7}, {x:24, y:7, s:7}, {x:0, y:8, s:6}, {x:6, y:8, s:6}, {x:12, y:8, s:6}, {x:18, y:8, s:6}];
const subRect_09_20_09_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:5}, {x:0, y:5, s:4}, {x:4, y:5, s:4}, {x:8, y:5, s:4}, {x:12, y:5, s:4}, {x:16, y:5, s:4}];
const subRect_09_06_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}];
const subRect_09_11_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}, {x:9, y:2, s:1}, {x:10, y:2, s:1}];
const subRect_09_09_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}];
const subRect_09_21_04_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:4}, {x:16, y:0, s:4}, {x:20, y:0, s:1}, {x:20, y:1, s:1}, {x:20, y:2, s:1}, {x:20, y:3, s:1}];
const subRect_09_12_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}];
const subRect_09_19_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:15, y:0, s:3}, {x:18, y:0, s:1}, {x:18, y:1, s:1}, {x:18, y:2, s:1}];
const subRect_09_15_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:1}, {x:14, y:1, s:1}];
const subRect_09_09_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}];

const layout9 =
[
	{xd:3, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_09_03_03_0},
	{xd:6, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_09_06_06_0},
	{xd:13, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_09_13_12_0},
	{xd:10, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_09_10_09_0},
	{xd:5, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_09_05_04_0},
	{xd:10, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_09_10_08_0},
	{xd:4, yd:3, full:true,  lovely:true,  flipped:false, w:subRect_09_04_03_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_09_06_04_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_09_06_04_1},
	{xd:8, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_09_08_05_0},
	{xd:5, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_09_05_03_0},
	{xd:9, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_09_09_05_0},
	{xd:11, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_09_11_06_0},
	{xd:26, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_09_26_14_0},
	{xd:28, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_09_28_15_0},
	{xd:6, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_09_06_03_0},
	{xd:13, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_09_13_06_0},
	{xd:22, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_09_22_10_0},
	{xd:31, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_09_31_14_0},
	{xd:20, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_09_20_09_0},
	{xd:6, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_09_06_02_0},
	{xd:11, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_09_11_03_0},
	{xd:9, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_09_09_02_0},
	{xd:21, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_09_21_04_0},
	{xd:12, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_09_12_02_0},
	{xd:19, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_09_19_03_0},
	{xd:15, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_09_15_02_0},
	{xd:9, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_09_09_01_0}
];

/* 10 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9     */
const subRect_10_04_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}];
const subRect_10_05_05_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:1}, {x:4, y:1, s:1}, {x:4, y:2, s:1}, {x:4, y:3, s:1}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}];
const subRect_10_16_15_0 = [{x:5, y:0, s:6}, {x:5, y:9, s:6}, {x:0, y:0, s:5}, {x:0, y:5, s:5}, {x:0, y:10, s:5}, {x:11, y:0, s:5}, {x:11, y:5, s:5}, {x:11, y:10, s:5}, {x:5, y:6, s:3}, {x:8, y:6, s:3}];
const subRect_10_15_14_0 = [{x:3, y:0, s:9}, {x:0, y:9, s:5}, {x:5, y:9, s:5}, {x:10, y:9, s:5}, {x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:0, y:6, s:3}, {x:12, y:0, s:3}, {x:12, y:3, s:3}, {x:12, y:6, s:3}];
const subRect_10_14_13_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:4, y:8, s:5}, {x:9, y:8, s:5}, {x:10, y:0, s:4}, {x:10, y:4, s:4}, {x:0, y:5, s:4}, {x:0, y:9, s:4}, {x:4, y:5, s:3}, {x:7, y:5, s:3}];
const subRect_10_26_24_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:9}, {x:0, y:9, s:9}, {x:9, y:9, s:9}, {x:18, y:0, s:8}, {x:18, y:8, s:8}, {x:18, y:16, s:8}, {x:0, y:18, s:6}, {x:6, y:18, s:6}, {x:12, y:18, s:6}];
const subRect_10_12_11_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:4, s:4}, {x:8, y:4, s:4}, {x:0, y:8, s:3}, {x:3, y:8, s:3}, {x:6, y:8, s:3}, {x:9, y:8, s:3}];
const subRect_10_07_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:6, y:3, s:1}, {x:6, y:4, s:1}, {x:6, y:5, s:1}];
const subRect_10_15_12_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:4}, {x:8, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:8, s:4}, {x:8, y:8, s:4}, {x:12, y:0, s:3}, {x:12, y:3, s:3}, {x:12, y:6, s:3}, {x:12, y:9, s:3}];
const subRect_10_08_06_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:1, y:4, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}];
const subRect_10_16_12_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:0, y:6, s:6}, {x:12, y:0, s:4}, {x:12, y:4, s:4}, {x:12, y:8, s:4}, {x:6, y:6, s:3}, {x:9, y:6, s:3}, {x:6, y:9, s:3}, {x:9, y:9, s:3}];
const subRect_10_19_14_0 = [{x:0, y:0, s:7}, {x:0, y:7, s:7}, {x:7, y:0, s:6}, {x:13, y:0, s:6}, {x:7, y:6, s:4}, {x:11, y:6, s:4}, {x:15, y:6, s:4}, {x:7, y:10, s:4}, {x:11, y:10, s:4}, {x:15, y:10, s:4}];
const subRect_10_07_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:6, y:3, s:1}, {x:6, y:4, s:1}];
const subRect_10_17_12_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:4}, {x:13, y:0, s:4}, {x:9, y:4, s:4}, {x:13, y:4, s:4}, {x:9, y:8, s:4}, {x:13, y:8, s:4}, {x:0, y:9, s:3}, {x:3, y:9, s:3}, {x:6, y:9, s:3}];
const subRect_10_20_14_0 = [{x:5, y:0,s:10}, {x:0, y:0, s:5}, {x:0, y:5, s:5}, {x:15, y:0, s:5}, {x:15, y:5, s:5}, {x:0, y:10, s:4}, {x:4, y:10, s:4}, {x:8, y:10, s:4}, {x:12, y:10, s:4}, {x:16, y:10, s:4}];
const subRect_10_06_04_0 = [{x:2, y:0, s:3}, {x:0, y:0, s:2}, {x:0, y:2, s:2}, {x:5, y:0, s:1}, {x:5, y:1, s:1}, {x:5, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_10_10_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:6, y:4, s:2}, {x:8, y:4, s:2}];
const subRect_10_17_10_0 = [{x:5, y:0, s:6}, {x:0, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:6, s:4}, {x:9, y:6, s:4}, {x:13, y:6, s:4}, {x:11, y:0, s:3}, {x:14, y:0, s:3}, {x:11, y:3, s:3}, {x:14, y:3, s:3}];
const subRect_10_17_10_1 = [{x:0, y:0, s:6}, {x:11, y:0, s:6}, {x:6, y:0, s:5}, {x:6, y:5, s:5}, {x:0, y:6, s:4}, {x:13, y:6, s:4}, {x:4, y:6, s:2}, {x:4, y:8, s:2}, {x:11, y:6, s:2}, {x:11, y:8, s:2}];
const subRect_10_12_07_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:8, y:2, s:2}, {x:10, y:2, s:2}];
const subRect_10_07_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:6, y:3, s:1}];
const subRect_10_06_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}];
const subRect_10_08_04_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:2}, {x:6, y:2, s:2}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_10_12_06_0 = [{x:0, y:0, s:4}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:4, y:0, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}];
const subRect_10_09_04_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:3, y:2, s:2}, {x:5, y:2, s:2}, {x:7, y:2, s:2}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}];
const subRect_10_07_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}];
const subRect_10_14_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:3}, {x:11, y:0, s:3}, {x:8, y:3, s:3}, {x:11, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}];
const subRect_10_19_08_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:4}, {x:15, y:4, s:4}, {x:0, y:5, s:3}, {x:3, y:5, s:3}, {x:6, y:5, s:3}, {x:9, y:5, s:3}, {x:12, y:5, s:3}];
const subRect_10_12_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:8, y:3, s:2}, {x:10, y:3, s:2}];
const subRect_10_05_02_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}];
const subRect_10_08_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:1}, {x:7, y:1, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}];
const subRect_10_09_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}];
const subRect_10_08_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}];
const subRect_10_11_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}];
const subRect_10_14_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}];
const subRect_10_17_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:1}, {x:16, y:1, s:1}];
const subRect_10_10_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}];

const layout10 =
[
	{xd:4, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_10_04_04_0},
	{xd:5, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_10_05_05_0},
	{xd:16, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_10_16_15_0},
	{xd:15, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_10_15_14_0},
	{xd:14, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_10_14_13_0},
	{xd:26, yd:24, full:true,  lovely:true,  flipped:true,  w:subRect_10_26_24_0},
	{xd:12, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_10_12_11_0},
	{xd:7, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_10_07_06_0},
	{xd:15, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_10_15_12_0},
	{xd:8, yd:6, full:false, lovely:true,  flipped:false, w:subRect_10_08_06_0},
	{xd:16, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_10_16_12_0},
	{xd:19, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_10_19_14_0},
	{xd:7, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_10_07_05_0},
	{xd:17, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_10_17_12_0},
	{xd:20, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_10_20_14_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_10_06_04_0},
	{xd:10, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_10_10_06_0},
	{xd:17, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_10_17_10_0},
	{xd:17, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_10_17_10_1},
	{xd:12, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_10_12_07_0},
	{xd:7, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_10_07_04_0},
	{xd:6, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_10_06_03_0},
	{xd:8, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_10_08_04_0},
	{xd:12, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_10_12_06_0},
	{xd:9, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_10_09_04_0},
	{xd:7, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_10_07_03_0},
	{xd:14, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_10_14_06_0},
	{xd:19, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_10_19_08_0},
	{xd:12, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_10_12_05_0},
	{xd:5, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_10_05_02_0},
	{xd:8, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_10_08_03_0},
	{xd:9, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_10_09_03_0},
	{xd:8, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_10_08_02_0},
	{xd:11, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_10_11_02_0},
	{xd:14, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_10_14_02_0},
	{xd:17, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_10_17_02_0},
	{xd:10, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_10_10_01_0}
];

/* 11 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10     */
const subRect_11_05_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:2}, {x:0, y:3, s:2}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}];
const subRect_11_06_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:0, y:5, s:1}, {x:1, y:5, s:1}, {x:2, y:5, s:1}, {x:3, y:5, s:1}, {x:4, y:5, s:1}, {x:5, y:5, s:1}];
const subRect_11_08_08_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:0, s:2}, {x:6, y:2, s:2}, {x:6, y:4, s:2}, {x:0, y:6, s:2}, {x:2, y:6, s:2}, {x:4, y:6, s:2}, {x:6, y:6, s:2}];
const subRect_11_08_08_1 = [{x:2, y:2, s:4}, {x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:0, y:2, s:2}, {x:0, y:4, s:2}, {x:6, y:2, s:2}, {x:6, y:4, s:2}, {x:1, y:6, s:2}, {x:3, y:6, s:2}, {x:5, y:6, s:2}];
const subRect_11_09_09_0 = [{x:0, y:0, s:4}, {x:6, y:0, s:3}, {x:6, y:3, s:3}, {x:0, y:6, s:3}, {x:3, y:6, s:3}, {x:6, y:6, s:3}, {x:4, y:0, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}];
const subRect_11_10_10_0 = [{x:0, y:0, s:4}, {x:6, y:0, s:4}, {x:0, y:6, s:4}, {x:4, y:4, s:3}, {x:7, y:4, s:3}, {x:4, y:7, s:3}, {x:7, y:7, s:3}, {x:4, y:0, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}];
const subRect_11_17_15_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:6, s:6}, {x:12, y:0, s:5}, {x:12, y:5, s:5}, {x:12, y:10, s:5}, {x:0, y:12, s:3}, {x:3, y:12, s:3}, {x:6, y:12, s:3}, {x:9, y:12, s:3}];
const subRect_11_15_13_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:5, s:5}, {x:0, y:10, s:3}, {x:3, y:10, s:3}, {x:6, y:10, s:3}, {x:9, y:10, s:3}, {x:12, y:10, s:3}];
const subRect_11_14_12_0 = [{x:0, y:3, s:6}, {x:6, y:0, s:4}, {x:10, y:0, s:4}, {x:6, y:4, s:4}, {x:10, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:8, s:4}, {x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:9, s:3}, {x:3, y:9, s:3}];
const subRect_11_25_21_0 = [{x:0, y:6, s:9}, {x:9, y:6, s:9}, {x:18, y:0, s:7}, {x:18, y:7, s:7}, {x:18, y:14, s:7}, {x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:6}, {x:0, y:15, s:6}, {x:6, y:15, s:6}, {x:12, y:15, s:6}];
const subRect_11_06_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:2, y:3, s:2}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}];
const subRect_11_12_10_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:0, y:7, s:3}, {x:3, y:7, s:3}, {x:6, y:7, s:3}, {x:9, y:7, s:3}];
const subRect_11_05_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:2}, {x:4, y:0, s:1}, {x:4, y:1, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}];
const subRect_11_08_06_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:1, y:2, s:2}, {x:3, y:2, s:2}, {x:5, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}];
const subRect_11_09_06_0 = [{x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:3, y:2, s:2}, {x:5, y:2, s:2}, {x:7, y:2, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}, {x:7, y:4, s:2}];
const subRect_11_19_12_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:6, s:6}, {x:12, y:0, s:4}, {x:12, y:4, s:4}, {x:12, y:8, s:4}, {x:16, y:0, s:3}, {x:16, y:3, s:3}, {x:16, y:6, s:3}, {x:16, y:9, s:3}];
const subRect_11_14_08_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:4, s:4}, {x:8, y:0, s:3}, {x:11, y:0, s:3}, {x:8, y:5, s:3}, {x:11, y:5, s:3}, {x:8, y:3, s:2}, {x:10, y:3, s:2}, {x:12, y:3, s:2}];
const subRect_11_11_06_0 = [{x:3, y:0, s:4}, {x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:7, y:0, s:2}, {x:9, y:0, s:2}, {x:7, y:2, s:2}, {x:9, y:2, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}, {x:7, y:4, s:2}, {x:9, y:4, s:2}];
const subRect_11_28_15_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:9}, {x:0, y:9, s:6}, {x:6, y:9, s:6}, {x:12, y:9, s:6}, {x:18, y:0, s:5}, {x:23, y:0, s:5}, {x:18, y:5, s:5}, {x:23, y:5, s:5}, {x:18, y:10, s:5}, {x:23, y:10, s:5}];
const subRect_11_08_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:6, y:3, s:1}, {x:7, y:3, s:1}];
const subRect_11_13_06_0 = [{x:3, y:0, s:4}, {x:7, y:0, s:4}, {x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:11, y:0, s:2}, {x:11, y:2, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}, {x:7, y:4, s:2}, {x:9, y:4, s:2}, {x:11, y:4, s:2}];
const subRect_11_14_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:0, s:2}, {x:12, y:2, s:2}, {x:12, y:4, s:2}];
const subRect_11_15_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:3}, {x:12, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}, {x:8, y:4, s:2}, {x:10, y:4, s:2}];
const subRect_11_28_11_0 = [{x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:14, y:0, s:7}, {x:21, y:0, s:7}, {x:0, y:7, s:4}, {x:4, y:7, s:4}, {x:8, y:7, s:4}, {x:12, y:7, s:4}, {x:16, y:7, s:4}, {x:20, y:7, s:4}, {x:24, y:7, s:4}];
const subRect_11_16_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:10, y:0, s:3}, {x:13, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:10, y:3, s:3}, {x:13, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}];
const subRect_11_16_06_1 = [{x:0, y:0, s:6}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:12, y:2, s:2}, {x:14, y:2, s:2}, {x:12, y:4, s:2}, {x:14, y:4, s:2}];
const subRect_11_27_10_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:5}, {x:17, y:0, s:5}, {x:22, y:0, s:5}, {x:12, y:5, s:5}, {x:17, y:5, s:5}, {x:22, y:5, s:5}, {x:0, y:6, s:4}, {x:4, y:6, s:4}, {x:8, y:6, s:4}];
const subRect_11_30_11_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:6}, {x:18, y:0, s:6}, {x:24, y:0, s:6}, {x:0, y:6, s:5}, {x:5, y:6, s:5}, {x:10, y:6, s:5}, {x:15, y:6, s:5}, {x:20, y:6, s:5}, {x:25, y:6, s:5}];
const subRect_11_09_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}];
const subRect_11_07_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}];
const subRect_11_10_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}];
const subRect_11_13_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}, {x:12, y:1, s:1}];
const subRect_11_16_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:1}, {x:15, y:0, s:1}, {x:14, y:1, s:1}, {x:15, y:1, s:1}];
const subRect_11_19_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:1}, {x:18, y:1, s:1}];
const subRect_11_11_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}];

const layout11 =
[
	{xd:5, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_11_05_05_0},
	{xd:6, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_06_06_0},
	{xd:8, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_11_08_08_0},
	{xd:8, yd:8, full:false, lovely:true,  flipped:true,  w:subRect_11_08_08_1},
	{xd:9, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_11_09_09_0},
	{xd:10, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_11_10_10_0},
	{xd:17, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_11_17_15_0},
	{xd:15, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_11_15_13_0},
	{xd:14, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_11_14_12_0},
	{xd:25, yd:21, full:true,  lovely:true,  flipped:true,  w:subRect_11_25_21_0},
	{xd:6, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_11_06_05_0},
	{xd:12, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_11_12_10_0},
	{xd:5, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_11_05_04_0},
	{xd:8, yd:6, full:false, lovely:true,  flipped:false, w:subRect_11_08_06_0},
	{xd:9, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_09_06_0},
	{xd:19, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_11_19_12_0},
	{xd:14, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_11_14_08_0},
	{xd:11, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_11_06_0},
	{xd:28, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_11_28_15_0},
	{xd:8, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_11_08_04_0},
	{xd:13, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_13_06_0},
	{xd:14, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_14_06_0},
	{xd:15, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_15_06_0},
	{xd:28, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_11_28_11_0},
	{xd:16, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_16_06_0},
	{xd:16, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_11_16_06_1},
	{xd:27, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_11_27_10_0},
	{xd:30, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_11_30_11_0},
	{xd:9, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_11_09_03_0},
	{xd:7, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_11_07_02_0},
	{xd:10, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_11_10_02_0},
	{xd:13, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_11_13_02_0},
	{xd:16, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_11_16_02_0},
	{xd:19, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_11_19_02_0},
	{xd:11, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_11_11_01_0}
];

/* 12 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10            11     */
const subRect_12_04_04_0 = [{x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}];
const subRect_12_06_06_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}];
const subRect_12_06_06_1 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}, {x:3, y:5, s:1}, {x:4, y:5, s:1}, {x:5, y:5, s:1}];
const subRect_12_07_07_0 = [{x:0, y:0, s:3}, {x:4, y:4, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:5, y:2, s:2}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:0, y:5, s:2}, {x:2, y:5, s:2}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:4, y:3, s:1}];
const subRect_12_21_20_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:0, y:8, s:8}, {x:8, y:8, s:8}, {x:16, y:0, s:5}, {x:16, y:5, s:5}, {x:16, y:10, s:5}, {x:16, y:15, s:5}, {x:0, y:16, s:4}, {x:4, y:16, s:4}, {x:8, y:16, s:4}, {x:12, y:16, s:4}];
const subRect_12_15_14_0 = [{x:0, y:5, s:6}, {x:6, y:5, s:6}, {x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:12, y:5, s:3}, {x:12, y:8, s:3}, {x:0, y:11, s:3}, {x:3, y:11, s:3}, {x:6, y:11, s:3}, {x:9, y:11, s:3}, {x:12, y:11, s:3}];
const subRect_12_13_12_0 = [{x:4, y:3, s:6}, {x:0, y:0, s:4}, {x:0, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:10, y:0, s:3}, {x:10, y:3, s:3}, {x:10, y:6, s:3}, {x:4, y:9, s:3}, {x:7, y:9, s:3}, {x:10, y:9, s:3}];
const subRect_12_31_28_0 = [{x:0, y:8,s:12}, {x:12, y:8,s:12}, {x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:0, y:20, s:8}, {x:8, y:20, s:8}, {x:16, y:20, s:8}, {x:24, y:0, s:7}, {x:24, y:7, s:7}, {x:24, y:14, s:7}, {x:24, y:21, s:7}];
const subRect_12_10_09_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:2}, {x:2, y:5, s:2}, {x:4, y:5, s:2}, {x:6, y:5, s:2}, {x:8, y:5, s:2}, {x:0, y:7, s:2}, {x:2, y:7, s:2}, {x:4, y:7, s:2}, {x:6, y:7, s:2}, {x:8, y:7, s:2}];
const subRect_12_20_18_0 = [{x:0, y:0, s:8}, {x:12, y:0, s:8}, {x:0, y:8, s:5}, {x:5, y:8, s:5}, {x:10, y:8, s:5}, {x:15, y:8, s:5}, {x:0, y:13, s:5}, {x:5, y:13, s:5}, {x:10, y:13, s:5}, {x:15, y:13, s:5}, {x:8, y:0, s:4}, {x:8, y:4, s:4}];
const subRect_12_08_07_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:2, y:4, s:3}, {x:5, y:4, s:3}, {x:6, y:0, s:2}, {x:6, y:2, s:2}, {x:0, y:3, s:2}, {x:0, y:5, s:2}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_12_06_05_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}];
const subRect_12_05_04_0 = [{x:1, y:0, s:3}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:0, y:2, s:1}, {x:4, y:0, s:1}, {x:4, y:1, s:1}, {x:4, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}];
const subRect_12_10_08_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:0, y:6, s:2}, {x:2, y:6, s:2}, {x:4, y:6, s:2}, {x:6, y:6, s:2}, {x:8, y:6, s:2}];
const subRect_12_04_03_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}];
const subRect_12_17_12_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:0, s:4}, {x:10, y:0, s:4}, {x:6, y:4, s:4}, {x:10, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:8, s:4}, {x:14, y:0, s:3}, {x:14, y:3, s:3}, {x:14, y:6, s:3}, {x:14, y:9, s:3}];
const subRect_12_06_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_12_35_22_0 = [{x:0, y:0,s:11}, {x:0, y:11,s:11}, {x:11, y:0, s:8}, {x:19, y:0, s:8}, {x:27, y:0, s:8}, {x:11, y:14, s:8}, {x:19, y:14, s:8}, {x:27, y:14, s:8}, {x:11, y:8, s:6}, {x:17, y:8, s:6}, {x:23, y:8, s:6}, {x:29, y:8, s:6}];
const subRect_12_08_05_0 = [{x:1, y:0, s:3}, {x:4, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:0, y:2, s:1}, {x:7, y:0, s:1}, {x:7, y:1, s:1}, {x:7, y:2, s:1}];
const subRect_12_05_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}];
const subRect_12_07_04_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:6, y:3, s:1}];
const subRect_12_18_10_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:0, s:4}, {x:14, y:0, s:4}, {x:10, y:6, s:4}, {x:14, y:6, s:4}, {x:10, y:4, s:2}, {x:12, y:4, s:2}, {x:14, y:4, s:2}, {x:16, y:4, s:2}];
const subRect_12_22_12_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:6, s:6}, {x:18, y:0, s:4}, {x:18, y:4, s:4}, {x:18, y:8, s:4}, {x:12, y:6, s:3}, {x:15, y:6, s:3}, {x:12, y:9, s:3}, {x:15, y:9, s:3}];
const subRect_12_26_14_0 = [{x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:0, y:7, s:7}, {x:7, y:7, s:7}, {x:14, y:4, s:6}, {x:20, y:4, s:6}, {x:14, y:0, s:4}, {x:18, y:0, s:4}, {x:22, y:0, s:4}, {x:14, y:10, s:4}, {x:18, y:10, s:4}, {x:22, y:10, s:4}];
const subRect_12_06_03_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:5, y:0, s:1}, {x:5, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}];
const subRect_12_13_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:0, s:2}, {x:11, y:0, s:2}, {x:9, y:2, s:2}, {x:11, y:2, s:2}, {x:9, y:4, s:2}, {x:11, y:4, s:2}];
const subRect_12_33_15_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:0, y:8, s:7}, {x:7, y:8, s:7}, {x:14, y:8, s:7}, {x:21, y:8, s:7}, {x:28, y:0, s:5}, {x:28, y:5, s:5}, {x:28, y:10, s:5}, {x:24, y:0, s:4}, {x:24, y:4, s:4}];
const subRect_12_40_18_0 = [{x:5, y:0,s:10}, {x:15, y:0,s:10}, {x:25, y:0,s:10}, {x:0, y:10, s:8}, {x:8, y:10, s:8}, {x:16, y:10, s:8}, {x:24, y:10, s:8}, {x:32, y:10, s:8}, {x:0, y:0, s:5}, {x:0, y:5, s:5}, {x:35, y:0, s:5}, {x:35, y:5, s:5}];
const subRect_12_09_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:0, s:1}, {x:8, y:1, s:1}, {x:8, y:2, s:1}, {x:8, y:3, s:1}];
const subRect_12_09_04_1 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:6, y:3, s:1}, {x:7, y:3, s:1}, {x:8, y:3, s:1}];
const subRect_12_07_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}];
const subRect_12_23_09_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:5}, {x:0, y:5, s:4}, {x:4, y:5, s:4}, {x:8, y:5, s:4}, {x:12, y:5, s:4}, {x:16, y:5, s:4}, {x:20, y:0, s:3}, {x:20, y:3, s:3}, {x:20, y:6, s:3}];
const subRect_12_18_07_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:12, y:4, s:3}, {x:15, y:4, s:3}, {x:16, y:0, s:2}, {x:16, y:2, s:2}];
const subRect_12_08_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}];
const subRect_12_17_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:3}, {x:11, y:0, s:3}, {x:14, y:0, s:3}, {x:8, y:3, s:3}, {x:11, y:3, s:3}, {x:14, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}];
const subRect_12_23_08_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:4}, {x:19, y:0, s:4}, {x:15, y:4, s:4}, {x:19, y:4, s:4}, {x:0, y:5, s:3}, {x:3, y:5, s:3}, {x:6, y:5, s:3}, {x:9, y:5, s:3}, {x:12, y:5, s:3}];
const subRect_12_26_09_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:5}, {x:11, y:0, s:5}, {x:16, y:0, s:5}, {x:21, y:0, s:5}, {x:6, y:5, s:4}, {x:10, y:5, s:4}, {x:14, y:5, s:4}, {x:18, y:5, s:4}, {x:22, y:5, s:4}, {x:0, y:6, s:3}, {x:3, y:6, s:3}];
const subRect_12_29_10_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:6}, {x:18, y:0, s:6}, {x:24, y:0, s:5}, {x:24, y:5, s:5}, {x:0, y:6, s:4}, {x:4, y:6, s:4}, {x:8, y:6, s:4}, {x:12, y:6, s:4}, {x:16, y:6, s:4}, {x:20, y:6, s:4}];
const subRect_12_35_12_0 = [{x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:14, y:0, s:7}, {x:21, y:0, s:7}, {x:28, y:0, s:7}, {x:0, y:7, s:5}, {x:5, y:7, s:5}, {x:10, y:7, s:5}, {x:15, y:7, s:5}, {x:20, y:7, s:5}, {x:25, y:7, s:5}, {x:30, y:7, s:5}];
const subRect_12_06_02_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}];
const subRect_12_09_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}];
const subRect_12_12_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}];
const subRect_12_15_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}, {x:14, y:1, s:1}];
const subRect_12_18_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:1}, {x:17, y:0, s:1}, {x:16, y:1, s:1}, {x:17, y:1, s:1}];
const subRect_12_21_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:1}, {x:20, y:1, s:1}];
const subRect_12_12_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}];

const layout12 =
[
	{xd:4, yd:4, full:false, lovely:true,  flipped:true,  w:subRect_12_04_04_0},
	{xd:6, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_06_0},
	{xd:6, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_06_1},
	{xd:7, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_12_07_07_0},
	{xd:21, yd:20, full:true,  lovely:true,  flipped:true,  w:subRect_12_21_20_0},
	{xd:15, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_12_15_14_0},
	{xd:13, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_12_13_12_0},
	{xd:31, yd:28, full:true,  lovely:true,  flipped:true,  w:subRect_12_31_28_0},
	{xd:10, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_12_10_09_0},
	{xd:20, yd:18, full:true,  lovely:true,  flipped:true,  w:subRect_12_20_18_0},
	{xd:8, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_12_08_07_0},
	{xd:6, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_05_0},
	{xd:5, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_12_05_04_0},
	{xd:10, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_12_10_08_0},
	{xd:4, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_12_04_03_0},
	{xd:17, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_12_17_12_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_04_0},
	{xd:35, yd:22, full:true,  lovely:true,  flipped:true,  w:subRect_12_35_22_0},
	{xd:8, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_12_08_05_0},
	{xd:5, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_12_05_03_0},
	{xd:7, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_12_07_04_0},
	{xd:18, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_12_18_10_0},
	{xd:22, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_12_22_12_0},
	{xd:26, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_12_26_14_0},
	{xd:6, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_03_0},
	{xd:13, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_12_13_06_0},
	{xd:33, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_12_33_15_0},
	{xd:40, yd:18, full:true,  lovely:true,  flipped:true,  w:subRect_12_40_18_0},
	{xd:9, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_12_09_04_0},
	{xd:9, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_12_09_04_1},
	{xd:7, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_12_07_03_0},
	{xd:23, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_12_23_09_0},
	{xd:18, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_12_18_07_0},
	{xd:8, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_12_08_03_0},
	{xd:17, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_12_17_06_0},
	{xd:23, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_12_23_08_0},
	{xd:26, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_12_26_09_0},
	{xd:29, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_12_29_10_0},
	{xd:35, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_12_35_12_0},
	{xd:6, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_06_02_0},
	{xd:9, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_09_02_0},
	{xd:12, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_12_02_0},
	{xd:15, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_15_02_0},
	{xd:18, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_18_02_0},
	{xd:21, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_12_21_02_0},
	{xd:12, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_12_12_01_0}
];

/* 13 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10            11            12     */
const subRect_13_04_04_0 = [{x:1, y:1, s:2}, {x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:0, y:1, s:1}, {x:0, y:2, s:1}, {x:3, y:1, s:1}, {x:3, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}];
const subRect_13_05_05_0 = [{x:0, y:0, s:2}, {x:3, y:0, s:2}, {x:0, y:3, s:2}, {x:3, y:3, s:2}, {x:2, y:0, s:1}, {x:2, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:2, y:3, s:1}, {x:2, y:4, s:1}];
const subRect_13_15_12_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:4, s:4}, {x:8, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:8, s:4}, {x:8, y:8, s:4}, {x:12, y:0, s:3}, {x:12, y:3, s:3}, {x:12, y:6, s:3}, {x:12, y:9, s:3}];
const subRect_13_12_09_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:0, y:7, s:2}, {x:2, y:7, s:2}, {x:4, y:7, s:2}, {x:6, y:7, s:2}, {x:8, y:7, s:2}, {x:10, y:7, s:2}];
const subRect_13_16_12_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:0, s:4}, {x:6, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:0, s:3}, {x:13, y:0, s:3}, {x:10, y:3, s:3}, {x:13, y:3, s:3}, {x:10, y:6, s:3}, {x:13, y:6, s:3}, {x:10, y:9, s:3}, {x:13, y:9, s:3}];
const subRect_13_15_11_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:0, y:5, s:3}, {x:3, y:5, s:3}, {x:6, y:5, s:3}, {x:9, y:5, s:3}, {x:12, y:5, s:3}, {x:0, y:8, s:3}, {x:3, y:8, s:3}, {x:6, y:8, s:3}, {x:9, y:8, s:3}, {x:12, y:8, s:3}];
const subRect_13_20_14_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:5, s:5}, {x:15, y:5, s:5}, {x:0, y:10, s:4}, {x:4, y:10, s:4}, {x:8, y:10, s:4}, {x:12, y:10, s:4}, {x:16, y:10, s:4}];
const subRect_13_10_06_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:1, y:4, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}, {x:7, y:4, s:2}];
const subRect_13_12_07_0 = [{x:4, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:8, y:2, s:2}, {x:10, y:2, s:2}];
const subRect_13_07_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:6, y:3, s:1}];
const subRect_13_12_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:10, y:2, s:2}, {x:6, y:4, s:2}, {x:8, y:4, s:2}, {x:10, y:4, s:2}];
const subRect_13_07_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}];
const subRect_13_10_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:1}, {x:9, y:2, s:1}, {x:8, y:3, s:1}, {x:9, y:3, s:1}];
const subRect_13_17_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:3, s:3}, {x:15, y:0, s:2}, {x:15, y:2, s:2}, {x:15, y:4, s:2}];
const subRect_13_40_13_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:24, y:0, s:8}, {x:32, y:0, s:8}, {x:0, y:8, s:5}, {x:5, y:8, s:5}, {x:10, y:8, s:5}, {x:15, y:8, s:5}, {x:20, y:8, s:5}, {x:25, y:8, s:5}, {x:30, y:8, s:5}, {x:35, y:8, s:5}];
const subRect_13_42_13_0 = [{x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:14, y:0, s:7}, {x:21, y:0, s:7}, {x:28, y:0, s:7}, {x:35, y:0, s:7}, {x:0, y:7, s:6}, {x:6, y:7, s:6}, {x:12, y:7, s:6}, {x:18, y:7, s:6}, {x:24, y:7, s:6}, {x:30, y:7, s:6}, {x:36, y:7, s:6}];
const subRect_13_08_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}];
const subRect_13_11_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}];
const subRect_13_14_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}];
const subRect_13_17_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:1}, {x:15, y:0, s:1}, {x:16, y:0, s:1}, {x:14, y:1, s:1}, {x:15, y:1, s:1}, {x:16, y:1, s:1}];
const subRect_13_20_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:1}, {x:19, y:0, s:1}, {x:18, y:1, s:1}, {x:19, y:1, s:1}];
const subRect_13_23_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:1}, {x:22, y:1, s:1}];
const subRect_13_13_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}];

const layout13 =
[
	{xd:4, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_13_04_04_0},
	{xd:5, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_13_05_05_0},
	{xd:15, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_13_15_12_0},
	{xd:12, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_13_12_09_0},
	{xd:16, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_13_16_12_0},
	{xd:15, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_13_15_11_0},
	{xd:20, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_13_20_14_0},
	{xd:10, yd:6, full:false, lovely:true,  flipped:false, w:subRect_13_10_06_0},
	{xd:12, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_13_12_07_0},
	{xd:7, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_13_07_04_0},
	{xd:12, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_13_12_06_0},
	{xd:7, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_13_07_03_0},
	{xd:10, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_13_10_04_0},
	{xd:17, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_13_17_06_0},
	{xd:40, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_13_40_13_0},
	{xd:42, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_13_42_13_0},
	{xd:8, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_08_02_0},
	{xd:11, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_11_02_0},
	{xd:14, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_14_02_0},
	{xd:17, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_17_02_0},
	{xd:20, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_20_02_0},
	{xd:23, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_13_23_02_0},
	{xd:13, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_13_13_01_0}
];

/* 14 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10            11            12            13     */
const subRect_14_08_08_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}, {x:1, y:6, s:2}, {x:3, y:6, s:2}, {x:5, y:6, s:2}];
const subRect_14_08_08_1 = [{x:0, y:0, s:3}, {x:5, y:0, s:3}, {x:0, y:5, s:3}, {x:5, y:5, s:3}, {x:3, y:1, s:2}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:3, y:5, s:2}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:3, y:7, s:1}, {x:4, y:7, s:1}];
const subRect_14_09_09_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:3}, {x:0, y:6, s:3}, {x:3, y:3, s:2}, {x:5, y:3, s:2}, {x:7, y:3, s:2}, {x:3, y:5, s:2}, {x:5, y:5, s:2}, {x:7, y:5, s:2}, {x:3, y:7, s:2}, {x:5, y:7, s:2}, {x:7, y:7, s:2}];
const subRect_14_10_10_0 = [{x:0, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:4, y:6, s:2}, {x:6, y:6, s:2}, {x:8, y:6, s:2}, {x:0, y:8, s:2}, {x:2, y:8, s:2}, {x:4, y:8, s:2}, {x:6, y:8, s:2}, {x:8, y:8, s:2}];
const subRect_14_10_10_1 = [{x:2, y:2, s:6}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:0, y:4, s:2}, {x:0, y:6, s:2}, {x:8, y:2, s:2}, {x:8, y:4, s:2}, {x:8, y:6, s:2}, {x:1, y:8, s:2}, {x:3, y:8, s:2}, {x:5, y:8, s:2}, {x:7, y:8, s:2}];
const subRect_14_12_12_0 = [{x:3, y:0, s:6}, {x:0, y:6, s:4}, {x:4, y:6, s:4}, {x:8, y:6, s:4}, {x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:9, y:0, s:3}, {x:9, y:3, s:3}, {x:0, y:10, s:2}, {x:2, y:10, s:2}, {x:4, y:10, s:2}, {x:6, y:10, s:2}, {x:8, y:10, s:2}, {x:10, y:10, s:2}];
const subRect_14_20_20_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:0, y:8, s:8}, {x:8, y:8, s:6}, {x:14, y:8, s:6}, {x:8, y:14, s:6}, {x:16, y:0, s:4}, {x:16, y:4, s:4}, {x:0, y:16, s:4}, {x:4, y:16, s:4}, {x:14, y:14, s:3}, {x:17, y:14, s:3}, {x:14, y:17, s:3}, {x:17, y:17, s:3}];
const subRect_14_30_26_0 = [{x:0, y:0,s:10}, {x:10, y:0,s:10}, {x:20, y:0,s:10}, {x:5, y:10,s:10}, {x:15, y:10,s:10}, {x:0, y:20, s:6}, {x:6, y:20, s:6}, {x:12, y:20, s:6}, {x:18, y:20, s:6}, {x:24, y:20, s:6}, {x:0, y:10, s:5}, {x:0, y:15, s:5}, {x:25, y:10, s:5}, {x:25, y:15, s:5}];
const subRect_14_14_12_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:8, s:4}, {x:8, y:0, s:3}, {x:11, y:0, s:3}, {x:8, y:3, s:3}, {x:11, y:3, s:3}, {x:8, y:6, s:3}, {x:11, y:6, s:3}, {x:8, y:9, s:3}, {x:11, y:9, s:3}];
const subRect_14_12_10_0 = [{x:2, y:0, s:4}, {x:6, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:0, y:7, s:3}, {x:3, y:7, s:3}, {x:6, y:7, s:3}, {x:9, y:7, s:3}, {x:0, y:0, s:2}, {x:0, y:2, s:2}, {x:10, y:0, s:2}, {x:10, y:2, s:2}];
const subRect_14_18_15_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:5, s:5}, {x:0, y:10, s:5}, {x:5, y:10, s:5}, {x:10, y:10, s:5}, {x:15, y:0, s:3}, {x:15, y:3, s:3}, {x:15, y:6, s:3}, {x:15, y:9, s:3}, {x:15, y:12, s:3}];
const subRect_14_05_04_0 = [{x:0, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}];
const subRect_14_30_21_0 = [{x:0, y:0,s:10}, {x:10, y:0,s:10}, {x:20, y:0,s:10}, {x:0, y:10, s:6}, {x:6, y:10, s:6}, {x:12, y:10, s:6}, {x:18, y:10, s:6}, {x:24, y:10, s:6}, {x:0, y:16, s:5}, {x:5, y:16, s:5}, {x:10, y:16, s:5}, {x:15, y:16, s:5}, {x:20, y:16, s:5}, {x:25, y:16, s:5}];
const subRect_14_12_08_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:0, y:6, s:2}, {x:2, y:6, s:2}, {x:4, y:6, s:2}, {x:6, y:6, s:2}, {x:8, y:6, s:2}, {x:10, y:6, s:2}];
const subRect_14_18_12_0 = [{x:0, y:3, s:6}, {x:6, y:0, s:4}, {x:10, y:0, s:4}, {x:14, y:0, s:4}, {x:6, y:4, s:4}, {x:10, y:4, s:4}, {x:14, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:8, s:4}, {x:14, y:8, s:4}, {x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:9, s:3}, {x:3, y:9, s:3}];
const subRect_14_20_13_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:5}, {x:0, y:5, s:4}, {x:4, y:5, s:4}, {x:8, y:5, s:4}, {x:12, y:5, s:4}, {x:16, y:5, s:4}, {x:0, y:9, s:4}, {x:4, y:9, s:4}, {x:8, y:9, s:4}, {x:12, y:9, s:4}, {x:16, y:9, s:4}];
const subRect_14_19_12_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:3, s:6}, {x:15, y:0, s:4}, {x:15, y:4, s:4}, {x:15, y:8, s:4}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:12, y:3, s:3}, {x:12, y:6, s:3}, {x:6, y:9, s:3}, {x:9, y:9, s:3}, {x:12, y:9, s:3}];
const subRect_14_10_06_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:1, y:2, s:2}, {x:3, y:2, s:2}, {x:5, y:2, s:2}, {x:7, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}, {x:8, y:4, s:2}];
const subRect_14_11_06_0 = [{x:0, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:9, y:0, s:2}, {x:3, y:2, s:2}, {x:5, y:2, s:2}, {x:7, y:2, s:2}, {x:9, y:2, s:2}, {x:3, y:4, s:2}, {x:5, y:4, s:2}, {x:7, y:4, s:2}, {x:9, y:4, s:2}];
const subRect_14_30_16_0 = [{x:10, y:0,s:10}, {x:0, y:10, s:6}, {x:6, y:10, s:6}, {x:12, y:10, s:6}, {x:18, y:10, s:6}, {x:24, y:10, s:6}, {x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:20, y:0, s:5}, {x:25, y:0, s:5}, {x:20, y:5, s:5}, {x:25, y:5, s:5}];
const subRect_14_23_12_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:6, s:6}, {x:12, y:0, s:4}, {x:16, y:0, s:4}, {x:12, y:4, s:4}, {x:16, y:4, s:4}, {x:12, y:8, s:4}, {x:16, y:8, s:4}, {x:20, y:0, s:3}, {x:20, y:3, s:3}, {x:20, y:6, s:3}, {x:20, y:9, s:3}];
const subRect_14_08_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:6, y:3, s:1}, {x:7, y:3, s:1}];
const subRect_14_42_19_0 = [{x:0, y:0,s:12}, {x:12, y:0,s:12}, {x:0, y:12, s:7}, {x:7, y:12, s:7}, {x:14, y:12, s:7}, {x:21, y:12, s:7}, {x:28, y:12, s:7}, {x:35, y:12, s:7}, {x:24, y:0, s:6}, {x:30, y:0, s:6}, {x:36, y:0, s:6}, {x:24, y:6, s:6}, {x:30, y:6, s:6}, {x:36, y:6, s:6}];
const subRect_14_45_19_0 = [{x:0, y:0,s:10}, {x:10, y:0,s:10}, {x:20, y:0,s:10}, {x:0, y:10, s:9}, {x:9, y:10, s:9}, {x:18, y:10, s:9}, {x:27, y:10, s:9}, {x:36, y:10, s:9}, {x:30, y:0, s:5}, {x:35, y:0, s:5}, {x:40, y:0, s:5}, {x:30, y:5, s:5}, {x:35, y:5, s:5}, {x:40, y:5, s:5}];
const subRect_14_16_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:12, y:2, s:2}, {x:14, y:2, s:2}, {x:12, y:4, s:2}, {x:14, y:4, s:2}];
const subRect_14_11_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:10, y:0, s:1}, {x:10, y:1, s:1}, {x:10, y:2, s:1}, {x:10, y:3, s:1}];
const subRect_14_19_06_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:4}, {x:16, y:0, s:3}, {x:16, y:3, s:3}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:2}, {x:8, y:4, s:2}, {x:10, y:4, s:2}, {x:12, y:4, s:2}, {x:14, y:4, s:2}];
const subRect_14_10_03_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}, {x:9, y:2, s:1}];
const subRect_14_45_14_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:9}, {x:18, y:0, s:9}, {x:27, y:0, s:9}, {x:36, y:0, s:9}, {x:0, y:9, s:5}, {x:5, y:9, s:5}, {x:10, y:9, s:5}, {x:15, y:9, s:5}, {x:20, y:9, s:5}, {x:25, y:9, s:5}, {x:30, y:9, s:5}, {x:35, y:9, s:5}, {x:40, y:9, s:5}];
const subRect_14_24_07_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:4}, {x:16, y:0, s:4}, {x:20, y:0, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:12, y:4, s:3}, {x:15, y:4, s:3}, {x:18, y:4, s:3}, {x:21, y:4, s:3}];
const subRect_14_07_02_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}];
const subRect_14_10_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}];
const subRect_14_13_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}, {x:12, y:1, s:1}];
const subRect_14_16_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}, {x:15, y:0, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}, {x:14, y:1, s:1}, {x:15, y:1, s:1}];
const subRect_14_19_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:1}, {x:17, y:0, s:1}, {x:18, y:0, s:1}, {x:16, y:1, s:1}, {x:17, y:1, s:1}, {x:18, y:1, s:1}];
const subRect_14_22_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:1}, {x:21, y:0, s:1}, {x:20, y:1, s:1}, {x:21, y:1, s:1}];
const subRect_14_25_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:2}, {x:24, y:0, s:1}, {x:24, y:1, s:1}];
const subRect_14_14_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}];

const layout14 =
[
	{xd:8, yd:8, full:false, lovely:true,  flipped:false, w:subRect_14_08_08_0},
	{xd:8, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_14_08_08_1},
	{xd:9, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_14_09_09_0},
	{xd:10, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_14_10_10_0},
	{xd:10, yd:10, full:false, lovely:true,  flipped:true,  w:subRect_14_10_10_1},
	{xd:12, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_14_12_12_0},
	{xd:20, yd:20, full:true,  lovely:true,  flipped:true,  w:subRect_14_20_20_0},
	{xd:30, yd:26, full:true,  lovely:true,  flipped:true,  w:subRect_14_30_26_0},
	{xd:14, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_14_14_12_0},
	{xd:12, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_14_12_10_0},
	{xd:18, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_14_18_15_0},
	{xd:5, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_14_05_04_0},
	{xd:30, yd:21, full:true,  lovely:true,  flipped:true,  w:subRect_14_30_21_0},
	{xd:12, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_14_12_08_0},
	{xd:18, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_14_18_12_0},
	{xd:20, yd:13, full:true,  lovely:true,  flipped:true,  w:subRect_14_20_13_0},
	{xd:19, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_14_19_12_0},
	{xd:10, yd:6, full:false, lovely:true,  flipped:false, w:subRect_14_10_06_0},
	{xd:11, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_14_11_06_0},
	{xd:30, yd:16, full:true,  lovely:true,  flipped:true,  w:subRect_14_30_16_0},
	{xd:23, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_14_23_12_0},
	{xd:8, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_14_08_04_0},
	{xd:42, yd:19, full:true,  lovely:true,  flipped:true,  w:subRect_14_42_19_0},
	{xd:45, yd:19, full:true,  lovely:true,  flipped:true,  w:subRect_14_45_19_0},
	{xd:16, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_14_16_06_0},
	{xd:11, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_14_11_04_0},
	{xd:19, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_14_19_06_0},
	{xd:10, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_14_10_03_0},
	{xd:45, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_14_45_14_0},
	{xd:24, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_14_24_07_0},
	{xd:7, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_07_02_0},
	{xd:10, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_10_02_0},
	{xd:13, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_13_02_0},
	{xd:16, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_16_02_0},
	{xd:19, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_19_02_0},
	{xd:22, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_22_02_0},
	{xd:25, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_14_25_02_0},
	{xd:14, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_14_14_01_0}
];

/* 15 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10            11            12            13            14     */
const subRect_15_06_06_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:1, y:4, s:2}, {x:3, y:4, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:5, y:0, s:1}, {x:5, y:1, s:1}, {x:0, y:4, s:1}, {x:0, y:5, s:1}, {x:5, y:4, s:1}, {x:5, y:5, s:1}];
const subRect_15_07_07_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:0, y:5, s:2}, {x:2, y:5, s:2}, {x:4, y:5, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:6, y:3, s:1}, {x:6, y:4, s:1}, {x:6, y:5, s:1}, {x:6, y:6, s:1}];
const subRect_15_10_10_0 = [{x:2, y:2, s:6}, {x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:0, y:2, s:2}, {x:0, y:4, s:2}, {x:0, y:6, s:2}, {x:8, y:2, s:2}, {x:8, y:4, s:2}, {x:8, y:6, s:2}, {x:1, y:8, s:2}, {x:3, y:8, s:2}, {x:5, y:8, s:2}, {x:7, y:8, s:2}];
const subRect_15_11_11_0 = [{x:0, y:0, s:5}, {x:5, y:2, s:3}, {x:8, y:2, s:3}, {x:2, y:5, s:3}, {x:5, y:5, s:3}, {x:8, y:5, s:3}, {x:2, y:8, s:3}, {x:5, y:8, s:3}, {x:8, y:8, s:3}, {x:5, y:0, s:2}, {x:7, y:0, s:2}, {x:9, y:0, s:2}, {x:0, y:5, s:2}, {x:0, y:7, s:2}, {x:0, y:9, s:2}];
const subRect_15_16_16_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:0, s:5}, {x:11, y:0, s:5}, {x:6, y:5, s:5}, {x:11, y:5, s:5}, {x:0, y:12, s:4}, {x:4, y:12, s:4}, {x:8, y:12, s:4}, {x:12, y:12, s:4}, {x:6, y:10, s:2}, {x:8, y:10, s:2}, {x:10, y:10, s:2}, {x:12, y:10, s:2}, {x:14, y:10, s:2}];
const subRect_15_13_12_0 = [{x:0, y:0, s:4}, {x:0, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:0, s:3}, {x:7, y:0, s:3}, {x:10, y:0, s:3}, {x:4, y:3, s:3}, {x:7, y:3, s:3}, {x:10, y:3, s:3}, {x:4, y:6, s:3}, {x:7, y:6, s:3}, {x:10, y:6, s:3}, {x:4, y:9, s:3}, {x:7, y:9, s:3}, {x:10, y:9, s:3}];
const subRect_15_07_06_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:0, s:1}, {x:6, y:1, s:1}, {x:6, y:2, s:1}, {x:6, y:3, s:1}, {x:6, y:4, s:1}, {x:6, y:5, s:1}];
const subRect_15_06_05_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:1, y:2, s:2}, {x:3, y:2, s:2}, {x:0, y:2, s:1}, {x:0, y:3, s:1}, {x:5, y:2, s:1}, {x:5, y:3, s:1}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}];
const subRect_15_10_08_0 = [{x:2, y:0, s:3}, {x:5, y:0, s:3}, {x:2, y:3, s:3}, {x:5, y:3, s:3}, {x:0, y:0, s:2}, {x:0, y:2, s:2}, {x:0, y:4, s:2}, {x:8, y:0, s:2}, {x:8, y:2, s:2}, {x:8, y:4, s:2}, {x:0, y:6, s:2}, {x:2, y:6, s:2}, {x:4, y:6, s:2}, {x:6, y:6, s:2}, {x:8, y:6, s:2}];
const subRect_15_35_27_0 = [{x:0, y:0,s:10}, {x:10, y:0,s:10}, {x:20, y:0,s:10}, {x:0, y:10,s:10}, {x:10, y:10,s:10}, {x:20, y:10,s:10}, {x:0, y:20, s:7}, {x:7, y:20, s:7}, {x:14, y:20, s:7}, {x:21, y:20, s:7}, {x:28, y:20, s:7}, {x:30, y:0, s:5}, {x:30, y:5, s:5}, {x:30, y:10, s:5}, {x:30, y:15, s:5}];
const subRect_15_08_06_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:0, y:4, s:2}, {x:2, y:4, s:2}, {x:4, y:4, s:2}, {x:6, y:4, s:1}, {x:7, y:4, s:1}, {x:6, y:5, s:1}, {x:7, y:5, s:1}];
const subRect_15_24_17_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:0, y:8, s:6}, {x:6, y:8, s:6}, {x:12, y:8, s:6}, {x:18, y:8, s:6}, {x:0, y:14, s:3}, {x:3, y:14, s:3}, {x:6, y:14, s:3}, {x:9, y:14, s:3}, {x:12, y:14, s:3}, {x:15, y:14, s:3}, {x:18, y:14, s:3}, {x:21, y:14, s:3}];
const subRect_15_06_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_15_08_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:6, y:3, s:1}, {x:7, y:3, s:1}, {x:6, y:4, s:1}, {x:7, y:4, s:1}];
const subRect_15_05_03_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}];
const subRect_15_21_12_0 = [{x:0, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:0, s:4}, {x:10, y:0, s:4}, {x:14, y:0, s:4}, {x:6, y:4, s:4}, {x:10, y:4, s:4}, {x:14, y:4, s:4}, {x:6, y:8, s:4}, {x:10, y:8, s:4}, {x:14, y:8, s:4}, {x:18, y:0, s:3}, {x:18, y:3, s:3}, {x:18, y:6, s:3}, {x:18, y:9, s:3}];
const subRect_15_09_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:2}, {x:7, y:3, s:2}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:6, y:3, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}, {x:6, y:4, s:1}];
const subRect_15_06_03_0 = [{x:2, y:0, s:2}, {x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}];
const subRect_15_22_10_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:0, s:4}, {x:14, y:0, s:4}, {x:18, y:0, s:4}, {x:10, y:4, s:3}, {x:13, y:4, s:3}, {x:16, y:4, s:3}, {x:19, y:4, s:3}, {x:10, y:7, s:3}, {x:13, y:7, s:3}, {x:16, y:7, s:3}, {x:19, y:7, s:3}];
const subRect_15_09_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:8, y:0, s:1}, {x:8, y:1, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}, {x:6, y:3, s:1}, {x:7, y:3, s:1}, {x:8, y:3, s:1}];
const subRect_15_07_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}];
const subRect_15_15_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:0, s:2}, {x:11, y:0, s:2}, {x:13, y:0, s:2}, {x:9, y:2, s:2}, {x:11, y:2, s:2}, {x:13, y:2, s:2}, {x:9, y:4, s:2}, {x:11, y:4, s:2}, {x:13, y:4, s:2}];
const subRect_15_08_03_0 = [{x:1, y:0, s:2}, {x:3, y:0, s:2}, {x:5, y:0, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:7, y:0, s:1}, {x:7, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}];
const subRect_15_09_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:1}, {x:8, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}];
const subRect_15_12_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:10, y:2, s:1}, {x:11, y:2, s:1}, {x:10, y:3, s:1}, {x:11, y:3, s:1}];
const subRect_15_10_03_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:7, y:2, s:1}, {x:8, y:2, s:1}, {x:9, y:2, s:1}];
const subRect_15_20_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:15, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:3, s:3}, {x:15, y:3, s:3}, {x:18, y:0, s:2}, {x:18, y:2, s:2}, {x:18, y:4, s:2}];
const subRect_15_18_05_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:15, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:8, y:3, s:2}, {x:10, y:3, s:2}, {x:12, y:3, s:2}, {x:14, y:3, s:2}, {x:16, y:3, s:2}];
const subRect_15_56_15_0 = [{x:0, y:0, s:8}, {x:8, y:0, s:8}, {x:16, y:0, s:8}, {x:24, y:0, s:8}, {x:32, y:0, s:8}, {x:40, y:0, s:8}, {x:48, y:0, s:8}, {x:0, y:8, s:7}, {x:7, y:8, s:7}, {x:14, y:8, s:7}, {x:21, y:8, s:7}, {x:28, y:8, s:7}, {x:35, y:8, s:7}, {x:42, y:8, s:7}, {x:49, y:8, s:7}];
const subRect_15_09_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}];
const subRect_15_12_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}];
const subRect_15_15_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}, {x:14, y:1, s:1}];
const subRect_15_18_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:1}, {x:15, y:0, s:1}, {x:16, y:0, s:1}, {x:17, y:0, s:1}, {x:14, y:1, s:1}, {x:15, y:1, s:1}, {x:16, y:1, s:1}, {x:17, y:1, s:1}];
const subRect_15_21_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:1}, {x:19, y:0, s:1}, {x:20, y:0, s:1}, {x:18, y:1, s:1}, {x:19, y:1, s:1}, {x:20, y:1, s:1}];
const subRect_15_24_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:1}, {x:23, y:0, s:1}, {x:22, y:1, s:1}, {x:23, y:1, s:1}];
const subRect_15_27_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:2}, {x:24, y:0, s:2}, {x:26, y:0, s:1}, {x:26, y:1, s:1}];
const subRect_15_15_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}];

const layout15 =
[
	{xd:6, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_15_06_06_0},
	{xd:7, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_15_07_07_0},
	{xd:10, yd:10, full:false, lovely:true,  flipped:true,  w:subRect_15_10_10_0},
	{xd:11, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_15_11_11_0},
	{xd:16, yd:16, full:true,  lovely:true,  flipped:true,  w:subRect_15_16_16_0},
	{xd:13, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_15_13_12_0},
	{xd:7, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_15_07_06_0},
	{xd:6, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_15_06_05_0},
	{xd:10, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_15_10_08_0},
	{xd:35, yd:27, full:true,  lovely:true,  flipped:true,  w:subRect_15_35_27_0},
	{xd:8, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_15_08_06_0},
	{xd:24, yd:17, full:true,  lovely:true,  flipped:true,  w:subRect_15_24_17_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_15_06_04_0},
	{xd:8, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_15_08_05_0},
	{xd:5, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_05_03_0},
	{xd:21, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_15_21_12_0},
	{xd:9, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_15_09_05_0},
	{xd:6, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_06_03_0},
	{xd:22, yd:10, full:true,  lovely:true,  flipped:true,  w:subRect_15_22_10_0},
	{xd:9, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_15_09_04_0},
	{xd:7, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_07_03_0},
	{xd:15, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_15_15_06_0},
	{xd:8, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_08_03_0},
	{xd:9, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_09_03_0},
	{xd:12, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_15_12_04_0},
	{xd:10, yd:3, full:true,  lovely:true,  flipped:true,  w:subRect_15_10_03_0},
	{xd:20, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_15_20_06_0},
	{xd:18, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_15_18_05_0},
	{xd:56, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_15_56_15_0},
	{xd:9, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_09_02_0},
	{xd:12, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_12_02_0},
	{xd:15, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_15_02_0},
	{xd:18, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_18_02_0},
	{xd:21, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_21_02_0},
	{xd:24, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_24_02_0},
	{xd:27, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_15_27_02_0},
	{xd:15, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_15_15_01_0}
];

/* 16 Participants               N xd yd #              0             1             2             3             4             5             6             7             8             9            10            11            12            13            14            15     */
const subRect_16_04_04_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}];
const subRect_16_05_05_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:2}, {x:4, y:0, s:1}, {x:4, y:1, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}];
const subRect_16_14_14_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:10, y:0, s:4}, {x:10, y:4, s:4}, {x:0, y:10, s:4}, {x:4, y:10, s:4}, {x:10, y:8, s:2}, {x:12, y:8, s:2}, {x:8, y:10, s:2}, {x:10, y:10, s:2}, {x:12, y:10, s:2}, {x:8, y:12, s:2}, {x:10, y:12, s:2}, {x:12, y:12, s:2}];
const subRect_16_21_20_0 = [{x:5, y:4,s:12}, {x:0, y:0, s:5}, {x:0, y:5, s:5}, {x:0, y:10, s:5}, {x:0, y:15, s:5}, {x:5, y:0, s:4}, {x:9, y:0, s:4}, {x:13, y:0, s:4}, {x:17, y:0, s:4}, {x:17, y:4, s:4}, {x:17, y:8, s:4}, {x:17, y:12, s:4}, {x:5, y:16, s:4}, {x:9, y:16, s:4}, {x:13, y:16, s:4}, {x:17, y:16, s:4}];
const subRect_16_16_15_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:0, y:5, s:5}, {x:5, y:5, s:5}, {x:0, y:10, s:5}, {x:5, y:10, s:5}, {x:10, y:0, s:3}, {x:13, y:0, s:3}, {x:10, y:3, s:3}, {x:13, y:3, s:3}, {x:10, y:6, s:3}, {x:13, y:6, s:3}, {x:10, y:9, s:3}, {x:13, y:9, s:3}, {x:10, y:12, s:3}, {x:13, y:12, s:3}];
const subRect_16_12_11_0 = [{x:0, y:0, s:4}, {x:8, y:0, s:4}, {x:0, y:7, s:4}, {x:8, y:7, s:4}, {x:0, y:4, s:3}, {x:3, y:4, s:3}, {x:6, y:4, s:3}, {x:9, y:4, s:3}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:4, y:7, s:2}, {x:6, y:7, s:2}, {x:4, y:9, s:2}, {x:6, y:9, s:2}];
const subRect_16_08_07_0 = [{x:1, y:0, s:3}, {x:4, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:0, y:5, s:2}, {x:2, y:5, s:2}, {x:4, y:5, s:2}, {x:6, y:5, s:2}, {x:0, y:0, s:1}, {x:0, y:1, s:1}, {x:0, y:2, s:1}, {x:7, y:0, s:1}, {x:7, y:1, s:1}, {x:7, y:2, s:1}];
const subRect_16_05_04_0 = [{x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:0, y:2, s:1}, {x:1, y:2, s:1}, {x:2, y:2, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}];
const subRect_16_12_09_0 = [{x:2, y:2, s:4}, {x:6, y:2, s:4}, {x:0, y:6, s:3}, {x:3, y:6, s:3}, {x:6, y:6, s:3}, {x:9, y:6, s:3}, {x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:0, y:2, s:2}, {x:0, y:4, s:2}, {x:10, y:2, s:2}, {x:10, y:4, s:2}];
const subRect_16_52_37_0 = [{x:0, y:0,s:13}, {x:13, y:0,s:13}, {x:26, y:0,s:13}, {x:39, y:0,s:13}, {x:8, y:13,s:12}, {x:20, y:13,s:12}, {x:32, y:13,s:12}, {x:8, y:25,s:12}, {x:20, y:25,s:12}, {x:32, y:25,s:12}, {x:0, y:13, s:8}, {x:0, y:21, s:8}, {x:0, y:29, s:8}, {x:44, y:13, s:8}, {x:44, y:21, s:8}, {x:44, y:29, s:8}];
const subRect_16_06_04_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:3, y:2, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:0, y:3, s:1}, {x:1, y:3, s:1}, {x:2, y:3, s:1}, {x:3, y:3, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}];
const subRect_16_19_12_0 = [{x:0, y:0, s:4}, {x:4, y:0, s:4}, {x:8, y:0, s:4}, {x:12, y:0, s:4}, {x:0, y:4, s:4}, {x:4, y:4, s:4}, {x:8, y:4, s:4}, {x:12, y:4, s:4}, {x:0, y:8, s:4}, {x:4, y:8, s:4}, {x:8, y:8, s:4}, {x:12, y:8, s:4}, {x:16, y:0, s:3}, {x:16, y:3, s:3}, {x:16, y:6, s:3}, {x:16, y:9, s:3}];
const subRect_16_08_05_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:0, y:4, s:1}, {x:1, y:4, s:1}, {x:2, y:4, s:1}, {x:3, y:4, s:1}, {x:4, y:4, s:1}, {x:5, y:4, s:1}, {x:6, y:4, s:1}, {x:7, y:4, s:1}];
const subRect_16_12_07_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:0, y:3, s:2}, {x:2, y:3, s:2}, {x:4, y:3, s:2}, {x:6, y:3, s:2}, {x:8, y:3, s:2}, {x:10, y:3, s:2}, {x:0, y:5, s:2}, {x:2, y:5, s:2}, {x:4, y:5, s:2}, {x:6, y:5, s:2}, {x:8, y:5, s:2}, {x:10, y:5, s:2}];
const subRect_16_07_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:4, y:2, s:1}, {x:5, y:2, s:1}, {x:6, y:2, s:1}, {x:4, y:3, s:1}, {x:5, y:3, s:1}, {x:6, y:3, s:1}];
const subRect_16_44_25_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:9}, {x:18, y:0, s:9}, {x:27, y:0, s:9}, {x:8, y:16, s:9}, {x:17, y:16, s:9}, {x:26, y:16, s:9}, {x:35, y:16, s:9}, {x:36, y:0, s:8}, {x:36, y:8, s:8}, {x:0, y:9, s:8}, {x:0, y:17, s:8}, {x:8, y:9, s:7}, {x:15, y:9, s:7}, {x:22, y:9, s:7}, {x:29, y:9, s:7}];
const subRect_16_30_17_0 = [{x:0, y:0, s:6}, {x:6, y:0, s:6}, {x:12, y:0, s:6}, {x:18, y:0, s:6}, {x:24, y:0, s:6}, {x:0, y:6, s:6}, {x:6, y:6, s:6}, {x:12, y:6, s:6}, {x:18, y:6, s:6}, {x:24, y:6, s:6}, {x:0, y:12, s:5}, {x:5, y:12, s:5}, {x:10, y:12, s:5}, {x:15, y:12, s:5}, {x:20, y:12, s:5}, {x:25, y:12, s:5}];
const subRect_16_10_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:8, y:2, s:1}, {x:9, y:2, s:1}, {x:8, y:3, s:1}, {x:9, y:3, s:1}];
const subRect_16_40_14_0 = [{x:0, y:0, s:7}, {x:7, y:0, s:7}, {x:14, y:0, s:7}, {x:21, y:0, s:7}, {x:0, y:7, s:7}, {x:7, y:7, s:7}, {x:14, y:7, s:7}, {x:21, y:7, s:7}, {x:28, y:0, s:6}, {x:34, y:0, s:6}, {x:28, y:6, s:4}, {x:32, y:6, s:4}, {x:36, y:6, s:4}, {x:28, y:10, s:4}, {x:32, y:10, s:4}, {x:36, y:10, s:4}];
const subRect_16_19_06_0 = [{x:0, y:0, s:3}, {x:3, y:0, s:3}, {x:6, y:0, s:3}, {x:9, y:0, s:3}, {x:12, y:0, s:3}, {x:0, y:3, s:3}, {x:3, y:3, s:3}, {x:6, y:3, s:3}, {x:9, y:3, s:3}, {x:12, y:3, s:3}, {x:15, y:0, s:2}, {x:17, y:0, s:2}, {x:15, y:2, s:2}, {x:17, y:2, s:2}, {x:15, y:4, s:2}, {x:17, y:4, s:2}];
const subRect_16_13_04_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:0, y:2, s:2}, {x:2, y:2, s:2}, {x:4, y:2, s:2}, {x:6, y:2, s:2}, {x:8, y:2, s:2}, {x:10, y:2, s:2}, {x:12, y:0, s:1}, {x:12, y:1, s:1}, {x:12, y:2, s:1}, {x:12, y:3, s:1}];
const subRect_16_30_08_0 = [{x:0, y:0, s:5}, {x:5, y:0, s:5}, {x:10, y:0, s:5}, {x:15, y:0, s:5}, {x:20, y:0, s:5}, {x:25, y:0, s:5}, {x:0, y:5, s:3}, {x:3, y:5, s:3}, {x:6, y:5, s:3}, {x:9, y:5, s:3}, {x:12, y:5, s:3}, {x:15, y:5, s:3}, {x:18, y:5, s:3}, {x:21, y:5, s:3}, {x:24, y:5, s:3}, {x:27, y:5, s:3}];
const subRect_16_63_16_0 = [{x:0, y:0, s:9}, {x:9, y:0, s:9}, {x:18, y:0, s:9}, {x:27, y:0, s:9}, {x:36, y:0, s:9}, {x:45, y:0, s:9}, {x:54, y:0, s:9}, {x:0, y:9, s:7}, {x:7, y:9, s:7}, {x:14, y:9, s:7}, {x:21, y:9, s:7}, {x:28, y:9, s:7}, {x:35, y:9, s:7}, {x:42, y:9, s:7}, {x:49, y:9, s:7}, {x:56, y:9, s:7}];
const subRect_16_08_02_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:0, y:1, s:1}, {x:1, y:1, s:1}, {x:2, y:1, s:1}, {x:3, y:1, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}];
const subRect_16_11_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:4, y:1, s:1}, {x:5, y:1, s:1}, {x:6, y:1, s:1}, {x:7, y:1, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}];
const subRect_16_14_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:8, y:1, s:1}, {x:9, y:1, s:1}, {x:10, y:1, s:1}, {x:11, y:1, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}];
const subRect_16_17_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}, {x:15, y:0, s:1}, {x:16, y:0, s:1}, {x:12, y:1, s:1}, {x:13, y:1, s:1}, {x:14, y:1, s:1}, {x:15, y:1, s:1}, {x:16, y:1, s:1}];
const subRect_16_20_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:1}, {x:17, y:0, s:1}, {x:18, y:0, s:1}, {x:19, y:0, s:1}, {x:16, y:1, s:1}, {x:17, y:1, s:1}, {x:18, y:1, s:1}, {x:19, y:1, s:1}];
const subRect_16_23_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:1}, {x:21, y:0, s:1}, {x:22, y:0, s:1}, {x:20, y:1, s:1}, {x:21, y:1, s:1}, {x:22, y:1, s:1}];
const subRect_16_26_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:2}, {x:24, y:0, s:1}, {x:25, y:0, s:1}, {x:24, y:1, s:1}, {x:25, y:1, s:1}];
const subRect_16_29_02_0 = [{x:0, y:0, s:2}, {x:2, y:0, s:2}, {x:4, y:0, s:2}, {x:6, y:0, s:2}, {x:8, y:0, s:2}, {x:10, y:0, s:2}, {x:12, y:0, s:2}, {x:14, y:0, s:2}, {x:16, y:0, s:2}, {x:18, y:0, s:2}, {x:20, y:0, s:2}, {x:22, y:0, s:2}, {x:24, y:0, s:2}, {x:26, y:0, s:2}, {x:28, y:0, s:1}, {x:28, y:1, s:1}];
const subRect_16_16_01_0 = [{x:0, y:0, s:1}, {x:1, y:0, s:1}, {x:2, y:0, s:1}, {x:3, y:0, s:1}, {x:4, y:0, s:1}, {x:5, y:0, s:1}, {x:6, y:0, s:1}, {x:7, y:0, s:1}, {x:8, y:0, s:1}, {x:9, y:0, s:1}, {x:10, y:0, s:1}, {x:11, y:0, s:1}, {x:12, y:0, s:1}, {x:13, y:0, s:1}, {x:14, y:0, s:1}, {x:15, y:0, s:1}];

const layout16 =
[
	{xd:4, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_16_04_04_0},
	{xd:5, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_16_05_05_0},
	{xd:14, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_16_14_14_0},
	{xd:21, yd:20, full:true,  lovely:true,  flipped:true,  w:subRect_16_21_20_0},
	{xd:16, yd:15, full:true,  lovely:true,  flipped:true,  w:subRect_16_16_15_0},
	{xd:12, yd:11, full:true,  lovely:true,  flipped:true,  w:subRect_16_12_11_0},
	{xd:8, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_16_08_07_0},
	{xd:5, yd:4, full:false, lovely:true,  flipped:true,  w:subRect_16_05_04_0},
	{xd:12, yd:9, full:true,  lovely:true,  flipped:true,  w:subRect_16_12_09_0},
	{xd:52, yd:37, full:true,  lovely:true,  flipped:true,  w:subRect_16_52_37_0},
	{xd:6, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_16_06_04_0},
	{xd:19, yd:12, full:true,  lovely:true,  flipped:true,  w:subRect_16_19_12_0},
	{xd:8, yd:5, full:true,  lovely:true,  flipped:true,  w:subRect_16_08_05_0},
	{xd:12, yd:7, full:true,  lovely:true,  flipped:true,  w:subRect_16_12_07_0},
	{xd:7, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_16_07_04_0},
	{xd:44, yd:25, full:true,  lovely:true,  flipped:true,  w:subRect_16_44_25_0},
	{xd:30, yd:17, full:true,  lovely:true,  flipped:true,  w:subRect_16_30_17_0},
	{xd:10, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_16_10_04_0},
	{xd:40, yd:14, full:true,  lovely:true,  flipped:true,  w:subRect_16_40_14_0},
	{xd:19, yd:6, full:true,  lovely:true,  flipped:true,  w:subRect_16_19_06_0},
	{xd:13, yd:4, full:true,  lovely:true,  flipped:true,  w:subRect_16_13_04_0},
	{xd:30, yd:8, full:true,  lovely:true,  flipped:true,  w:subRect_16_30_08_0},
	{xd:63, yd:16, full:true,  lovely:true,  flipped:true,  w:subRect_16_63_16_0},
	{xd:8, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_08_02_0},
	{xd:11, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_11_02_0},
	{xd:14, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_14_02_0},
	{xd:17, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_17_02_0},
	{xd:20, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_20_02_0},
	{xd:23, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_23_02_0},
	{xd:26, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_26_02_0},
	{xd:29, yd:2, full:true,  lovely:true,  flipped:true,  w:subRect_16_29_02_0},
	{xd:16, yd:1, full:true,  lovely:true,  flipped:true,  w:subRect_16_16_01_0}
];

const layoutTable =
[
	{options:null, numOptions:0},
	{options:layout1, numOptions:layout1.length},
	{options:layout2, numOptions:layout2.length},
	{options:layout3, numOptions:layout3.length},
	{options:layout4, numOptions:layout4.length},
	{options:layout5, numOptions:layout5.length},
	{options:layout6, numOptions:layout6.length},
	{options:layout7, numOptions:layout7.length},
	{options:layout8, numOptions:layout8.length},
	{options:layout9, numOptions:layout9.length},
	{options:layout10, numOptions:layout10.length},
	{options:layout11, numOptions:layout11.length},
	{options:layout12, numOptions:layout12.length},
	{options:layout13, numOptions:layout13.length},
	{options:layout14, numOptions:layout14.length},
	{options:layout15, numOptions:layout15.length},
	{options:layout16, numOptions:layout16.length},
];

function LmiRectangleConstruct(rect, x, y, width, height) {
	rect.x0 = x;
	rect.y0 = y;
	rect.x1 = x+width;
	rect.y1 = y+height;
}

function LmiRectangleDestruct(r) {
	r.x0 = r.y0 = r.x1 = r.y1 = -1;
}

function LmiRectangleGetWidth(r) {		
	return (r.x1 - r.x0);
}		

function LmiRectangleGetHeight(r) {	
	return (r.y1 - r.y0);
}		

function  LmiRectangleResizeToAspectRatio(r, width, height, letterbox) {
	if(width > 0 && height > 0)
	{
		var oldWidth = LmiRectangleGetWidth(r);
		var oldHeight = LmiRectangleGetHeight(r);

		if((oldHeight * width > oldWidth * height) == letterbox)
		{
			/* Fit width */
			var newHeight = (oldWidth * height / width);
			r.y0 = (r.y0 + r.y1 - newHeight) / 2;
			r.y1 = r.y0 + newHeight;
		}
		else
		{
			/* Fit height */
			var newWidth = (oldHeight * width / height);
			r.x0 = (r.x0 + r.x1 - newWidth) / 2;
			r.x1 = r.x0 + newWidth;
		}
	}
}

function LmiRectangleGetArea(r) {
	return LmiRectangleGetWidth(r) * LmiRectangleGetHeight(r);
}

function LmiRectangleAssign(d, s) {
	for (var k in s) {
		d[k] = s[k];
	}
}

function LmiRectangleGetLeft(r) {
	return r.x0;
}

function LmiRectangleGetTop(r) {
	return r.y0;
}

function LmiRectangleSetMinAndMaxX(r, xMin, xMax) {
	r.x0 = xMin;
	r.x1 = xMax;
}

function LmiRectangleSetMinAndMaxY(r, yMin, yMax) {
	r.y0 = yMin;
	r.y1 = yMax;
}

function LmiRectangleSetMinAndMax(r, xMin, yMin, xMax, yMax) {
	LmiRectangleSetMinAndMaxX(r, xMin, xMax);
	LmiRectangleSetMinAndMaxY(r, yMin, yMax);
}

function LmiLayoutScoreBetter(a, b) {
	if(a.equalSized != b.equalSized)
		return a.equalSized;
	if(a.filled != b.filled)
		return a.filled;
	if(a.size != b.size)
		return a.size > b.size;
	return a.area > b.area;
}


function LmiLayoutHasEqualSizes(wl, numRects, lastPreferred) {
	var firstScrub, lastRect;
	if(lastPreferred > 0 && wl.w[0].s != wl.w[lastPreferred].s)
		return false;
	firstScrub = lastPreferred + 1;
	lastRect = numRects - 1;
	if(firstScrub < lastRect && wl.w[firstScrub].s != wl.w[lastRect].s)
		return false;
	if(firstScrub < numRects && wl.w[lastPreferred].s == wl.w[firstScrub].s)
		return false;

	return true;
}

function LmiLayoutIsLovely(wl, flipped) {
	return flipped ? wl.flipped : wl.lovely;
}


function LmiLayoutMakerGetLayout(numRects, numPreferred, width, height, rects, groupRank) {
	var table = layoutTable[numRects];
	var lastPreferred = (numPreferred >= 1 && numPreferred <= numRects) ? (numPreferred - 1) : (numRects - 1);
	var minVisiblePctX = layoutMaker.minVisiblePctX;
	var minVisiblePctY = layoutMaker.minVisiblePctY;
	var aspectW = layoutMaker.aspectW;
	var aspectH = layoutMaker.aspectH;

	var isFlipped = false;
	var best = {};
	var layout = null;
	var layoutRect = {};
	var layoutFlipped = false;
	var i;

	best.equalSized = false;
	best.filled = false;
	best.size = 0;
	best.area = 0;

	LmiRectangleConstruct(layoutRect, 0, 0, 1, 1); /* dummy init to avoid silly warning */

	/* Find the layout that gives a large rectangle for the last preferred
	participant, but also consider the size of the smallest rectangle. */
	for(i=0; i<table.numOptions; ++i)
	{
		var wl = table.options[i];
		var score = {};
		var f;

		score.equalSized = layoutMaker.equalSizes && LmiLayoutHasEqualSizes(wl, numRects, lastPreferred);

		if(best.equalSized && !score.equalSized)
			continue;

		for(f=0; f<2; ++f)
		{
			var flip = f == 1;
			var layoutAspectW, layoutAspectH;
			var minLayoutAspectW, minLayoutAspectH;
			var maxLayoutAspectW, maxLayoutAspectH;
			var rect = {};
			var r;

			if(layoutMaker.strict && !LmiLayoutIsLovely(wl, flip))
				continue;

			if(isFlipped != flip)
			{
				// LmiUintSwap(&width, &height);
				var t = width;
				width = height;
				height = t;

				// LmiUintSwap(&aspectW, &aspectH);
				t = aspectW;
				aspectW = aspectH;
				aspectH = t;

				// LmiUintSwap(&minVisiblePctX, &minVisiblePctY);
				t = minVisiblePctX;
				minVisiblePctX = minVisiblePctY;
				minVisiblePctY = t;

				isFlipped = flip;
			}

			layoutAspectW = wl.xd * aspectW;
			layoutAspectH = wl.yd * aspectH;
			minLayoutAspectW = minVisiblePctX * layoutAspectW;
			minLayoutAspectH = 100 * layoutAspectH;
			maxLayoutAspectW = 100 * layoutAspectW;
			maxLayoutAspectH = minVisiblePctY * layoutAspectH;

			LmiRectangleConstruct(rect, 0, 0, width, height);

			if(width * minLayoutAspectH < height * minLayoutAspectW)
			{
				LmiRectangleResizeToAspectRatio(rect, minLayoutAspectW, minLayoutAspectH, true);
				score.filled = false;
			}
			else if(width * maxLayoutAspectH > height * maxLayoutAspectW)
			{
				LmiRectangleResizeToAspectRatio(rect, maxLayoutAspectW, maxLayoutAspectH, true);
				score.filled = false;
			}
			else
				score.filled = layoutMaker.fill && wl.full;

			r = wl.w[lastPreferred];
			score.size = (LmiRectangleGetWidth(rect) * r.s / wl.xd) * (LmiRectangleGetHeight(rect) * r.s / wl.yd);

			if(lastPreferred != numRects - 1)
			{
				r = wl.w[(numRects - 1)];
				score.size += (LmiRectangleGetWidth(rect) * r.s / wl.xd) * (LmiRectangleGetHeight(rect) * r.s / wl.yd) / 10;
			}

			score.area = LmiRectangleGetArea(rect);

			if(layout == null || LmiLayoutScoreBetter(score, best))
			{
				LmiRectangleAssign(layoutRect, rect);
				layout = wl;
				layoutFlipped = isFlipped;
				best.equalSized = score.equalSized;
				best.filled = score.filled;
				best.size = score.size;
				best.area = score.area;
			}

			LmiRectangleDestruct(rect);
		}
	}

	if(layout == null)
	{
		LmiRectangleDestruct(layoutRect);
		return false;
	}

	for(i=0; i<numRects; ++i)
	{
		var rect = rects[i];
		var r = layout.w[i];

		/* Calculate width and height using both endpoints (instead of just using r->s)
		to avoid gaps between rectangles due to integer roundoff */
		var x0 = Math.floor(LmiRectangleGetLeft(layoutRect) + r.x * LmiRectangleGetWidth(layoutRect) / layout.xd);
		var x1 = Math.floor(LmiRectangleGetLeft(layoutRect) + (r.x + r.s) * LmiRectangleGetWidth(layoutRect) / layout.xd);
		var y0 = Math.floor(LmiRectangleGetTop(layoutRect) + r.y * LmiRectangleGetHeight(layoutRect) / layout.yd);
		var y1 = Math.floor(LmiRectangleGetTop(layoutRect) + (r.y + r.s) * LmiRectangleGetHeight(layoutRect) / layout.yd);

		if(layoutFlipped)
			LmiRectangleSetMinAndMax(rect, y0, x0, y1, x1);
		else
			LmiRectangleSetMinAndMax(rect, x0, y0, x1, y1);
	}

	/**
	if(groupRank != NULL)
	{
		LmiAssert(numRects > 0);
		groupRank[0] = 0;
		for(i=1; i<numRects; ++i)
		{
			if(layout->w[i].s == layout->w[i-1].s)
				groupRank[i] = groupRank[i-1];
			else
				groupRank[i] = groupRank[i-1] + 1;
		}
	}

	**/
	LmiRectangleDestruct(layoutRect);
	return true;
}

// displayCropped can be 0, 1, 2
// 0 - do not crop
// 1 - crop
// 2 - composite renderer - crop a bit
function VidyoClientGetLayout(numRects, numPreferred, width, height, displayCropped) {
	var i = 0;
	var rects = [];
	for (i = 0; i < numRects; i++)
	{
		rects[i] = {};
		LmiRectangleConstruct(rects[i], 0, 0, 0, 0);
	}

	if (displayCropped === 0)
	{
		layoutMaker.minVisiblePctX = 100;
		layoutMaker.minVisiblePctY = 100;
	}
	else if (displayCropped === 1) 
	{
		layoutMaker.minVisiblePctX = 0;
		layoutMaker.minVisiblePctY = 0;
	}
	else if (displayCropped === 2)
	{
		layoutMaker.minVisiblePctX = MIN_VISIBLE_PCT_WIDTH;
		layoutMaker.minVisiblePctY = MIN_VISIBLE_PCT_HEIGHT;
	}

	if (numRects > 1)
	{
		LmiLayoutMakerGetLayout(numRects, numPreferred, width, height, rects, null);

		// add/subtract 2 to get borders around the tiles
		for (i = 0; i < numRects; i++)
		{
			rects[i].width = LmiRectangleGetWidth(rects[i]) - 2;
			rects[i].height = LmiRectangleGetHeight(rects[i]) - 2;
			rects[i].x = rects[i].x0 + 2;
			rects[i].y = rects[i].y0 + 2;
		}
	}
	else
	{
		rects[0].width = width;
		rects[0].height = height;
		rects[0].x = 0;
		rects[0].y = 0;
	}

	return rects;
}

function VidyoClientResizeToAspectRatio(attr, iw, ih) {
	var r = {};
	LmiRectangleConstruct(r, attr.x, attr.y, attr.width, attr.height);

	var w = LmiRectangleGetWidth(r), h = LmiRectangleGetHeight(r);
	var minW, minH;

	// minW = iw * (100 - ct->maxCropPctW);
	minW = iw * layoutMaker.minVisiblePctX;
	minH = ih * 100;

	if(w * minH < h * minW)
		LmiRectangleResizeToAspectRatio(r, minW, minH, true);
	else
	{
		var maxW = iw * 100;
		// var maxH = ih * (100 - ct->maxCropPctH);
		var maxH = ih * layoutMaker.minVisiblePctY;
		if(w * maxH > h * maxW)
			LmiRectangleResizeToAspectRatio(r, maxW, maxH, true);
	}
	attr.width = LmiRectangleGetWidth(r);
	attr.height = LmiRectangleGetHeight(r);
	attr.x = r.x0;
	attr.y = r.y0;
}


function StopStream (streams, stopAudio, stopVideo) {
    for (var i = 0; i < streams.length; i++) {
        if (!streams[i]) {
            continue;
        }
        var audioTracks = streams[i].getAudioTracks();
        var videoTracks = streams[i].getVideoTracks();

        if (stopAudio) {
            for (var j = 0; j < audioTracks.length; j++) {
                audioTracks[j].stop();
            }
        }

        if (stopVideo) {
            for (var j = 0; j < videoTracks.length; j++) {
                videoTracks[j].stop();
            }
        }
    }
};

function GetTimeForLogging() {
    return new Date().toLocaleTimeString();
};



function VidyoInputDevice(type, startCallback, stopCallback) { // type can be "AUDIO" or "VIDEO"
    var id_ = "";
    var pendingId_ = "";
    var constraints_ = null;
    var logLevel = (VCUtils.params && VCUtils.params.webrtcLogLevel) ? VCUtils.params.webrtcLogLevel : "info";

    function LogInfo (msg) {
        if (logLevel === "info") {
            console.log("" + GetTimeForLogging() + " VidyoDevice[" + type + "]: " + msg);
        }
    };


    function LogErr (msg) {
        if (logLevel === "info" || logLevel === "error") {
            console.error("" + GetTimeForLogging() + " VidyoDevice: " + msg);
        }
    };


    const DEVICE_STATE_IDLE = "DEVICE_IDLE";
    const DEVICE_STATE_STARTING = "DEVICE_STARTING";
    const DEVICE_STATE_STARTED = "DEVICE_STARTED";
    const DEVICE_STATE_STOP_PENDING = "DEVICE_STOP_PENDING"; // while starting/start pending, stop comes
    const DEVICE_STATE_START_PENDING = "DEVICE_START_PENDING"; // while in stop pending, start comes


    /*************************

          IDLE ---------------------
         |    \                    |
         |     \                   |
         |      STARTING ------STOP_PENDING
         |      /     |             |
         |     /      |             |
         |    /       |             |
        STARTED       |---------START_PENDING

    **************************/

    var stream_ = null;
    var state_ = DEVICE_STATE_IDLE;

    function noop(currentState, nextState, op) {
        LogInfo("NO-OP [" + op + "] Curr:" + currentState + " Next:" + nextState);
    };

    function startDevice(currentState, nextState, op) {
        if (stream_ !== null) {
            StopStream([stream_], type === "AUDIO", type === "VIDEO");
            stream_ = null;
        }

        if (type === "VIDEO") {
            constraints_.video.deviceId = id_;
        } else {
            constraints_.audio.deviceId = id_;
        }

        navigator.mediaDevices.getUserMedia(constraints_).
        then(function(str) {
            stream_ = str;
            InvokeStateMachine("deviceStarted");
            // startCallback(str);
        }).
        catch(function(err) {
            LogErr("Start device " + id_ + " failed " + JSON.stringify(constraints_) + " err: " + err.name + " " + err.toString());
            var restartCameraWithoutConstraints = false;
            if (err && type === "VIDEO" && constraints_.video.width) {
                if (err.message === "Invalid constraint" || err.name === "NotReadableError") {
                    restartCameraWithoutConstraints = true;
                }
            }
            if (restartCameraWithoutConstraints) {
                delete constraints_.video.width;
                delete constraints_.video.height;
                startDevice(currentState, nextState, op);
            } else {
                InvokeStateMachine("deviceStarted"); // Will trigger startCallback with null to indicate start failure
                InvokeStateMachine("stop");
            }
        });
    };

    function stopDevice(currentState, nextState, op) {
        id_ = "";
        if (stream_ !== null) {
            StopStream([stream_], type === "AUDIO", type === "VIDEO");
            stream_ = null;
            stopCallback();
        }
    };

    function restartDevice(currentState, nextState, op) {
        LogInfo("restartDevice id=" + id_ + " pending=" + pendingId_);
        if (id_.length > 0 && pendingId_.length > 0 && id_ != pendingId_) {
            id_ = pendingId_;
            pendingId_ = "";
            startDevice();
        } else {
            InvokeStateMachine("deviceStarted");
        }
    };

    function deviceStarted(currentState, nextState, op) {
        startCallback(stream_);
    };

    const stateMachine_ = {
        "DEVICE_IDLE" : {
            start: {
                nextState: DEVICE_STATE_STARTING,
                operation: startDevice
            },
            stop: {
                nextState: DEVICE_STATE_IDLE,
                operation: noop
            },
            deviceStarted: {
                nextState: DEVICE_STATE_IDLE,
                operation: noop
            }
        },

        "DEVICE_STARTING" : {
            start: {
                nextState: DEVICE_STATE_STARTING,
                operation: noop
            },
            stop: {
                nextState: DEVICE_STATE_STOP_PENDING,
                operation: noop
            },
            deviceStarted: {
                nextState: DEVICE_STATE_STARTED,
                operation: deviceStarted
            }
        },

        "DEVICE_STARTED" : {
            start: {
                nextState: DEVICE_STATE_STARTED,
                operation: noop
            },
            stop: {
                nextState: DEVICE_STATE_IDLE,
                operation: stopDevice
            },
            deviceStarted: {
                nextState: DEVICE_STATE_STARTED,
                operation: noop
            }
        },

        "DEVICE_STOP_PENDING" : {
            start: {
                nextState: DEVICE_STATE_START_PENDING,
                operation: noop
            },
            stop: {
                nextState: DEVICE_STATE_STOP_PENDING,
                operation: noop
            },
            deviceStarted: {
                nextState: DEVICE_STATE_IDLE,
                operation: stopDevice
            },
        },

        "DEVICE_START_PENDING" : {
            start: {
                nextState: DEVICE_STATE_START_PENDING,
                operation: noop
            },
            stop: {
                nextState: DEVICE_STATE_STOP_PENDING,
                operation: noop
            },
            deviceStarted: {
                nextState: DEVICE_STATE_STARTING,
                operation: restartDevice
            }
        },
    };

    function InvokeStateMachine(op) {
        var prevState = state_;
        var fn = stateMachine_[state_][op].operation;
        state_ = stateMachine_[state_][op].nextState;
        LogInfo("SM: Curr=" + prevState + " Next=" + state_ + " Op=" + op);
        fn(prevState, state_, op);
    };


    this.StartDevice = function(id, constraints) {
        if (id_.length <= 0) {
            id_ = id;
        } else {
            pendingId_ = id;
        }
        constraints_ = constraints;
        LogInfo("StartDevice id=" + id + "id_=" + id_ + " constraints=" + JSON.stringify(constraints));
        InvokeStateMachine("start");
    };

    this.StopDevice = function(id) {
        LogInfo("StopDevice id=" + id);
        InvokeStateMachine("stop");
    };

    this.SetDevice = function(id, constraints) {
        id_ = id;
        constraints_ = constraints;
        LogInfo("SetDevice id=" + id + " constraints=" + JSON.stringify(constraints));
    };

    this.StartPendingDevice = function() {
        LogInfo("StartPendingDevice id=*" + id_ + "*");
        if (id_ && id_.length > 0) {
            InvokeStateMachine("start");
        }
    };

    this.DeviceRemoved = function(id) {
        LogInfo("DeviceRemoved id=*" + id + "* *" + id_ + "*");
        if (id_ === id) {
            InvokeStateMachine("stop");
        }
    };

    this.GetState = function() {
        return {
            id: stream_ ? stream_.id : null,
            state: state_
        };
    };

    this.SetStream = function(s) {
        if (state_ !== DEVICE_STATE_IDLE) {
            LogErr("SetStream in invalid state " + state_);
            return;
        }
        stream_ = s;
        state_ = DEVICE_STATE_STARTED;
    };

    this.DiffState = function(oldState) {

        var id = stream_ ? stream_.id : null;
        if (oldState.id !== id) {
            if (oldState.id === null) {
                return "started";
            } else if (id === null) {
                return "stopped";
            } else {
                return "restarted";
            }
        }
        return "nochange";
    };

    this.GetStreamAndTrack = function () {
        if (stream_ === null) {
            return {
                stream: null,
                track: null
            };
        }

        var track;

        if (type === "VIDEO") {
            track = stream_.getVideoTracks()[0];
        } else {
            track = stream_.getAudioTracks()[0];
        }
        return {
            stream: stream_,
            track: track
        };
    };

    this.IsStarting = function() {
        return state_ === DEVICE_STATE_STARTING || state_ === DEVICE_STATE_START_PENDING;
    };

};


function VidyoClientWebRTCStats(t, LogInfo, LogErr) {

    const STATS_INTERVAL = 5000; // 5 seconds;
    const SHARE_VIDEO_INDEX = 0;
    const MAIN_VIDEO_INDEX = 1;

    var peerConnectionStats_ = {};
    var peerConnection_ = null;
    var localSharePeerConnection_ = null;
    var transport_ = t;

    var maxAudio_ = 4;
    var maxVideo_ = 9;

    function InitializeStats() {
        peerConnectionStats_ = {
            timestamp: Date.now(),
            availableTxBw: 0,
            availableRxBw: 0,
            audioTxSsrc: "",
            audioTxBytes: 0,
            audioTxBitrate: 0,
            videoTxSsrc: ["", ""],
            videoTxBytes: [0, 0],
            videoTxBitrate: [0, 0],
            videoTxFrames: [0, 0],
            videoTxFramerate: [0, 0],
            videoTxFirsReceived: [0, 0],
            videoTxNacksReceived: [0, 0],
            videoTxRtt: [0, 0],
            audioRxBytes: [],
            audioRxBitrate: [],
            audioRxJitterBufferSize: [],
            audioRxPacketsLost: [],
            videoRxBytes: [],
            videoRxBitrate: [],
            videoRxPacketsLost: [],
            videoRxFrames: [],
            videoRxFramerate: [],
            videoRxJitterBufferSize: [],
            videoRxNacksSent: [],
            videoRxFirsSent: [],
        };

        for (var i = 0; i <= maxAudio_; i++) {
            peerConnectionStats_.audioRxBytes.push(0);
            peerConnectionStats_.audioRxBitrate.push(0);
            peerConnectionStats_.audioRxJitterBufferSize.push(0);
            peerConnectionStats_.audioRxPacketsLost.push(0);
        }
        for (var i = 0; i <= maxVideo_; i++) {
            peerConnectionStats_.videoRxBytes.push(0);
            peerConnectionStats_.videoRxBitrate.push(0);
            peerConnectionStats_.videoRxPacketsLost.push(0);
            peerConnectionStats_.videoRxFrames.push(0);
            peerConnectionStats_.videoRxFramerate.push(0);
            peerConnectionStats_.videoRxJitterBufferSize.push(0);
            peerConnectionStats_.videoRxNacksSent.push(0);
            peerConnectionStats_.videoRxFirsSent.push(0);
        }
    };

    function GetBitRate (b1, b2, t) {
        var bits = (b1 - b2) << 3; // Multiply by 8 to convert to bits as b1,b2 are bytes
        return (bits < 0) ? 0 : (Math.floor(bits*1000/t)); // bits / t/1000 since t is in milliseconds
    };

    function ResetVideoTxStats(index) {
        peerConnectionStats_.videoTxBytes[index] = 0;
        peerConnectionStats_.videoTxBitrate[index] = 0;
        peerConnectionStats_.videoTxFrames[index] = 0;
        peerConnectionStats_.videoTxFramerate[index] = 0;
        peerConnectionStats_.videoTxFirsReceived[index] = 0;
        peerConnectionStats_.videoTxNacksReceived[index] = 0;
    };

    function ResetAudioTxStats() {
        peerConnectionStats_.audioTxBytes = 0;
        peerConnectionStats_.audioTxBitrate = 0;
    };

    function ProcessChromeStats(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
            var standardStats = {
                id: report.id,
                timestamp: report.timestamp,
                type: {
                    localcandidate: 'local-candidate',
                    remotecandidate: 'remote-candidate'
                }[report.type] || report.type
            };
            report.names().forEach(function(name) {
                standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
        });
        return standardReport;
    };

    function SetChromeTxStats(stats, timediff, index) {
        var audioTxKey = "";
        var videoTxKey = "";
        var bytes = 0;

        var CheckSsrcInSdp = function(k, index) {
            var ssrc = k.replace("ssrc_", "").replace("_send", "");

            if (index === MAIN_VIDEO_INDEX  && peerConnection_.localDescription.sdp.indexOf(ssrc) !== -1) {
                return ssrc;
            } else if (index === SHARE_VIDEO_INDEX && localSharePeerConnection_ && localSharePeerConnection_.localDescription.sdp.indexOf(ssrc) !== -1) {
                return ssrc;
            }
            return "";
        };

        for (var k in stats) {
            if (k.indexOf("_send") !== -1) {
                var ssrc = CheckSsrcInSdp(k, index);

                if (ssrc.length <= 0) {
                    continue;
                }
                if (stats[k].mediaType == "video") {
                    videoTxKey = k;
                    if (peerConnectionStats_.videoTxSsrc[index] !== ssrc) {
                        peerConnectionStats_.videoTxSsrc[index] = ssrc;
                        ResetVideoTxStats(index);
                    }
                } else if (stats[k].mediaType == "audio") {
                    audioTxKey = k
                    if (peerConnectionStats_.audioTxSsrc !== ssrc) {
                        peerConnectionStats_.audioTxSsrc = ssrc;
                        ResetAudioTxStats();
                    }
                } else {
                    LogErr("Unknown send stats[" + k + "]: " + JSON.stringify(stats[k]));
                }
            }
        }

        if (audioTxKey.length > 0) {
            bytes = parseInt(stats[audioTxKey].bytesSent, 10);
            peerConnectionStats_.audioTxBitrate = GetBitRate(bytes, peerConnectionStats_.audioTxBytes, timediff);
            peerConnectionStats_.audioTxBytes = bytes;
        } else {
            ResetAudioTxStats();
        }

        if (videoTxKey.length > 0) {
            bytes = parseInt(stats[videoTxKey].bytesSent, 10);
            peerConnectionStats_.videoTxBitrate[index] = GetBitRate(bytes, peerConnectionStats_.videoTxBytes[index], timediff);
            peerConnectionStats_.videoTxBytes[index] = bytes;
            peerConnectionStats_.videoTxFramerate[index] = parseInt(stats[videoTxKey].googFrameRateSent, 10);
            peerConnectionStats_.videoTxFirsReceived[index] = parseInt(stats[videoTxKey].googFirsReceived, 10) + parseInt(stats[videoTxKey].googPlisReceived, 10);
            peerConnectionStats_.videoTxNacksReceived[index] = parseInt(stats[videoTxKey].googNacksReceived, 10);
            peerConnectionStats_.videoTxRtt[index] = parseInt(stats[videoTxKey].googRtt, 10);
        } else {
            ResetVideoTxStats(index);
        }
    };

    function GetChromeShareStats(timediff, callback) {
        if (!localSharePeerConnection_) {
            ResetVideoTxStats(SHARE_VIDEO_INDEX);
            callback(true);
            return;
        }

        localSharePeerConnection_.getStats(function(s) {
            var stats = ProcessChromeStats(s);
            SetChromeTxStats(stats, timediff, SHARE_VIDEO_INDEX);
            callback(true);
        }, function(err) {
            LogErr("SharePeerConnection GetStats err " + err);
            callback(true);
        });
    };

    function GetChromeStats(callback) {

        peerConnection_.getStats(function(s) {
            var stats = ProcessChromeStats(s);
            var timestamp = Date.now();
            var timediff = peerConnectionStats_.timestamp > 0 ? timestamp - peerConnectionStats_.timestamp : STATS_INTERVAL;
            peerConnectionStats_.timestamp = timestamp;
            peerConnectionStats_.interval = timediff;

            var bytes = 0;

            SetChromeTxStats(stats, timediff, MAIN_VIDEO_INDEX);

            if (stats.bweforvideo) {
                peerConnectionStats_.availableTxBw = parseInt(stats.bweforvideo.googAvailableSendBandwidth, 10);
                peerConnectionStats_.availableRxBw = parseInt(stats.bweforvideo.googAvailableReceiveBandwidth, 10);
            }

            for (var i = 1; i <= maxAudio_; i++) {
                var audioRxKey = "ssrc_1000" + i + "_recv";
                if (stats[audioRxKey]) {
                    bytes = parseInt(stats[audioRxKey].bytesReceived, 10);
                    peerConnectionStats_.audioRxBitrate[i] = GetBitRate(bytes, peerConnectionStats_.audioRxBytes[i], timediff);
                    peerConnectionStats_.audioRxBytes[i] = bytes;
                    peerConnectionStats_.audioRxJitterBufferSize[i] = parseInt(stats[audioRxKey].googJitterBufferMs, 10);
                    peerConnectionStats_.audioRxPacketsLost[i] = parseInt(stats[audioRxKey].packetsLost, 10);
                }
            }
            for (var i = 1; i <= maxVideo_; i++) {
                var videoRxKey = "ssrc_5000" + i + "_recv";
                if (stats[videoRxKey]) {
                    bytes = parseInt(stats[videoRxKey].bytesReceived, 10);
                    peerConnectionStats_.videoRxBitrate[i] = GetBitRate(bytes, peerConnectionStats_.videoRxBytes[i], timediff);
                    peerConnectionStats_.videoRxBytes[i] = bytes;
                    peerConnectionStats_.videoRxPacketsLost[i] = parseInt(stats[videoRxKey].packetsLost, 10);
                    peerConnectionStats_.videoRxFramerate[i] = parseInt(stats[videoRxKey].googFrameRateOutput, 10);
                    peerConnectionStats_.videoRxJitterBufferSize[i] = parseInt(stats[videoRxKey].googJitterBufferMs, 10);
                    peerConnectionStats_.videoRxNacksSent[i] = parseInt(stats[videoRxKey].googNacksSent, 10);
                    peerConnectionStats_.videoRxFirsSent[i] = parseInt(stats[videoRxKey].googFirsSent, 10) + parseInt(stats[videoRxKey].googPlisSent, 10);
                }
            }
            GetChromeShareStats(timediff, callback);
        }, function(err) {
            LogErr("PeerConnection GetStats err " + err);
            callback(false);
        });
    };

    function SetStandardTxStats(stats, timediff, index) {
        var audioTxKey = "";
        var videoTxKey = "";
        var bytes = 0;

        var CheckSsrcInSdp = function(ssrc, index) {

            if (index === MAIN_VIDEO_INDEX  && peerConnection_.localDescription.sdp.indexOf(ssrc) !== -1) {
                return "" + ssrc;
            } else if (index === SHARE_VIDEO_INDEX && localSharePeerConnection_ && localSharePeerConnection_.localDescription.sdp.indexOf(ssrc) !== -1) {
                return "" + ssrc;
            }
            return "";
        };

        stats.forEach(function(k) {
            if (k.type === "outboundrtp" || k.type === "outbound-rtp") {
                var ssrc = CheckSsrcInSdp(k.ssrc, index);
                if (ssrc.length <= 0) {
                    return;
                }
                if (k.mediaType == "video") {
                    videoTxKey = k.id;
                    if (peerConnectionStats_.videoTxSsrc[index] !== ssrc) {
                        peerConnectionStats_.videoTxSsrc[index] = ssrc;
                        ResetVideoTxStats(index);
                    }
                } else if (k.mediaType == "audio") {
                    audioTxKey = k.id;
                    if (peerConnectionStats_.audioTxSsrc !== ssrc) {
                        peerConnectionStats_.audioTxSsrc = ssrc;
                        ResetAudioTxStats();
                    }
                } else {
                    LogErr("Unknown send stats[" + k + "]: " + JSON.stringify(stats[k]));
                }
            } else if (k.type === "candidate-pair") {
                if (k.hasOwnProperty("availableIncomingBitrate")) {
                    peerConnectionStats_.availableRxBw = Math.floor(k.availableIncomingBitrate/1000);
                }
                if (k.hasOwnProperty("availableOutgoingBitrate")) {
                    peerConnectionStats_.availableTxBw = Math.floor(k.availableOutgoingBitrate/1000);
                }
            }
        });

        if (audioTxKey.length > 0) {
            var audioStats = stats.get(audioTxKey);
            bytes = audioStats.bytesSent;
            peerConnectionStats_.audioTxBitrate = GetBitRate(bytes, peerConnectionStats_.audioTxBytes, timediff);
            peerConnectionStats_.audioTxBytes = bytes;
        } else {
            ResetAudioTxStats();
        }

        if (videoTxKey.length > 0) {
            var videoStats = stats.get(videoTxKey);
            bytes = videoStats.bytesSent;
            peerConnectionStats_.videoTxBitrate[index] = GetBitRate(bytes, peerConnectionStats_.videoTxBytes[index], timediff);
            peerConnectionStats_.videoTxBytes[index] = bytes;
            if (videoStats.hasOwnProperty("framerateMean")) {
                peerConnectionStats_.videoTxFramerate[index] = Math.floor(videoStats.framerateMean);
            } else if (videoStats.hasOwnProperty("framesEncoded")) {
                peerConnectionStats_.videoTxFramerate[index] = Math.floor((videoStats.framesEncoded - peerConnectionStats_.videoTxFrames[index]) / (timediff/1000));
                peerConnectionStats_.videoTxFrames[index] = videoStats.framesEncoded;
            }
        } else {
            ResetVideoTxStats(index);
        }
    };

    function GetStandardShareStats(timediff, callback) {
        if (!localSharePeerConnection_) {
            ResetVideoTxStats(SHARE_VIDEO_INDEX);
            callback(true);
            return;
        }

        localSharePeerConnection_.getStats(null).then(function(stats) {
            SetStandardTxStats(stats, timediff, SHARE_VIDEO_INDEX);
            callback(true);
        }).catch(function(err) {
            LogErr("SharePeerConnection GetStats err " + err);
            callback(true);
        });
    };

    function GetStandardStats(callback) {
        peerConnection_.getStats(null).then(function(stats) {
            var timestamp = Date.now();
            var timediff = peerConnectionStats_.timestamp > 0 ? timestamp - peerConnectionStats_.timestamp : STATS_INTERVAL;
            peerConnectionStats_.timestamp = timestamp;
            peerConnectionStats_.interval = timediff;

            var bytes = 0;

            SetStandardTxStats(stats, timediff, MAIN_VIDEO_INDEX);

            for (var i = 1; i <= maxAudio_; i++) {
                var audioRxKey = "inbound_rtp_audio_" + (i-1);
                var audioStats = stats.get(audioRxKey);
                if (!audioStats) {
                    audioRxKey = "RTCInboundRTPAudioStream_1000" + i;
                    audioStats = stats.get(audioRxKey);
                }
                if (audioStats) {
                    bytes = audioStats.bytesReceived;
                    peerConnectionStats_.audioRxBitrate[i] = GetBitRate(bytes, peerConnectionStats_.audioRxBytes[i], timediff);
                    peerConnectionStats_.audioRxBytes[i] = bytes;
                    peerConnectionStats_.audioRxJitterBufferSize[i] = Math.floor(audioStats.jitter);
                    peerConnectionStats_.audioRxPacketsLost[i] = audioStats.packetsLost;
                }
            }

            for (var i = 1; i <= maxVideo_; i++) {
                var videoRxKey = "inbound_rtp_video_" + ((i-1) + maxAudio_);
                var videoStats = stats.get(videoRxKey);
                if (!videoStats) {
                    videoRxKey = "RTCInboundRTPVideoStream_5000" + i;
                    videoStats = stats.get(videoRxKey);
                }
                if (videoStats) {
                    bytes = videoStats.bytesReceived;
                    peerConnectionStats_.videoRxBitrate[i] = GetBitRate(bytes, peerConnectionStats_.videoRxBytes[i], timediff);
                    peerConnectionStats_.videoRxBytes[i] = bytes;
                    peerConnectionStats_.videoRxPacketsLost[i] = videoStats.packetsLost;
                    if (videoStats.hasOwnProperty("framerateMean")) {
                        peerConnectionStats_.videoRxFramerate[i] = Math.floor(videoStats.framerateMean);
                    } else if (videoStats.hasOwnProperty("framesDecoded")) {
                        peerConnectionStats_.videoRxFramerate[i] = Math.floor((videoStats.framesDecoded - peerConnectionStats_.videoRxFrames[i]) / (timediff/1000));
                        peerConnectionStats_.videoRxFrames[i] = videoStats.framesDecoded;
                    }
                    peerConnectionStats_.videoRxJitterBufferSize[i] = Math.floor(videoStats.jitter);
                }
            }
            GetStandardShareStats(timediff, callback);
        }).catch(function(err) {
            LogErr("PeerConnection GetStats Err " + err);
            callback(false);
        });
    };

    function SendPeriodicStats() {
        if (!peerConnection_) {
            return;
        }

        var SendStats = function(status) {
            if (status) {
                var stats = JSON.parse(JSON.stringify(peerConnectionStats_));

                delete stats.audioTxSsrc;
                delete stats.audioTxBytes;
                delete stats.videoTxSsrc;
                delete stats.videoTxBytes;
                delete stats.videoTxFrames;
                delete stats.audioRxBytes;
                delete stats.videoRxBytes;
                delete stats.videoRxFrames;


                var statsMsg = {
                    method: "VidyoWebRTCStats",
                    stats: stats
                };

                transport_.SendWebRTCMessage(statsMsg, function() {
                    setTimeout(SendPeriodicStats, STATS_INTERVAL);
                });
            } else {
                LogErr("GetStats failed");
            }
        };

        if (window.adapter.browserDetails.browser === "chrome") {
            GetChromeStats(SendStats);
        } else if (window.adapter.browserDetails.browser === "firefox" || window.adapter.browserDetails.browser === "safari") {
            GetStandardStats(SendStats);
        }
    };

    this.Start = function(pc, maxAudio, maxVideo) {
        peerConnection_ = pc;
        maxAudio_ = maxAudio;
        maxVideo_ = maxVideo;
        InitializeStats();
        setTimeout(SendPeriodicStats, STATS_INTERVAL);
    };

    this.Stop = function() {
        peerConnection_ = null;
        localSharePeerConnection_ = null;
    };

    this.SetSharePeerConnection = function(pc) {
        localSharePeerConnection_ = pc;
    };
};


const RENDERER_TYPE_COMPOSITE = "composite";
const RENDERER_TYPE_TILES = "tiles";

const STREAM_TYPE_PREVIEW = "preview";
const STREAM_TYPE_VIDEO = "video";
const STREAM_TYPE_SHARE = "share";


function VidyoClientWebRTC(t) {

    var transport_ = t;

    var layoutEngine_ = {};
    var layoutEngineAttrs_ = {};
    var rendererType = RENDERER_TYPE_COMPOSITE;

    const PREVIEW_SOURCE_ID = "preview-source-id";

    const maxShareResolution_ = "1080p";
    const maxShareFrameRate_ = 10;

    var devices_ = null;
    var deviceStorage_ = null;
    var offer_ = null;
    var streamMapping_ = {};
    var micStream_ = null;
    var videoStreams_ = [null];
    var maxResolution_ = "360p";
    var maxSubscriptions_ = 8;
    var startCallData_ = null;
    
    var localShareId_ = -1;
    var pendingRequestId_ = -1;
    var shareSelectedCallback_ = null;

    var localSharePeerConnection_ = null;
    var localShareStream_ = [];
    var localShareElement_ = null;
    var localShareOffer_ = null;
    var iceCandidateTimeout_ = null;
    var previousWindowSizes_ = { windows: []};

    const CALLSTATE_IDLE = "IDLE";
    const CALLSTATE_WAITING_FOR_DEVICES = "WAITING_FOR_DEVICES";
    const CALLSTATE_GETTING_OFFER = "GETTING_OFFER";
    const CALLSTATE_WAITING_FOR_ANSWER = "WAITING_FOR_ANSWER";
    const CALLSTATE_CONNECTING = "CONNECTING";
    const CALLSTATE_CONNECTED = "CONNECTED";
    const CALLSTATE_DISCONNECTING = "DISCONNECTING";
    const CALLSTATE_RENEGOTIATE_PENDING = "RENEGOTIATE_PENDING";

    var callState_ = CALLSTATE_IDLE;
    const stateMachine_ = {
        "IDLE": {
            startCall: {
                nextState: CALLSTATE_WAITING_FOR_DEVICES,
                operation: CheckForDevices,
            },
            gotOffer: {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
            gotAnswer: {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
            signalingStable: {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
            deviceStateChanged: {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
        },

        "WAITING_FOR_DEVICES": {
            startCall: {
                nextState: CALLSTATE_GETTING_OFFER,
                operation: HandleStartCall
            },
            gotOffer: {
                nextState: CALLSTATE_WAITING_FOR_DEVICES,
                operation: noop
            },
            gotAnswer: {
                nextState: CALLSTATE_WAITING_FOR_DEVICES,
                operation: noop
            },
            signalingStable: {
                nextState: CALLSTATE_WAITING_FOR_DEVICES,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_DISCONNECTING,
                operation: noop
            },
            deviceStateChanged: {
                nextState: CALLSTATE_WAITING_FOR_DEVICES,
                operation: CheckForDevices
            },
        },

        "GETTING_OFFER" : {
            startCall: {
                nextState: CALLSTATE_GETTING_OFFER,
                operation: noop
            },
            gotOffer: {
                nextState: CALLSTATE_WAITING_FOR_ANSWER,
                operation: SendLocalOffer
            },
            gotAnswer: {
                nextState: CALLSTATE_IDLE,
                operation: noop
            },
            signalingStable: {
                nextState: CALLSTATE_GETTING_OFFER,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: noop
            },
        },

        "WAITING_FOR_ANSWER" : {
            startCall: {
                nextState: CALLSTATE_WAITING_FOR_ANSWER,
                operation: noop
            },
            gotOffer: {
                nextState: CALLSTATE_WAITING_FOR_ANSWER,
                operation: noop
            },
            gotAnswer: {
                nextState: CALLSTATE_CONNECTING,
                operation: HandleAnswerSdp
            },
            signalingStable: {
                nextState: CALLSTATE_WAITING_FOR_ANSWER,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: noop
            },
        },

        "CONNECTING" : {
            startCall: {
                nextState: CALLSTATE_CONNECTING,
                operation: noop
            },
            gotOffer: {
                nextState: CALLSTATE_CONNECTING,
                operation: noop
            },
            gotAnswer: {
                nextState: CALLSTATE_CONNECTING,
                operation: noop
            },
            signalingStable: {
                nextState: CALLSTATE_CONNECTED,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: noop
            },
        },


        "CONNECTED" : {
            startCall: {
                nextState: CALLSTATE_CONNECTED,
                operation: noop
            },
            gotOffer: {
                nextState: CALLSTATE_CONNECTED,
                operation: noop
            },
            gotAnswer: {
                nextState: CALLSTATE_CONNECTED,
                operation: noop
            },
            signalingStable: {
                nextState: CALLSTATE_CONNECTED,
                operation: noop
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_GETTING_OFFER,
                operation: AddRemoveStreams
            },
        },

        "DISCONNECTING": {
            startCall: {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            gotOffer: {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            gotAnswer: {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            signalingStable: {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
        },

        "RENEGOTIATE_PENDING": {
            startCall: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: noop
            },
            gotOffer: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: SendLocalOffer
            },
            gotAnswer: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: HandleAnswerSdp,
            },
            signalingStable: {
                nextState: CALLSTATE_GETTING_OFFER,
                operation: AddRemoveStreams,
            },
            stopCall : {
                nextState: CALLSTATE_IDLE,
                operation: HandleStopCall
            },
            deviceStateChanged: {
                nextState: CALLSTATE_RENEGOTIATE_PENDING,
                operation: noop
            },
        }
    };

    function noop(currentState, nextState, op) {
        LogInfo("NO-OP [" + op + "] Curr:" + currentState + " Next:" + nextState);
    };

    function InvokeStateMachine(op, data) {
        var prevState = callState_;
        var fn = stateMachine_[prevState][op].operation;
        callState_ = stateMachine_[prevState][op].nextState;
        LogInfo("SM: Curr=" + prevState + " Next=" + callState_ + " Op=" + op);
        fn(prevState, callState_, op, data);
    };


    const resolutionMap_ = {
        "180p" : { w: 320,  h: 180,   br: "256"},
        "240p" : { w: 426,  h: 240,   br: "384"},
        "270p" : { w: 480,  h: 270,   br: "448"},
        "360p" : { w: 640,  h: 360,   br: "512"},
        "480p" : { w: 854,  h: 480,   br: "768"},
        "540p" : { w: 960,  h: 540,   br: "1024"},
        "720p" : { w: 1280, h: 720,   br: "1536"},
        "1080p": { w: 1920, h: 1080,  br: "2048"},
    };


    var peerConnectionConstraints_ = {
        iceServers: []
    };


    var showAudioMeters_ = true;
    var localAudioLevelDetection_ = null;
    const AudioContext = new (window.AudioContext || window.webkitAudioContext)();

    function AudioLevelDetection(id, interval) {

        var audioAnalyser_ = AudioContext.createAnalyser();
        audioAnalyser_.fftSize = 64;
        audioAnalyser_.smoothingTimeConstant = 0.3;
        var source_ = null;
        var buffer_ = null;
        var callback_ = null;

        function GetAudioLevel() {
            if (!buffer_)  {
                return;
            }
            audioAnalyser_.getByteFrequencyData(buffer_);
            var average = 0;
            for (var i = 0; i < buffer_.length; i++) {
                average += buffer_[i];
            }

            average = average/buffer_.length;
            if (callback_) {
                callback_(id, average);
                setTimeout(GetAudioLevel, interval);
            }
        };

        this.Start = function(stream, callback) {
            source_ = AudioContext.createMediaStreamSource(stream);
            callback_ = callback;
            source_.connect(audioAnalyser_);
            buffer_ = new Uint8Array(audioAnalyser_.frequencyBinCount);
            GetAudioLevel();
        };

        this.Stop = function() {
            source_.disconnect();
            audioAnalyser_.disconnect();
            buffer_ = null;
            callback_ = null;
        };
    };

    function CameraStarted(stream) {
        var streamDetails = "null";
        if (stream) {
            var tracks = stream.getVideoTracks();
            if (tracks.length) {
                streamDetails = "" + stream.id + " *" + tracks[0].label + "*";
            } else {
                streamDetails = "" + stream.id + " No label";
            }
        }
        LogInfo("CameraStarted stream=" + streamDetails);
        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
        } else {
            mic_.StartPendingDevice();
        }
        videoStreams_[0] = stream;
        CreateSourceIdEntryInStreamMappingAndAttachVideo({sourceId: PREVIEW_SOURCE_ID, streamId: 0, attached: false, type: STREAM_TYPE_PREVIEW, name: "Preview"});
        if (stream !== null) {
            InvokeStateMachine("deviceStateChanged");
        }
    };

    function CameraStopped() {
        LogInfo("CameraStopped");
        videoStreams_[0] = null;
        InvokeStateMachine("deviceStateChanged");
    };

    function UpdateAudioLevel(audioId, level) {
        if (audioId === 0) {
            if (streamMapping_.hasOwnProperty(PREVIEW_SOURCE_ID)) {
                var elemId = streamMapping_[PREVIEW_SOURCE_ID].elemId;
                if (elemId) {
                    layoutEngine_[elemId].setAudioLevel(STREAM_TYPE_PREVIEW, 0, level);
                }
            }
        } else {
            var streamId = remoteAudioStreamIdMapping_[audioId];
            for (var sourceId in streamMapping_) {
                var elemId = streamMapping_[sourceId].elemId;
                if (streamMapping_[sourceId].streamId === streamId && elemId) {
                    layoutEngine_[elemId].setAudioLevel(STREAM_TYPE_VIDEO, streamId, level);
                }
            }
        }
    };

    function StartLocalAudioLevelDetection() {
        var stream = mic_.GetStreamAndTrack().stream;
        if (stream) {
            localAudioLevelDetection_ = new AudioLevelDetection(0, 300); // Update the audio level every 300ms
            localAudioLevelDetection_.Start(stream, UpdateAudioLevel);
        } else {
            LogErr("StartLocalAudioLevelDetection failed: no mic stream");
        }
    };

    function StopLocalAudioLevelDetection() {
        if (localAudioLevelDetection_) {
            localAudioLevelDetection_.Stop();
            localAudioLevelDetection_ = null;
            UpdateAudioLevel(0, 0);
        }
    };

    function MicStarted(stream) {
        var streamDetails = "null";
        if (stream) {
            var tracks = stream.getAudioTracks();
            if (tracks.length) {
                streamDetails = "" + stream.id + " *" + tracks[0].label + "*";
            } else {
                streamDetails = "" + stream.id + " No label";
            }
        }
        LogInfo("MicrophoneStarted stream=" + streamDetails);
        if (stream !== null) {
            InvokeStateMachine("deviceStateChanged");
            if (showAudioMeters_) {
                StartLocalAudioLevelDetection();
            }
        }
    };

    function MicStopped() {
        LogInfo("MicrophoneStopped");
        InvokeStateMachine("deviceStateChanged");
        StopLocalAudioLevelDetection();
    };

    var peerConnection_ = null;
    var additionalPc_ = [];
    var additionalOffers_ = [];
    var additionalIceCandidates_ = [];
    var peerConnectionStats_ = new VidyoClientWebRTCStats(transport_, LogInfo, LogErr);
    var peerConnectionAudioTransceiver_ = null;
    var peerConnectionVideoTransceiver_ = null;

    var camera_ = new VidyoInputDevice("VIDEO", CameraStarted, CameraStopped);
    var mic_ = new VidyoInputDevice("AUDIO", MicStarted, MicStopped);

    var cameraState_ = null;
    var micState_ = null;

    const MAX_REMOTE_AUDIO_STREAMS = 4;
    var remoteAudio_ = [];
    var currentAudioIndex_ = 0;
    var remoteAudioLevelDetection_ = [];
    var remoteAudioStreamIdMapping_ = [];
    for (var r = 0; r < MAX_REMOTE_AUDIO_STREAMS; r++) {
        remoteAudio_[r] = document.createElement("audio");
        remoteAudio_[r].autoplay = true;
        remoteAudioLevelDetection_[r] = null;
    }

    for (var r = 0; r < (MAX_REMOTE_AUDIO_STREAMS + 1); r++) {
        remoteAudioStreamIdMapping_[r] = -1;
    };

    function StartRemoteAudioLevelDetection() {
        for (var i = 0; i < remoteAudioLevelDetection_.length; i++) {
            if (remoteAudio_[i].srcObject && !remoteAudioLevelDetection_[i]) {
                remoteAudioLevelDetection_[i] = new AudioLevelDetection(i+1, 300);
                remoteAudioLevelDetection_[i].Start(remoteAudio_[i].srcObject, UpdateAudioLevel);
            }
        }
    };

    function StopRemoteAudioLevelDetection() {
        for (var i = 0; i < remoteAudioLevelDetection_.length; i++) {
            if (remoteAudioLevelDetection_[i]) {
                remoteAudioLevelDetection_[i].Stop();
                remoteAudioLevelDetection_[i] = null;
                UpdateAudioLevel(i+1, 0);
            }
        }
    };

    var logLevel = (VCUtils.params && VCUtils.params.webrtcLogLevel) ? VCUtils.params.webrtcLogLevel : "info";

    function LogInfo (msg) {
        if (logLevel === "info") {
            console.log("" + GetTimeForLogging() + " VidyoWebRTC: " + msg);
        }
    };


    function LogErr (msg) {
        if (logLevel === "info" || logLevel === "error") {
            console.error("" + GetTimeForLogging() + " VidyoWebRTC: " + msg);
        }
    };

    function AttachVideo(sourceId) {
        if (streamMapping_.hasOwnProperty(sourceId) &&
            streamMapping_[sourceId].hasOwnProperty("elemId") &&
            streamMapping_[sourceId].hasOwnProperty("streamId") &&
            !streamMapping_[sourceId].attached) {

            var elemId = streamMapping_[sourceId]["elemId"];

            if (!layoutEngine_.hasOwnProperty(elemId)) {
                LogErr("Invalid view id - no layout engine found for " + elemId + " contains: " + JSON.stringify(Object.keys(layoutEngine_), null, 2));
                return;
            }


            var streamId = streamMapping_[sourceId]["streamId"];
            var videoElement = layoutEngine_[elemId].getVideoElement(streamMapping_[sourceId].type,  streamId);

            if (videoElement && videoStreams_[streamId]) {
                streamMapping_[sourceId].attached = true;
                var videoStream = videoStreams_[streamId];
                videoElement.srcObject = videoStream;
                videoElement.dataset.streamId = videoStream.id;
                videoElement.dataset.playIndex = streamId;

                if (window.adapter.browserDetails.browser === "edge") {
                    videoElement.addEventListener("pause", HandleVideoElementPause);
                    videoElement.addEventListener("play", HandleVideoElementPlay);
                }

                LogInfo("AttachVideo: elem=" + elemId + " source=" + sourceId + " streamId=" + streamId);
                layoutEngine_[elemId].show(streamMapping_[sourceId].type,  streamId, streamMapping_[sourceId].name);
            }
        }
    };


    function CreateSourceIdEntryInStreamMappingAndAttachVideo(stream) {
        var sourceId = stream.sourceId;
        if (!streamMapping_.hasOwnProperty(sourceId)) {
            streamMapping_[sourceId] = {
                attached: false
            }
        }

        for (var k in stream) {
            streamMapping_[sourceId][k] = stream[k];
        }

        AttachVideo(sourceId);
    };

    function GetDevicesPostGetUserMedia(constraints, cb) {
        navigator.mediaDevices.getUserMedia(constraints).
        then(function(stream) {
            GetDevices(false, function(devices) {
                StopStream([stream], true, true);
                cb(true, devices);
            });
        }).
        catch(function(err) {
            LogErr("getUserMediaFailed " + err.name + " - " + err.toString());
            console.log(err);
            cb(false, []);
        });
    };

    function GetDevices (doGetUserMedia, cb) {
        navigator.mediaDevices.enumerateDevices().
        then(function(devs) {
            var devices = [];
            var labels = 0;
            var constraints = {
                audio: false,
                video: false
            };
            for (var k = 0; k <devs.length; k++) {
                var d = devs[k];
                if (d.kind === "audioinput") {
                    constraints.audio = true;
                } else if (d.kind === "videoinput") {
                    constraints.video = true;
                }
                if (window.adapter.browserDetails.browser === "edge" && d.kind === "audiooutput" && d.label.length <= 0) {
                    // On edge, audiooutput devices are enumerated with empty labels, ignore
                    continue;
                }
                if (window.adapter.browserDetails.browser === "firefox" && d.label && d.label.indexOf("CubebAggregateDevice") !== -1) {
                    // On firefox, browser generates a CubebAggregateDevice which is not a real audio device
                    continue;
                }
                devices.push({
                    deviceId: d.deviceId,
                    groupId: d.groupId,
                    kind: d.kind,
                    label: d.label
                });

                if (d.label.length > 0) {
                    labels++;
                }
            }

            // NEPWEB-484 There is a bug in firefox when device enumeration is called with an active stream and a new mic is plugged in
            // There are devices that come with an empty label
            if (labels) {
                if (devices.length !== labels) {
                    UpdateDeviceLabels(devices);  // If local storage has all the necessary devices
                    // LogInfo("Empty labels in device enumeration, filtering " + (devices.length - labels) + " devices");
                    var devicesWithLabels = devices.filter(function(d) { return d.label.length > 0; });
                    cb(devicesWithLabels);
                    SaveDevicesToLocalStorage(devicesWithLabels);
                } else {
                    cb(devices);
                    SaveDevicesToLocalStorage(devices);
                }
            } else {
                if (UpdateDeviceLabels(devices)) {  // If local storage has all the necessary devices
                    cb(devices);
                } else if (doGetUserMedia) {
                    GetDevicesPostGetUserMedia(constraints, function(status, devices2) {
                        if (status) {
                            cb(devices2);
                        } else {
                            cb(devices);
                        }
                    });
                } else {
                    cb(devices);
                }
            }
        }).
        catch(function(err) {
            LogErr("enumerateDevices failed: " + err.toString());
            console.log(err);
            cb([]);
        });
    };

    function DiffDevices(oldDevices, newDevices) {
        var getDeviceIds = function(d) {
            return d.deviceId;
        };

        var oldDeviceIds = oldDevices.map(getDeviceIds);
        var newDeviceIds = newDevices.map(getDeviceIds);

        var addedDevices = newDevices.filter(function(d) {
            return oldDeviceIds.indexOf(d.deviceId) === -1;
        });

        var removedDevices = oldDevices.filter(function(d) {
            return newDeviceIds.indexOf(d.deviceId) === -1;
        });

        return {
            added: addedDevices,
            removed: removedDevices
        };

    };

    function SaveDevicesToLocalStorage(devices) {
        if (window.adapter.browserDetails.browser === "chrome") {
            return;
        }

        if (deviceStorage_ === null) {
            // Not using localStorage for edge since it gives new device ids every time for the same domain
            // Storing the devices so that we don't ask permission every time while polling for device change
            if (window.adapter.browserDetails.browser === "edge" || window.adapter.browserDetails.browser === "safari") {
                deviceStorage_ = {};
            } else {
                try {
                    deviceStorage_ = window.localStorage;
                } catch(err) {
                    LogInfo("LocalStorage disabled !! " + err);
                    deviceStorage_ = {};
                };
            }
        }

        var devs = [];
        if (deviceStorage_.hasOwnProperty("devices")) {
            devs = JSON.parse(deviceStorage_.devices);
        }

        var newDevices = DiffDevices(devs, devices).added;

        if (newDevices.length > 0) {
            for (var n = 0; n < newDevices.length; n++) {
                LogInfo("Pushing new device to storage " + JSON.stringify(newDevices[n], 2, null));
                devs.push({
                    deviceId: newDevices[n].deviceId,
                    label: newDevices[n].label,
                    kind: newDevices[n].kind
                });
            }

            deviceStorage_.devices = JSON.stringify(devs);
            LogInfo("Stored devices: " + JSON.stringify(devs));
        }
    };

    // Updates the labels from the devices in localStorage
    // Returns false if the device was not found in localStorage
    function UpdateDeviceLabels(devices) {
        if (window.adapter.browserDetails.browser === "chrome") {
            return false;
        }

        if (deviceStorage_ == null || !deviceStorage_.hasOwnProperty("devices")) {
            return false;
        }

        var oldDevices = JSON.parse(deviceStorage_.devices);

        var GetDeviceLabel = function(dev) {
            for (var o = 0; o < oldDevices.length; o++) {
                if (oldDevices[o].deviceId === dev.deviceId) {
                    return oldDevices[o].label;
                }
            }
            return "";
        };

        for (var i = 0; i < devices.length; i++) {
            var label = GetDeviceLabel(devices[i]);
            if (label.length <= 0) {
                LogInfo("NO LABEL FOR " + devices[i].deviceId);
                return false;
            }
            devices[i].label = label;
        }

        return true;
    };

    function GetDevicesUpdateObject() {
        return {
            method: "VidyoWebRTCDevicesUpdated",
            added: {
                microphones: [],
                cameras: [],
                speakers: []
            },
            removed: {
                microphones: [],
                cameras: [],
                speakers: []
            }
        };

    };

    function SendDevicesUpdated(added, removed, callback) {
        var deviceUpdate = GetDevicesUpdateObject();
        ConvertToDeviceInfo(added, deviceUpdate.added.microphones, deviceUpdate.added.cameras, deviceUpdate.added.speakers);
        ConvertToDeviceInfo(removed, deviceUpdate.removed.microphones, deviceUpdate.removed.cameras, deviceUpdate.removed.speakers);

        if (deviceUpdate.removed.microphones.length > 0) {
            for (var i = 0; i < deviceUpdate.removed.microphones.length; i++) {
                mic_.DeviceRemoved(deviceUpdate.removed.microphones[i].id);
            }
        }

        if (deviceUpdate.removed.cameras.length > 0) {
            for (var j = 0; j < deviceUpdate.removed.cameras.length; j++) {
                camera_.DeviceRemoved(deviceUpdate.removed.cameras[j].id);
            }
        }

        transport_.SendWebRTCMessage(deviceUpdate, function() {
            LogInfo("DeviceUpdate sent: " + JSON.stringify(deviceUpdate));
            callback();
        });
    };

    function CheckForDeviceUpdate(callback) {
        if (typeof callback != "function") {
            callback = function() { };
        }
        GetDevices(true, function(devices) {
            var diff = DiffDevices(devices_, devices);
            if (diff.added.length > 0 || diff.removed.length > 0) {
                devices_ = devices;
                SendDevicesUpdated(diff.added, diff.removed, callback);
            } else {
                callback();
            }
        });
    };

    function PollForDevices() {
        if (!devices_) {
            return;
        }
        setTimeout(function() {
            CheckForDeviceUpdate(PollForDevices);
        }, 5 * 1000);
    };

    function ConvertToDeviceInfo(devices, microphones, cameras, speakers) {
        var micLabels = [];
        var camLabels = [];
        var speakerLabels = [];

        for (var i = 0; i < devices.length; i++) {
            var device = {
                id: devices[i].deviceId,
                name: devices[i].label.replace(/\([a-zA-Z0-9]+:[a-zA-Z0-9]+\)/, "") // In windows label comes as Camera(1dead:2code), this is to remove the dead code
            };
            switch(devices[i].kind) {
                case "audioinput":
                    if (micLabels.indexOf(device.name) === -1) {
                        microphones.push(device);
                        micLabels.push(device.name);
                    }
                    break;

                case "videoinput":
                    if (camLabels.indexOf(device.name) === -1) {
                        cameras.push(device);
                        camLabels.push(device.name);
                    }
                    break;

                case "audiooutput":
                    if (speakerLabels.indexOf(device.name) === -1) {
                        speakers.push(device);
                        speakerLabels.push(device.name);
                    }
                    break;
            }
        }
    };

    function SendDeviceEnumerationResponse(devices) {
        var deviceInfo = {
            method: "VidyoWebRTCEnumerateDeviceResponse",
            status: "success",
            microphones: [],
            cameras: [],
            speakers: [],
            shareEnabled: false
        };

        if (devices.length <= 0) {
            deviceInfo.status = "error";
        } else {
            ConvertToDeviceInfo(devices, deviceInfo.microphones, deviceInfo.cameras, deviceInfo.speakers);
        }


        if (devices.length > 0 && deviceInfo.speakers.length <= 0) {
            var defaultSpeaker = {
                id: "default",
                name: "Default"
            };
            deviceInfo.speakers.push(defaultSpeaker);
        }

        transport_.SendWebRTCMessage(deviceInfo, function() {
            LogInfo("DeviceInfo sent: " + JSON.stringify(deviceInfo));
            HandleShareSupportedRequest();
        });

        devices_ = devices;
        if (devices.length > 0) {

            if (window.adapter.browserDetails.browser === "chrome") {
                navigator.mediaDevices.ondevicechange = CheckForDeviceUpdate;
            } else {
                PollForDevices();
            }
        }

    };


    function HandleDeviceEnumerationRequest (data) {

        if (window.adapter.browserDetails.browser === "chrome") {
        } else {
            // For Firefox guest user, store the media stream from device enumeration and use it for startcamera/startmicrophone
            navigator.mediaDevices.enumerateDevices().then(function(devices) {
                var audio = false;
                var video = false;

                devices.forEach(function(device) {
                    if (device.kind === "audioinput") {
                        audio = true;
                    }
                    if (device.kind === "videoinput") {
                        video = true;
                    }
                });

                var constraints = { };

                if (video) {
                    constraints = GetCameraConstraints(data);
                }
                constraints.audio = audio;
                navigator.mediaDevices.getUserMedia(constraints).then(function(s) {
                    if (s.getAudioTracks().length > 0) {
                        var audioStream = s;
                        if (window.adapter.browserDetails.browser === "edge") {
                            audioStream = new MediaStream();
                            audioStream.addTrack(s.getAudioTracks()[0]);
                        }
                        mic_.SetStream(audioStream);
                        MicStarted(audioStream);
                    }

                    if (s.getVideoTracks().length > 0) {
                        var camStream = s;
                        if (window.adapter.browserDetails.browser === "edge") {
                            camStream = new MediaStream();
                            camStream.addTrack(s.getVideoTracks()[0]);
                        }
                        camera_.SetStream(camStream);
                        CameraStarted(camStream);
                    }

                    GetDevices(false, function(devices) {
                        SendDeviceEnumerationResponse(devices);
                    });

                }).catch(function(err) {
                    LogErr("getUserMedia error in DeviceEnumeration: " + JSON.stringify(constraints) + " err:" + err.toString());
                    var restartCameraWithoutConstraints = false;
                    if (err && data.maxResolution) {
                        if (err.message === "Invalid constraint" || err.name === "NotReadableError") {
                            restartCameraWithoutConstraints = true;
                        }
                    }
                    if (restartCameraWithoutConstraints) {
                        delete data.maxResolution;
                        HandleDeviceEnumerationRequest(data);
                    }
                });
            }).catch(function(err) {
                LogErr("enumerateDevice error in DeviceEnumeration err:" + err.toString());
            });
            return;
        }

        GetDevices(true, function(devices) {
            SendDeviceEnumerationResponse(devices);
        });
    };

    function SendShareAdded(shareId) {
        var shareAddedMsg = {
            method: "VidyoWebRTCLocalShareAdded",
            shareId: ""+shareId
        };

        transport_.SendWebRTCMessage(shareAddedMsg, function() {
            LogInfo("ShareAdded sent successfully");
        });
    };

    function SendShareRemoved(shareId, cb) {
        var shareRemovedMsg = {
            method: "VidyoWebRTCLocalShareRemoved",
            shareId: ""+shareId
        };

        transport_.SendWebRTCMessage(shareRemovedMsg, function() {
            LogInfo("ShareRemoved sent successfully");
            cb();
        });
    };

    function periodicExtensionCheck() {
        setTimeout(function() {
            if (IsShareEnabled()) {
                HandleShareSupportedRequest();
            } else {
                periodicExtensionCheck();
            }
        }, 3000);
    };


    function IsShareEnabled() {
        var shareSupport = document.getElementById("vidyowebrtcscreenshare_is_installed") ? true : false;
        if (window.adapter.browserDetails.browser === "firefox" && window.adapter.browserDetails.version >= 52) {
            shareSupport = true;
        }
        return shareSupport;
    }

    function HandleShareSupportedRequest() {
        var shareSupport = IsShareEnabled();
        if (!shareSupport) {
            periodicExtensionCheck();
            return;
        }

        if (window.adapter.browserDetails.browser === "chrome") {
        } else {
            window.postMessage({type: "VidyoAddDomain", domain: window.location.hostname}, "*");
        }

        var shareUpdate = GetDevicesUpdateObject();
        shareUpdate.shareEnabled = true;
        transport_.SendWebRTCMessage(shareUpdate, function() {
            LogInfo("ShareUpdate sent: " + JSON.stringify(shareUpdate));
        });
    };

    function SendCandidate (streamId, candidate) {
        var candidateMsg = {
            method: "VidyoWebRTCIceCandidate",
            streamId: streamId,
            candidate: candidate
        };

        transport_.SendWebRTCMessage(candidateMsg, function() {
            LogInfo("Candidate send success - " + JSON.stringify(candidate));
        });
    };

    function SendLocalOffer(currentState, nextState, op) {
        var offer = offer_;
        var offerMsg = {
            method: "VidyoWebRTCOfferSdp",
            sdp: offer.sdp,
            clientType: window.adapter.browserDetails.browser
        };

        transport_.SendWebRTCMessage(offerMsg, function() {
            LogInfo("PeerConnection Offer sent = " + offer.sdp);
            if (offer_ !== null) {
                offer_ = null;
                peerConnection_.setLocalDescription(offer).
                then(function() {
                    LogInfo("PeerConnection setLocalDescription success");
                }).
                catch(function(err) {
                    LogErr("PeerConnection setLocalDescription failed " + err.toString());
                    console.log(err);
                });
            }
        });
    };

    function GetLocalOffer() {

        LogInfo("PeerConnection onnegotiationneeded callstate=" + callState_);

        var offerConstraints = {
            offerToReceiveAudio: remoteAudio_.length,
            offerToReceiveVideo: maxSubscriptions_ + 1
        };

        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            offerConstraints.offerToReceiveVideo = true; // Chrome doesn't accept numbers for these constraints
            offerConstraints.offerToReceiveAudio = true; // Chrome doesn't accept numbers for these constraints
        }

        cameraState_ = camera_.GetState();
        micState_ = mic_.GetState();

        peerConnection_.createOffer(offerConstraints).
        then(function(offer) {
            offer_ = offer;
            InvokeStateMachine("gotOffer");
        }).
        catch(function(err) {
            LogErr("PeerConnection CreateOffer failed " + err.toString());
            console.log(err);
        });
    };

    function CheckForDevices(currentState, nextState, op, data) {
        // Don't wait for devices to start on firefox.
        // Let them start later and trigger renegotiation
        if (window.adapter.browserDetails.browser === "chrome") {
            if (camera_.IsStarting()) {
                LogInfo("Waiting for camera");
                return;
            }

            if (mic_.IsStarting()) {
                LogInfo("Waiting for mic");
                return;
            }
        }

        InvokeStateMachine("startCall");
    };

    function HandleAdditionalPc(i) {
        var offerConstraints = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };

        try {
            additionalPc_[i] = new RTCPeerConnection(peerConnectionConstraints_);
            additionalIceCandidates_[i] = [];
        } catch(e) {
            console.error(e);
            LogErr("RTCPeerConnection exception: " + suppressFilePaths(e.stack) + " " + suppressFilePaths(e));
            SendUninitialize();
        }

        if (i >= remoteAudio_.length) {
            offerConstraints.offerToReceiveAudio = false;
        }

        additionalPc_[i].createOffer(offerConstraints).
        then(function(offer) {
            additionalOffers_[i] = offer;
            var offerMsg = {
                method: "VidyoWebRTCAdditionalOfferSdp",
                streamId: i+1,
                sdp: offer.sdp
            };
            LogInfo("PeerConnection [" + (i+1) + "] Offer: " + offer.sdp);
            transport_.SendWebRTCMessage(offerMsg, function() {
                if (additionalOffers_[i]) {
                    var o = additionalOffers_[i];
                    additionalOffers_[i] = null;
                    additionalPc_[i].setLocalDescription(o).
                    then(function() {
                        LogInfo("PeerConnection [" + (i+1) + "] setLocalDescription success ");
                    }).catch(function(err) {
                        LogErr("PeerConnection [" + (i+1) + "] setLocalDescription failed " + err.toString());
                        console.log(err);
                    });
                }
            });
        }).catch(function(err) {
            LogErr("PeerConnection [" + (i+1) + "] CreateOffer failed " + err.toString());
            console.log(err);
        });

        additionalPc_[i].onicecandidate = function(evt) {
            if (evt.candidate) {
                SendCandidate((i+1), evt.candidate);
            } else {
                LogInfo("PeerConnection [" + (i+1) + "] onicecandidate done");
            }
        };

        additionalPc_[i].onicegatheringstatechange = function(state) {
            var iceGatheringState = state.target.iceGatheringState;
            LogInfo("PeerConnection [" + (i+1) + "] onicegatheringstatechange - " + iceGatheringState);
            if (iceGatheringState !== "new") {
                LogInfo("PeerConnection [" + (i+1) + "] onicegatheringstatechange applying iceCandidates " + additionalIceCandidates_[i].length);
                additionalIceCandidates_[i].forEach(function(iceCandidate) {
                    additionalPc_[i].addIceCandidate(iceCandidate).
                    then(function() {
                        LogInfo("HandleIceCandidate in icegatheringstatchange[" + (i+1) + "] set success - "  + JSON.stringify(iceCandidate));
                    }).
                    catch(function(err){
                        LogErr("HandleIceCandidatein icegatheringstatchange [" + (i+1) + "] set failed - " + JSON.stringify(iceCandidate) + " " + err.stack + " " + err.toString());
                        console.log(err);
                    });
                });
                additionalIceCandidates_[i].length = 0;
            }
        };

        additionalPc_[i].oniceconnectionstatechange = function(state) {
            LogInfo("PeerConnection [" + (i+1) + "] oniceconnectionstatechange - " + state.target.iceConnectionState);
            if (state.target.iceConnectionState === "closed" || state.target.iceConnectionState === "failed") {
                transport_.SendWebRTCMessage({method: "VidyoWebRTCIceFailed"}, function() {
                });
            }
        };

        additionalPc_[i].onsignalingstatechange = function(state) {
            var sigState = (state.target ? state.target.signalingState : state);
            LogInfo("PeerConnection [" + (i+1) + "] onsignalingstatechange - " + sigState);
        };

        additionalPc_[i].onaddstream = HandleOnAddStream;
    };

    function HandleOnAddStream(evt) {
        LogInfo("PeerConnection onaddstream " + evt.stream.id + " audiotracks=" + evt.stream.getAudioTracks().length + " videoTracks=" + evt.stream.getVideoTracks().length);
        if (evt.stream.getAudioTracks().length > 0) {
            if (currentAudioIndex_ < remoteAudio_.length) {
                LogInfo("PeerConnection onaudiostream [" + currentAudioIndex_ + "] - audio src: " + evt.stream.id);
                remoteAudio_[currentAudioIndex_].srcObject = evt.stream;
                currentAudioIndex_++;
                if (showAudioMeters_ && currentAudioIndex_ === remoteAudio_.length) {
                    StartRemoteAudioLevelDetection();
                }
            } else {
                LogErr("PeerConnection onaudiotrack more than " + remoteAudio_.length + " received");
            }
        } else if (evt.stream.getVideoTracks().length > 0) {
            videoStreams_.push(evt.stream);
            // videoElems_[videoStreams_.length-1].srcObject = evt.stream;

            // Check if we are waiting for video, this happens when someone is already in the call, the element and sources are added, but the stream comes later
            for (var sourceId in streamMapping_) {
                if (sourceId !== PREVIEW_SOURCE_ID && streamMapping_[sourceId].hasOwnProperty("streamId")) {
                    var streamId = streamMapping_[sourceId]["streamId"];
                    if (videoStreams_[streamId]) {
                        CreateSourceIdEntryInStreamMappingAndAttachVideo({sourceId: sourceId});
                    }
                }
            }
        }
    }

    function HandleOnAddTrack(evt) {
        LogInfo("PeerConnection ontrack ");
        if (evt.track && evt.track.kind === "audio") {
            if (evt.streams && evt.streams.length > 0) {
                if (currentAudioIndex_ < remoteAudio_.length) {
                    LogInfo("PeerConnection onaudiotrack [" + currentAudioIndex_ + "] - audio src: " + evt.streams[0].id);
                    remoteAudio_[currentAudioIndex_].srcObject = evt.streams[0];
                    currentAudioIndex_++;
                    if (showAudioMeters_ && currentAudioIndex_ === remoteAudio_.length) {
                        StartRemoteAudioLevelDetection();
                    }
                } else {
                    LogErr("PeerConnection onaudiotrack more than " + remoteAudio_.length + " received");
                }
            } else {
                LogErr("PeerConnection ontrack - audio No streams present !!");
            }
        } else if (evt.track && evt.track.kind === "video") {
            videoStreams_.push(evt.streams[0]);

            // Check if we are waiting for video, this happens when someone is already in the call, the element and sources are added, but the stream comes later
            for (var sourceId in streamMapping_) {
                if (sourceId !== PREVIEW_SOURCE_ID && streamMapping_[sourceId].hasOwnProperty("streamId")) {
                    var streamId = streamMapping_[sourceId]["streamId"];
                    if (videoStreams_[streamId]) {
                        CreateSourceIdEntryInStreamMappingAndAttachVideo({sourceId: sourceId});
                    }
                }
            }
        }
    }

    function HandleVideoElementPause(e) {
        var videoElem = e.target;
        var streamId = parseInt(videoElem.dataset.playIndex, 10);
        LogInfo("Paused: " + streamId);
        videoElem.play();
    }

    function HandleVideoElementPlay(e) {
        var videoElem = e.target;
        var streamId = parseInt(videoElem.dataset.playIndex, 10);
        LogInfo("Play: " + streamId);
        transport_.SendWebRTCMessage({method: "VidyoWebRTCKeyFrameRequest", streamId: streamId}, function() { });
    }

    function HandleStartCall (currentState, nextState, op) {

        var data = startCallData_;
        startCallData_ = null;
        maxSubscriptions_ = data.maxSubscriptions;

        // Get the peer connection constraints
        peerConnectionConstraints_.iceServers.length = 0;
        peerConnectionConstraints_.iceServers.push({urls : "stun:" + data.stunServer});

        if (data.turnCreds) {
            var urls = [];
            for (var k = 0; k < data.turnCreds.urls.length; k++) {
                if (window.adapter.browserDetails.browser === "edge" && data.turnCreds.urls[k].indexOf("turns:") === 0) {
                    LogInfo("Ignoring turns server for Edge: " + data.turnCreds.urls[k]);
                } else {
                    urls.push(data.turnCreds.urls[k]);
                }
            }
            data.turnCreds.urls = urls;
            peerConnectionConstraints_.iceServers.push(data.turnCreds);
        }

        // Create the peer connection
        peerConnection_ = new RTCPeerConnection(peerConnectionConstraints_);
        peerConnectionStats_.Start(peerConnection_, remoteAudio_.length, maxSubscriptions_ + 1);

        peerConnection_.onicecandidate = function(evt) {
            if (evt.candidate) {
                if (iceCandidateTimeout_ !== null) {
                    LogInfo("PeerConnection onicecandidate clearing candidate timeout");
                    clearTimeout(iceCandidateTimeout_);
                    iceCandidateTimeout_ = null;
                }
                SendCandidate(1, evt.candidate);
            } else {
                LogInfo("PeerConnection onicecandidate done");
            }
        };

        peerConnection_.oniceconnectionstatechange = function(state) {
            LogInfo("PeerConnection oniceconnectionstatechange - " + state.target.iceConnectionState);
            if (state.target.iceConnectionState === "closed" || state.target.iceConnectionState === "failed") {
                transport_.SendWebRTCMessage({method: "VidyoWebRTCIceFailed"}, function() {
                });
            } else if (state.target.iceConnectionState === "completed" &&
                        additionalPc_.length === 0 &&
                        (window.adapter.browserDetails.browser === "edge")) {
                LogInfo("PeerConnection oniceconnectionstatechange connected - Starting Additional PeerConnections");
                for (var i = 1; i < maxSubscriptions_ + 1; i++) {
                    HandleAdditionalPc(i);
                }
            }
        };

        peerConnection_.onsignalingstatechange = function(state) {
            var sigState = (state.target ? state.target.signalingState : state);
            LogInfo("PeerConnection onsignalingstatechange - " + sigState);
            if (sigState === "stable") {
                InvokeStateMachine("signalingStable");
            }

        };

        if (window.adapter.browserDetails.browser === "edge") {
            peerConnection_.onaddstream = HandleOnAddStream;
        } else {
            peerConnection_.ontrack = HandleOnAddTrack;
        }


        // We will trigger manually since multiple stream operations may be required before sending the offer
        // peerConnection_.onnegotiationneeded = GetLocalOffer;

        var cameraStream = camera_.GetStreamAndTrack().stream;
        var micStream = mic_.GetStreamAndTrack().stream;

        if ( (window.adapter.browserDetails.browser == "firefox" && window.adapter.browserDetails.version >= "59") ) {     
            const transceiverOptions = {
                direction: "recvonly"
            };
            const localTransceiverOptions = {
                direction: "sendrecv"
            };
            if (micStream && micStream.getAudioTracks().length) {
                peerConnectionAudioTransceiver_ =  peerConnection_.addTransceiver( micStream.getAudioTracks()[0], localTransceiverOptions);
            } else {
                peerConnectionAudioTransceiver_ =  peerConnection_.addTransceiver( 'audio', localTransceiverOptions);
            }

            for (let i = 0; i < remoteAudio_.length - 1; ++i ) {
                peerConnection_.addTransceiver( "audio", transceiverOptions );
            }

            if (cameraStream && cameraStream.getVideoTracks().length) {
                peerConnectionVideoTransceiver_ =   peerConnection_.addTransceiver( cameraStream.getVideoTracks()[0], localTransceiverOptions);
            }   else {
                peerConnectionVideoTransceiver_ =   peerConnection_.addTransceiver( 'video', localTransceiverOptions);
            }
            for (let i = 0; i < maxSubscriptions_; ++i ) {
                peerConnection_.addTransceiver( "video", transceiverOptions );
            }
        } else {
            if (cameraStream) {
                AddVideoStream(cameraStream);
            } else if (window.adapter.browserDetails.browser === "safari") {
                peerConnection_.addTransceiver("video");
            }

            if (micStream) {
                AddAudioStream(micStream);
            } else if (window.adapter.browserDetails.browser === "safari") {
                peerConnection_.addTransceiver("audio");
            }
        }
        if (iceCandidateTimeout_ !== null) {
            clearTimeout(iceCandidateTimeout_);
            iceCandidateTimeout_ = null;
        }

        iceCandidateTimeout_ = setTimeout(function() {
            LogErr("No ICE candidates generated, disconnecting the call");
            InvokeStateMachine("stopCall");
        }, 30 * 1000);
        GetLocalOffer();

    };

    function HandleStopCall(currentState, nextState, op, data) {

        previousWindowSizes_ = { windows: []};
        offer_ = null;

        if (iceCandidateTimeout_ !== null) {
            clearTimeout(iceCandidateTimeout_);
            iceCandidateTimeout_ = null;
        }


        HandleStopLocalShare();
        StopStream(localShareStream_, true, true);

        peerConnectionStats_.Stop();
        if (peerConnection_ !== null) {
            // Firefox throws an exception when trying to close peer connection in offline mode
            try {
                peerConnection_.oniceconnectionstatechange = undefined;
                peerConnection_.close();
            } catch(e) {
            }
            peerConnection_ = null;
        }

        StopRemoteAudioLevelDetection();
        currentAudioIndex_ = 0;

        var sourceIds = Object.keys(streamMapping_);
        for (var i = 0; i < sourceIds.length; i++) {
            var sourceId = sourceIds[i];
            var streamId = streamMapping_[sourceId].streamId;
            var type = streamMapping_[sourceId].type;
            if (type !== STREAM_TYPE_PREVIEW) {
                var elemId = streamMapping_[sourceId].elemId;
                if (elemId && layoutEngine_.hasOwnProperty(elemId)) {
                    layoutEngine_[elemId].hide(type, streamId);
                }
                delete streamMapping_[sourceId];
            }
        }
        additionalPc_.length = 0;
        additionalOffers_.length = 0;

        currentAudioIndex_ = 0;

        videoStreams_.length = 0;
        var cameraStream = camera_.GetStreamAndTrack().stream;
        videoStreams_.push(cameraStream);
    };

    function HandleAnswerSdp(currentState, nextState, op, data) {
        SetAnswerSdp(data, function(){});
    };

    function SetAnswerSdp(data, callback) {
        if (peerConnection_ === null) {
            LogInfo("peerConnection SetAnswerSdp pc null, call stopped");
            callback(false);
            return;
        }

        LogInfo("SetAnswerSdp: " + data.sdp);

        var br = resolutionMap_.hasOwnProperty(maxResolution_) ? resolutionMap_[maxResolution_].br: "768";

        data.sdp = data.sdp.replace(/a=mid:video\r\n/g, "a=mid:video\r\nb=AS:" + br + "\r\n");

        var SetRemoteDescription = function () {
            if (peerConnection_ === null) {
                LogInfo("peerConnection HandleAnswerSdp pc null, call stopped");
                callback(false);
                return;
            }

            var remoteSdp = new RTCSessionDescription({type: "answer", sdp: data.sdp});
            peerConnection_.setRemoteDescription(remoteSdp).
            then(function() {
                LogInfo("PeerConnection setRemoteDescription success");
                callback(true);
            }).
            catch(function(err) {
                LogErr("PeerConnection setRemoteDescription failed " + err.toString());
                console.log(err);
                callback(false);
            });
        };

        if (offer_ !== null) {
            LogInfo("PeerConnection HandleAnswerSdp localOffer not yet set, setting  local offer first");
            var o = offer_;
            offer_ = null;
            peerConnection_.setLocalDescription(o).
            then(function() {
                LogInfo("PeerConnection setLocalDescription success");
                SetRemoteDescription();
            }).
            catch(function(err) {
                LogErr("PeerConnection setLocalDescription failed " + err.toString());
                console.log(err);
            });
        } else {
            SetRemoteDescription();
        }

    };

    function HandleIceCandidate(data) {
        delete data.candidate.call;
        var iceCandidate;

        if (data.candidate.candidate && data.candidate.candidate.length > 0 && data.candidate.sdpMid && data.candidate.sdpMid.length > 0) {
            iceCandidate = new RTCIceCandidate(data.candidate);
        } else {
            if (window.adapter.browserDetails.browser === "edge") {
                iceCandidate = new RTCIceCandidate(null);
            } else {
                return;
            }
        }

        if (data.streamId === 1 && peerConnection_ !== null) {
            peerConnection_.addIceCandidate(iceCandidate).
            then(function() {
                LogInfo("HandleIceCandidate set success - "  + JSON.stringify(iceCandidate));
            }).
            catch(function(err){
                LogErr("HandleIceCandidate set failed - " + JSON.stringify(iceCandidate) + " " + err.stack + " " + err.toString());
                console.log(err);
            });
        } else if (data.streamId === 0 && localSharePeerConnection_ !== null) {
            localSharePeerConnection_.addIceCandidate(iceCandidate).
            then(function() {
                LogInfo("Share: HandleIceCandidate set success - " + JSON.stringify(data.candidate));
            }).
            catch(function(err){
                LogErr("Share: HandleIceCandidate set failed - " + JSON.stringify(data.candidate) + " " + err.stack + " " + err.toString());
                console.log(err);
            });
        } else {
            if (additionalPc_[data.streamId-1] !== null) {
                if (additionalPc_[data.streamId-1].iceGatheringState !== "new") {
                    additionalPc_[data.streamId-1].addIceCandidate(iceCandidate).
                    then(function() {
                        LogInfo("HandleIceCandidate [" + (data.streamId) + "] set success - "  + JSON.stringify(iceCandidate));
                    }).
                    catch(function(err){
                        LogErr("HandleIceCandidate [" + (data.streamId) + "] set failed - " + JSON.stringify(iceCandidate) + " " + err.stack + " " + err.toString());
                        console.log(err);
                    });
                } else {
                    LogInfo("HandleIceCandidate [" + (data.streamId) + "]  queuing since icegathering state - "  + additionalPc_[data.streamId-1].iceGatheringState);
                    additionalIceCandidates_[data.streamId-1].push(iceCandidate);
                }
            } else {
                LogErr("Additional PeerConnection not found " + (data.streamId));
            }
        }
    };

    function HandleStreamMappingChanged(data) {

        var i = 0;
        var oldSourceIds = Object.keys(streamMapping_);
        var newSourceIds = [];
        var streamIds = [];

        for (i = 0; i < data.streams.length; i++) {

            var sourceId = data.streams[i].sourceId;
            newSourceIds.push(sourceId);

            var streamId = data.streams[i].streamId;
            streamIds.push(streamId);

            var viewId = data.streams[i].viewId;
            var name = data.streams[i].sourceName || "Video" + i;
            var type = data.streams[i].type;

            if (type === STREAM_TYPE_PREVIEW) {
                if (!streamMapping_.hasOwnProperty(PREVIEW_SOURCE_ID) || streamMapping_[PREVIEW_SOURCE_ID].elemId !== viewId || streamMapping_[PREVIEW_SOURCE_ID].name !== name) {
                    CreateSourceIdEntryInStreamMappingAndAttachVideo({sourceId: PREVIEW_SOURCE_ID, streamId: 0, attached: false, type: STREAM_TYPE_PREVIEW, name: name, elemId: viewId});
                }
            } else {
                CreateSourceIdEntryInStreamMappingAndAttachVideo({sourceId: sourceId, streamId: streamId, elemId: viewId, type: type, name: name});
            }
        }

        var deletedSourceIds = oldSourceIds.filter(function(i) { return newSourceIds.indexOf(i) === -1 });

        LogInfo("Deleting source ids: " + JSON.stringify(deletedSourceIds));
        for (i = 0; i < deletedSourceIds.length; i++) {
            var sourceId = deletedSourceIds[i];
            if (streamMapping_.hasOwnProperty(sourceId)) {
                var streamId = streamMapping_[sourceId].streamId;
                var type = streamMapping_[sourceId].type;
                if (streamIds.indexOf(streamId) === -1) {
                    var elemId = streamMapping_[sourceId].elemId;
                    if (elemId && layoutEngine_.hasOwnProperty(elemId)) {
                        layoutEngine_[elemId].hide(type, streamId);
                    } else {
                        LogInfo("Hide: elemId/LayoutEngine not found elemId = " + elemId);
                    }
                }
                delete streamMapping_[sourceId];
            }
        }

    };

    function GetCameraConstraints(data) {
        var constraints = {
            video: {
                frameRate: {min: 20},
            }
        };

        if (data.camera) {
            constraints.video.deviceId = data.camera;
        }

        if (data.maxResolution) {
            maxResolution_ = data.maxResolution;
            var resolution = resolutionMap_[maxResolution_];

            if (window.adapter.browserDetails.browser === "safari") {
                switch(maxResolution_) {
                    // safari expects 4:3 aspect ratio for resolutions less than 540p and supports fewer resolutions
                    case "480p":
                    case "360p":
                        resolution.w = 640;
                        resolution.h = 480;
                        break;

                    case "270p":
                    case "240p":
                    case "180p":
                        resolution.w = 320;
                        resolution.h = 240;
                        break;
                }
            }

            constraints.video.width = {ideal: resolution.w };
            constraints.video.height = {ideal: resolution.h };

            if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge" || window.adapter.browserDetails.browser === "safari") {
            } else {
                // Firefox doesn't seem to be handling constraints
                // So if resolution is greater than 480p, don't specify constraints
                if (constraints.video.height.ideal >= 480) {
                    delete constraints.video.width;
                    delete constraints.video.height;
                }
            }
        }

        return constraints;
    };


    function HandleStartCamera(data) {
        var constraints = GetCameraConstraints(data);
        camera_.StartDevice(data.camera, constraints);
    };

    function HandleStopCamera(data) {
        camera_.StopDevice(data.camera);
    };

    function HandleStartMicrophone(data) {
        var constraints = {
            audio: {
                deviceId: data.microphone
            }
        };

        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            mic_.StartDevice(data.microphone, constraints);
        } else {
            // In firefox, if a camera pemission window is open and we do getUsermedia for mic,
            // that permission window is overwritten with this mic permission window
            // and there is no way for the user to grant camera access after granting mic access
            // Hence if waiting for camera access, do not show mic access and wait for camera started
            if (camera_.IsStarting()) {
                mic_.SetDevice(data.microphone, constraints);
            } else {
                mic_.StartDevice(data.microphone, constraints);
            }
        }
    };

    function HandleStopMicrophone(data) {
        mic_.StopDevice(data.microphone);
    };


    function HandleStartSpeaker(data) {
        if (typeof remoteAudio_[0].setSinkId === "function") {
            for (var r = 0; r < remoteAudio_.length; r++) {
                remoteAudio_[r].setSinkId(data.speaker);
            }
        }
    };

    function HandleStartLocalShare(data) {
        LogInfo("Starting Local Screen Share in call state " + callState_ + " count=" + localShareStream_.length);

        if (callState_ === CALLSTATE_IDLE) {
            HandleStopCall();
            return;
        }

        localSharePeerConnection_ = new RTCPeerConnection(peerConnectionConstraints_);
        peerConnectionStats_.SetSharePeerConnection(localSharePeerConnection_);

        localSharePeerConnection_.onicecandidate = function(evt) {
            if (evt.candidate) {
                SendCandidate(0, evt.candidate);
            } else {
                LogInfo("SharePeerConnection onicecandidate done");
            }
        };

        localSharePeerConnection_.oniceconnectionstatechange = function(state) {
            LogInfo("SharePeerConnection oniceconnectionstatechange - " + state.target.iceConnectionState);
        };

        localSharePeerConnection_.onsignalingstatechange = function(state) {
            LogInfo("SharePeerConnection onsignalingstatechange - " + (state.target ? state.target.signalingState : state));
        };

        localSharePeerConnection_.ontrack = function(evt) {
            LogInfo("SharePeerConnection ontrack");
        };

        localSharePeerConnection_.onnegotiationneeded = function() {
            LogInfo("SharePeerConnection onnegotiationneeded callState=" + callState_);

            if (callState_ === CALLSTATE_IDLE) {
                HandleStopCall();
                return;
            }

            var offerConstraints = {
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
            };

            localSharePeerConnection_.createOffer(offerConstraints).
            then(function(offer) {
                var offerMsg = {
                    method: "VidyoWebRTCShareOfferSdp",
                    sdp: offer.sdp
                };
                localShareOffer_ = offer;
                transport_.SendWebRTCMessage(offerMsg, function() {
                    LogInfo("SharePeerConnection Offer sent = " + offer.sdp);

                    if (localShareOffer_ !== null) {
                        localShareOffer_ = null;
                        localSharePeerConnection_.setLocalDescription(offer).
                        then(function() {
                            LogInfo("SharePeerConnection setLocalDescription success");
                        }).
                        catch(function(err) {
                        LogErr("SharePeerConnection setLocalDescription failed " + err.toString());
                        console.log(err);
                        });
                    }
                });
            }).
            catch(function(err) {
                LogErr("SharePeerConnection CreateOffer failed " + err.toString());
                console.log(err);
            });
        };

        localSharePeerConnection_.addStream(localShareStream_[0]);
    };

    function HandleShareAnswerSdp(data) {
        LogInfo("ShareAnswerSdp: " + data.sdp);
        var SetShareRemoteDescription = function() {

            if (localSharePeerConnection_ === null) {
                LogInfo("localSharePeerConnection HandleShareAnswerSdp pc null, call stopped");
                return;
            }

            var remoteSdp = new RTCSessionDescription({type: "answer", sdp: data.sdp});
            localSharePeerConnection_.setRemoteDescription(remoteSdp).
            then(function() {
                LogInfo("SharePeerConnection setRemoteDescription success");
            }).
            catch(function(err) {
                LogErr("SharePeerConnection setRemoteDescription failed " + err.toString());
                console.log(err);
            });
        };

        if (localShareOffer_ !== null) {
            LogInfo("SharePeerConnection HandleShareAnswerSdp localOffer not yet set");
            var o = localShareOffer_;
            localShareOffer_ = null;
            localSharePeerConnection_.setLocalDescription(o).
            then(function() {
                LogInfo("SharePeerConnection setLocalDescription success");
                SetShareRemoteDescription();
            }).
            catch(function(err) {
                LogErr("SharePeerConnection setLocalDescription failed " + err.toString());
                console.log(err);
            });
        } else {
            SetShareRemoteDescription();
        }
    };

    function HandleStopLocalShare(data) {
        localShareOffer_ = null;
        localShareElement_ = null;
        shareSelectedCallback_ = null;

        if (localShareId_ > 0) {
            SendShareRemoved(localShareId_, function() {
            });

            // To indicate that share has been removed and the next share add will go with localShareId_ + 1
            localShareId_ = -localShareId_;
        }

        if (pendingRequestId_ !== -1) {
            window.postMessage({type: "VidyoCancelRequest", requestId: pendingRequestId_}, "*");
            pendingRequestId_ = -1;
        }


        if (localShareStream_.length > 0) {
            localShareStream_[0].oninactive = undefined;
            StopStream([localShareStream_[0]], true, true);
            localShareStream_ = localShareStream_.slice(1);
            LogInfo("StopLocalShare count=" + localShareStream_.length);
        }

        peerConnectionStats_.SetSharePeerConnection(null);
        if (localSharePeerConnection_ !== null) {
            localSharePeerConnection_.close();
            localSharePeerConnection_ = null;

        }
    };

    function HandleStreamStatus(data) {
        for (var s = 0; s < data.streams.length; s++) {
            var streamId = data.streams[s].streamId;
            var status = data.streams[s].status == 0 ? "stalled" : "started";

            var elemId = getElemId(streamId);
            if (elemId && layoutEngine_.hasOwnProperty(elemId)) {
                layoutEngine_[elemId].videoStatus(STREAM_TYPE_VIDEO, streamId, status);
            }
        }
    };

    function HandleAdditionalAnswerSdp(data) {
        var i = data.streamId - 1;
        LogInfo("PeerConnection [" + (i+1) + "] Answer: " + data.sdp);
        var SetRemoteSdp = function() {
            if (additionalPc_[i]) {
                var remoteSdp = new RTCSessionDescription({type: "answer", sdp: data.sdp});
                additionalPc_[i].setRemoteDescription(remoteSdp).
                then(function() {
                    LogInfo("PeerConnection [" + (i+1) + "] setRemoteDescription success");
                }).
                catch(function(err) {
                    LogErr("PeerConnection [" + (i+1) + "] setRemoteDescription failed " + err.toString());
                    console.log(err);
                });
            } else {
                LogErr("PeerConnection not found for " + i);
            }
        };

        if (additionalOffers_[i]) {
            LogInfo("PeerConnection [" + (i+1) + "] HandleAnswerSdp localOffer not yet set, setting  local offer first");
            var o = additionalOffers_[i];
            additionalOffers_[i] = null;
            additionalPc_[i].setLocalDescription(o).
            then(function() {
                LogInfo("PeerConnection [" + (i+1) + "] setLocalDescription success ");
                SetRemoteSdp();
            }).catch(function(err) {
                LogErr("PeerConnection [" + (i+1) + "] setLocalDescription failed " + err.toString());
                console.log(err);
            });
        } else {
            SetRemoteSdp();
        }
    };
    function RemoveAudioStream() {
        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            peerConnection_.removeStream(micStream_);
            StopStream([micStream_], true, true);
            micStream_ = null;
        } else if (window.adapter.browserDetails.browser == "firefox" && window.adapter.browserDetails.version >= "59") {
            if(peerConnectionAudioTransceiver_) {
                peerConnectionAudioTransceiver_.sender.replaceTrack(null);
            }
        } else { //firefox (older) and safari
            var senders = peerConnection_.getSenders();
            for (var i = 0; i < senders.length; i++) {
                var track = senders[i].track;
                if (track && track.kind === "audio") {
                   peerConnection_.removeTrack(senders[i]);
                }
            }
        }
    };

    function AddAudioStream(micStream) {
        micStream_ = micStream;
        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            peerConnection_.addStream(micStream_);
        } else if (window.adapter.browserDetails.browser == "firefox" && window.adapter.browserDetails.version >= "59") {
           if(peerConnectionAudioTransceiver_ && micStream.getAudioTracks().length) {
                peerConnectionAudioTransceiver_.sender.replaceTrack(micStream.getAudioTracks()[0]);
            }
        } else { //firefox (older) and safari
            peerConnection_.addTrack(micStream_.getAudioTracks()[0], micStream_);
        }
    };

    function RemoveVideoStream() {
        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            var localStreams = peerConnection_.getLocalStreams();
            for(var i = 0; i < localStreams.length; i++) {
                var stream = localStreams[i];
                if (stream.getVideoTracks().length > 0) {
                    peerConnection_.removeStream(stream);
                    StopStream([stream], true, true);
                }
            }
            videoStreams_[0] = null;
        } else if (window.adapter.browserDetails.browser == "firefox" && window.adapter.browserDetails.version >= "59") {
            if(peerConnectionVideoTransceiver_) {
                peerConnectionVideoTransceiver_.sender.replaceTrack(null);
            }
        } else { //firefox (older) and safari
            var senders = peerConnection_.getSenders();
            for (var i = 0; i < senders.length; i++) {
                var track = senders[i].track;
                if (track && track.kind === "video") {
                    peerConnection_.removeTrack(senders[i]);
                }
            }   
        }
    };

    function AddVideoStream(cameraStream) {
        if (window.adapter.browserDetails.browser === "chrome" || window.adapter.browserDetails.browser === "edge") {
            peerConnection_.addStream(cameraStream);
        } else if (window.adapter.browserDetails.browser == "firefox" && window.adapter.browserDetails.version >= "59"){ //firefox and safari
            if(peerConnectionVideoTransceiver_ && cameraStream.getVideoTracks().length) {
                peerConnectionVideoTransceiver_.sender.replaceTrack(cameraStream.getVideoTracks()[0]);
            }
        } else { //firefox (older) and safari
            peerConnection_.addTrack(cameraStream.getVideoTracks()[0], cameraStream);
        }
    };

    function AddRemoveStreams() {
        var cameraCase = camera_.DiffState(cameraState_);
        var micCase = mic_.DiffState(micState_);

        LogInfo("AddRemoveStreams camera=" + cameraCase + " mic=" + micCase);

        if (cameraCase === "stopped" || cameraCase === "restarted") {
            RemoveVideoStream();
        }

        if (cameraCase === "started" || cameraCase === "restarted") {
             AddVideoStream(camera_.GetStreamAndTrack().stream);
        }

        if (micCase === "stopped" || micCase === "restarted") {
            RemoveAudioStream();
        }

        if (micCase === "started" || micCase === "restarted") {
            AddAudioStream(mic_.GetStreamAndTrack().stream);
        }

        GetLocalOffer();
    };


    this.setRendererType = function(type) {
        rendererType = type;
        var msg = {
            method: "VidyoWebRTCSetRendererType",
            type: type
        };
        transport_.SendWebRTCMessage(msg, function() {
            LogInfo("VidyoWebRTCSetRendererType sent: " + JSON.stringify(msg));
        });
    };

    this.setDisplayCropped = function(viewId, displayCropped) {
        LogInfo("SetDisplayCropped: viewId=" + viewId + " displayCropped=" + displayCropped);
        layoutEngineAttrs_[viewId] = displayCropped;
    };

    this.showViewLabel = function(viewId, showLabel) {
        LogInfo("ShowViewLabel: viewId=" + viewId + " showLabel=" + showLabel);
        if (layoutEngine_.hasOwnProperty(viewId)) {
            layoutEngine_[viewId].showViewLabel(showLabel);
        }
    };

    this.showAudioMeters = function(viewId, showAudioMeters) {
        LogInfo("ShowAudioMeters: viewId=" + viewId + " showAudioMeters=" + showAudioMeters_ + " " + showAudioMeters);
        showAudioMeters_ = showAudioMeters;

        if (showAudioMeters) {
            StartLocalAudioLevelDetection();
            StartRemoteAudioLevelDetection();
        } else {
            StopLocalAudioLevelDetection();
            StopRemoteAudioLevelDetection();
        }

        if (layoutEngine_.hasOwnProperty(viewId)) {
            layoutEngine_[viewId].showAudioMeters(showAudioMeters);
        }
    };

    this.callback = function(data) {
        LogInfo("Callback - " + data.method);
        switch(data.method) {
            case "VidyoWebRTCEnumerateDeviceRequest":
                HandleDeviceEnumerationRequest(data);
            break;

            case "VidyoWebRTCStartCall":
                startCallData_ = data;
                InvokeStateMachine("startCall");
            break;

            case "VidyoWebRTCStopCall":
                InvokeStateMachine("stopCall");
            break;

            case "VidyoWebRTCAnswerSdp":
                InvokeStateMachine("gotAnswer", data);
            break;

            case "VidyoWebRTCIceCandidate":
                HandleIceCandidate(data);
            break;

            case "VidyoWebRTCStreamMappingChanged":
                HandleStreamMappingChanged(data);
            break;

            case "VidyoWebRTCStartCamera":
                HandleStartCamera(data);
            break;

            case "VidyoWebRTCStopCamera":
                HandleStopCamera(data);
            break;

            case "VidyoWebRTCStartSpeaker":
                HandleStartSpeaker(data);
            break;

            case "VidyoWebRTCStopSpeaker":
                // No-op
            break;

            case "VidyoWebRTCStartMicrophone":
                HandleStartMicrophone(data);
            break;

            case "VidyoWebRTCStopMicrophone":
                HandleStopMicrophone(data);
            break;

            case "VidyoWebRTCStartLocalShare":
                HandleStartLocalShare(data);
            break;

            case "VidyoWebRTCShareAnswerSdp":
                HandleShareAnswerSdp(data);
            break;

            case "VidyoWebRTCStopLocalShare":
                HandleStopLocalShare(data);
            break;

            case "VidyoWebRTCStreamStatus":
                HandleStreamStatus(data);
            break;

            case "VidyoWebRTCInitRenderer":
                if (layoutEngine_.hasOwnProperty(data.viewId)) {
                    layoutEngine_[data.viewId].uninitialize();
                    delete layoutEngine_[data.viewId];
                    LogInfo("LayoutEngine: " + JSON.stringify(Object.keys(layoutEngine_)));
                }
                var displayCropped = layoutEngineAttrs_.hasOwnProperty(data.viewId) ? layoutEngineAttrs_[data.viewId] : false;
                layoutEngine_[data.viewId] = new LayoutEngine(data.viewId);
                layoutEngine_[data.viewId].initialize(rendererType, displayCropped);
                layoutEngine_[data.viewId].showAudioMeters(showAudioMeters_);
            break;

            case "VidyoWebRTCSelectShare":
                SelectShare(function(status) {
                    if (status) {
                        localShareId_ = -localShareId_ + 1;
                        SendShareAdded(localShareId_);
                    }
                });
            break;
            case "VidyoWebRTCAdditionalAnswerSdp":
                HandleAdditionalAnswerSdp(data);
            break;

            case "VidyoWebRTCAudioStreamMapping":
                UpdateAudioLevel(data.audioId, 0);
                remoteAudioStreamIdMapping_[data.audioId] = data.streamId;
            break;
        }
    };


    function getElemId(streamId) {
        for (var sourceId in streamMapping_) {
            if (streamMapping_[sourceId].streamId === streamId) {
                return streamMapping_[sourceId].elemId;;
            }
        }
        LogInfo("GetElemId " + streamId + " NOT FOUND");
        return "";
    };

    function ShareGetUserMedia(constraints) {
        navigator.mediaDevices.getUserMedia(constraints).
        then(function(str) {
            LogInfo("Got Local Share Stream count=" + localShareStream_.length + " id=" + str.id);
            localShareStream_.push(str);
            if (localShareElement_) {
                localShareElement_.srcObject = str;
                localShareElement_.dataset.streamId = str.id;
            }

            str.oninactive = function() {
                LogInfo("SharePeerConnection share stream ended");
                localShareStream_.length = 0;
                HandleStopLocalShare();
            };
            if (shareSelectedCallback_) {
                shareSelectedCallback_(true);
            } else {
                LogErr("ShareGetUserMedia shareSelectedCallback_ null");
            }
        }).
        catch(function(err) {
            LogErr("Local Share Stream error" + err.toString());
            console.log(err);
            if (shareSelectedCallback_) {
                shareSelectedCallback_(false);
            } else {
                LogErr("ShareGetUserMedia error shareSelectedCallback_ null");
            }
        });
    };

    function SelectShare(cb) {
        if (localShareId_ > 0) {
            LogInfo("SelectShare: Share already added with id " + localShareId_);
            cb(false);
            return;
        }
        if (window.adapter.browserDetails.browser === "chrome") {
            if (pendingRequestId_ === -1) {
                shareSelectedCallback_ = cb;
                window.postMessage({ type: "VidyoRequestGetWindowsAndDesktops"}, "*");
            } else {
                LogErr("Pending request for StartLocalShare");
                cb(false);
            }
        } else {
            var constraints = {
                video : {
                    mediaSource: "window",
                    mozMediaSource: "window",
                    height: {max: resolutionMap_[maxShareResolution_].h},
                    width: {max: resolutionMap_[maxShareResolution_].w},
                    frameRate: {max: maxShareFrameRate_}
                }
            };

            shareSelectedCallback_ = cb;
            ShareGetUserMedia(constraints);
        }
    };

    function WindowMessageHandler(event) {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data.type === "VidyoRequestId") {
            LogInfo("VidyoRequestId - " + event.data.requestId);
            pendingRequestId_ = event.data.requestId;
        }

        if (event.data.type === "VidyoOutEventSourceId") {
            pendingRequestId_ = -1;

            if (event.data.sourceId === "") { // The user clicked cancel
                if (shareSelectedCallback_) {
                    LogInfo("ShareGetUserMedia User Cancelled");
                    shareSelectedCallback_(false);
                } else {
                    LogErr("ShareGetUserMedia cancel shareSelectedCallback_ null");
                }
                return;
            }

            var width = 1920;
            var height = 1080;

            var constraints = {
                video:  { mandatory:
                            {
                                chromeMediaSource: "desktop",
                                chromeMediaSourceId: event.data.sourceId,
                                maxWidth: resolutionMap_[maxShareResolution_].w,
                                maxHeight: resolutionMap_[maxShareResolution_].h,
                                maxFrameRate: maxShareFrameRate_
                            }
                        }
            };
            ShareGetUserMedia(constraints);
        }
    };

    window.addEventListener("message", WindowMessageHandler);

    function SendUninitialize() {
        callState_ = CALLSTATE_IDLE;
        HandleStopCall();

        camera_.StopDevice();
        mic_.StopDevice();
        StopStream([micStream_], true, true);
        micStream_ = null;

        var uninitMsg = {
            method: "VidyoWebRTCUninitialize"
        };
        transport_.SendWebRTCMessage(uninitMsg, function() {
            LogInfo("VidyoWebRTCUninitialize success");
        });

        for (var v in layoutEngine_) {
            layoutEngine_[v].uninitialize();
            delete layoutEngine_[v];
        }
        layoutEngineAttrs_ = {};

        window.removeEventListener("message", WindowMessageHandler);

        // Do something here so that the uninitialize message reaches the server
        var j = 0;
        for (var i = 0; i < 500; i++) {
            j++;
        }
    };

    window.addEventListener("unload", SendUninitialize);

    this.Uninitialize = function() {
        SendUninitialize();
    };

}

/** Layout Engine **/
function LayoutEngine(viewId) {
    var NUM_ELEMENTS = 9;

    var SELF_VIEW_DOCK = "Dock";
    var SELF_VIEW_PIP = "PIP";

    var LAYOUT_MODE_PREFERRED = "preferred";
    var LAYOUT_MODE_GRID = "grid";

    var SELF_FRAME_ID = "_vidyoSelfFrame";
    var REMOTE_FRAME_ID = "_vidyoRemoteFrame";

    var SELF_NAME_ID = "_vidyoSelfName";
    var REMOTE_NAME_ID = "_vidyoRemoteName";


    var layoutEngineCss = "                                        \
        .videoContainer {                                          \
            position: relative;                                    \
            width: 100%;                                           \
            height: 100%;                                          \
            overflow: hidden;                                      \
        }                                                          \
                                                                   \
        .videoContainer .frame {                                   \
            display: none;                                         \
            position: absolute;                                    \
            top: 0;                                                \
            right: 0;                                              \
            bottom: 0;                                             \
            left: 0;                                               \
            overflow: hidden;                                      \
            background-color: #202020;                             \
        }                                                          \
                                                                   \
        .videoContainer .video video {                             \
            width: 100%;                                           \
            height: 100%;                                          \
            object-fit: cover;                                     \
        }                                                          \
                                                                   \
        .videoContainer .share video {                             \
            width: 100%;                                           \
            height: 100%;                                          \
        }                                                          \
                                                                   \
        .videoContainer .selfview video {                          \
            transform: scaleX(-1);                                 \
        }                                                          \
                                                                   \
        .videoContainer .frame .label {                            \
            position: absolute;                                    \
            bottom: 10px;                                          \
            width: 100%;                                           \
            text-align: left;                                      \
        }                                                          \
                                                                   \
        .videoContainer .frame .label .labelContainer {            \
            height: 100%;                                          \
            display: inline-block;                                 \
            font-size: 0px;                                        \
        }                                                          \
                                                                   \
        .videoContainer .frame .label .labelContainer div {        \
            color: white;                                          \
            background-color: rgba(0, 0, 0, 0.2);                  \
            border-radius: 2px;                                    \
            padding: 3px 15px;                                     \
            height: 100%;                                          \
        }                                                          \
                                                                   \
        .videoContainer .frame .label .audioContainer .level {     \
            width: calc(100% - 20px);                              \
            margin-left: 15px;                                     \
            margin-right: 1px;                                     \
            height: 5px;                                           \
        }                                                          \
                                                                   \
        @media (min-aspect-ratio: 16/9) {                          \
            .videoContainer .share video {                         \
                height: 100%;                                      \
            }                                                      \
        }                                                          \
                                                                   \
        @media (max-aspect-ratio: 16/9) {                          \
            .videoContainer .share video {                         \
                width: 100%;                                       \
                height: 100%;                                      \
            }                                                      \
        } ";

    var layoutEngineStyle = document.createElement("style");
    layoutEngineStyle.type = "text/css";
    layoutEngineStyle.innerHTML = layoutEngineCss;
    document.getElementsByTagName("head")[0].appendChild(layoutEngineStyle);

    var initialized = false;
    var layoutUpdateInterval = -1;
    var FRAME = '<div class="frame video" id="<frameid>"> <video muted autoplay> </video> <div class="label"> <div class="labelContainer"> <div class="guest" id="<nameid>"> </div> </div> <div class="audioContainer" style="display: none;"> <meter class="level" min="0.0" max="100.0"></meter> </div> </div> </div>';

    var currentContext = {
        participantCount: 0,
        participants: new Array(NUM_ELEMENTS).fill(-1),
        selfViewMode: "None",
        numShares: 0,
        poppedOutWindows: new Array(NUM_ELEMENTS).fill(-1),
        width: 0,
        height: 0,
        layoutMode: "grid",
        displayCropped: 2,
        videoSizes: new Array(NUM_ELEMENTS+1) // +1 for the preview element
    };

    var currentLayout = {
        selfViewAttributes: new AttrSet(),
        videoAttributes: getAttrSetArray(NUM_ELEMENTS)
    };

    var logLevel = (VCUtils.params && VCUtils.params.webrtcLogLevel) ? VCUtils.params.webrtcLogLevel : "info";
    function LogInfo (msg) {
        if (logLevel === "info") {
            console.log("" + GetTimeForLogging() + " LayoutEngine[" + viewId + "]: " + msg);
        }
    };


    function LogErr (msg) {
        if (logLevel === "info" || logLevel === "error") {
            console.error("" + GetTimeForLogging() + " LayoutEngine[" + viewId + "]: " + msg);
        }
    };


    function AttrSet() {
        this.display = "none";
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.fontSize = 15;
    }

    function applyLayout(participants, layout) {

        var applyToFrame = function(attr, frame) {
            frame.style.display = attr.display;
            if (attr.display !== "none") {
                var videoElem = frame.getElementsByTagName("video")[0];
                if (videoElem.videoWidth > 0 && videoElem.videoHeight > 0) {
                    VidyoClientResizeToAspectRatio(attr, videoElem.videoWidth, videoElem.videoHeight);
                }
                frame.style.left = attr.x + "px";
                frame.style.top = attr.y + "px";
                frame.style.width = attr.width + "px";
                frame.style.height = attr.height + "px";

                frame.getElementsByClassName("labelContainer")[0].style.fontSize = attr.fontSize + "px";
            }
        };

        var frame = document.getElementById(viewId + SELF_FRAME_ID);
        if (frame) {
            applyToFrame(layout.selfViewAttributes, frame);
        } else {
            LogInfo("applyLayout: frame not found " + (viewId + SELF_FRAME_ID));
        }

        var displayedFrames = new Array(NUM_ELEMENTS).fill(-1);

        var layoutIndex = 0;
        for (var i = 0; i < NUM_ELEMENTS; i++) {
            if (participants[i] !== -1) {
                displayedFrames[participants[i]] = 1;
                frame = document.getElementById(viewId + REMOTE_FRAME_ID + participants[i]);
                if (frame) {
                    frame.dataset.index = participants[i];
                    applyToFrame(layout.videoAttributes[layoutIndex++], frame);
                } else {
                    LogInfo("applyLayout: frame not found " + (viewId + REMOTE_FRAME_ID + participants[i]));
                }
            }
        }

        for (i = 0; i < NUM_ELEMENTS; i++) {
            if (displayedFrames[i] === -1) {
                frame = document.getElementById(viewId + REMOTE_FRAME_ID + i);
                if (frame) {
                    applyToFrame({display: "none"}, frame);
                } else {
                    LogInfo("applyLayout: frame not found " + (viewId + REMOTE_FRAME_ID + i));
                }
            }
        }
    }

    /**
        Input: context: {
            participantCount,
            participants: <array of indices to indicate which participant is in which frame in the layout>
            selfViewMode: "Dock|PIP|None",
            numShares: number of shares
            width:
            height:
            layoutMode: "grid|preferred",
        }

        Output: layout: {
            videoAttributes []: {
                display: "block|none",
                x:
                y:
                width:
                height:
                fontSize:
            },
            shareAttrs: {
                // Same as videoAttributes
            },
            selfViewAttributes: {
                // Same as videoAttributes
            }
        }
    **/

    function getAttrSetArray(n) {
        var ret = [];
        for (var i = 0; i < n; i++) {
            ret.push(new AttrSet());
        }

        return ret;
    }

    function calculateLayout (context, layout) {
        var numLayoutFrames = context.participantCount;

        if (context.selfViewMode === SELF_VIEW_DOCK) {
            numLayoutFrames += 1;
        }

        var i;
        if (context.width === 0 || context.height === 0 || numLayoutFrames === 0) {
            layout.shareAttrs = new AttrSet();
            layout.selfViewAttributes = new AttrSet();
            layout.videoAttributes = getAttrSetArray(NUM_ELEMENTS);
            applyLayout(context.participants, layout);
            return;
        }

        var videoMetrics = VidyoClientGetLayout(numLayoutFrames, context.numShares, context.width, context.height, context.displayCropped);
        var fontSize;

        for (i = 0; i < context.participantCount && i < NUM_ELEMENTS; i++) {
            var attrs = layout.videoAttributes[i];
            var metrics = videoMetrics[i];
            attrs.display = "block";
            attrs.x = metrics.x;
            attrs.y = metrics.y;
            attrs.width = metrics.width;
            attrs.height = metrics.height;
            attrs.fontSize = Math.floor(attrs.height * 7 / 100);
        }

        for (i = context.participantCount; i < NUM_ELEMENTS; i++) {
            layout.videoAttributes[i].display = "none";
        }

        var selfViewAttrs = layout.selfViewAttributes;

        var selfViewMetrics;
        switch (context.selfViewMode) {
            case SELF_VIEW_DOCK:
                selfViewMetrics = videoMetrics[videoMetrics.length - 1];
                selfViewAttrs.display = "block";
                selfViewAttrs.x = selfViewMetrics.x;
                selfViewAttrs.y = selfViewMetrics.y;
                selfViewAttrs.width = selfViewMetrics.width;
                selfViewAttrs.height = selfViewMetrics.height;
                break;
            case SELF_VIEW_PIP:
                selfViewAttrs.display = "block";
                var width = Math.floor(context.width/4);
                var height = Math.floor(context.height/4);
                if (width > height) {
                    width = Math.floor((16 * height)/9);
                } else {
                    height = Math.floor((9 * width)/16);
                }
                selfViewAttrs.x = context.width - width;
                selfViewAttrs.y = context.height - height;
                selfViewAttrs.width = width;
                selfViewAttrs.height = height;
                break;
            default:
                selfViewAttrs.display = "none";
        }

        selfViewAttrs.fontSize = Math.floor(selfViewAttrs.height * 7 / 100);
        applyLayout(context.participants, layout);
    };

    function init(rendererType, displayCropped) {
        LogInfo("init: viewId=" + viewId + " type=" + rendererType + " displayCropped=" + displayCropped);
        var view = document.getElementById(viewId);
        if (!view) {
            LogErr("init: NULL viewId");
            return false;
        }

        if (rendererType === RENDERER_TYPE_TILES) {
            NUM_ELEMENTS = 1;
            if (displayCropped) {
                currentContext.displayCropped = 1;
            } else {
                currentContext.displayCropped = 0;
            }
        } else {
            currentContext.displayCropped = 2;
        }

        var layoutTemplate = '<div class="videoContainer">';

        var i = 0;
        for (i = 0; i < NUM_ELEMENTS; i++ ) {
            layoutTemplate += FRAME.replace("<frameid>", viewId + REMOTE_FRAME_ID + i).replace("<nameid>", viewId + REMOTE_NAME_ID + i);
        }

        layoutTemplate += FRAME.replace('"frame video"', '"frame video selfview"').replace("<frameid>", viewId + SELF_FRAME_ID).replace("<nameid>", viewId + SELF_NAME_ID);
        layoutTemplate += "</div>";

        view.innerHTML = layoutTemplate;

        var videos = view.getElementsByTagName("video");
        for (i = 0; i < videos.length; i++) {
            videos[i].addEventListener("dblclick", popOut);
            currentContext.videoSizes[i] = {w: 0, h: 0};
        }

        currentContext.width = view.clientWidth;
        currentContext.height = view.clientHeight;

        layoutUpdateInterval = window.setInterval(function() {
            if (initialized) {
                var v = document.getElementById(viewId);
                if (!v) {
                    return;
                }

                var w = v.clientWidth;
                var h = v.clientHeight;
                var videoSizeChanged = false;
                var videos = v.getElementsByTagName("video");
                for (var i = 0; i < videos.length; i++) {
                    if (currentContext.videoSizes[i].w !== videos[i].videoWidth ||
                        currentContext.videoSizes[i].h !== videos[i].videoHeight) {
                        currentContext.videoSizes[i].w = videos[i].videoWidth;
                        currentContext.videoSizes[i].h = videos[i].videoHeight;
                        videoSizeChanged = true;
                    }
                }
                if (currentContext.width !== w || currentContext.height !== h || videoSizeChanged) {
                    currentContext.width = w;
                    currentContext.height = h;
                    calculateLayout(currentContext, currentLayout);
                }
            }
        }, 3000);
        return true;
    };

    this.initialize = function(rendererType, displayCropped) {
        if (!initialized) {
            initialized = init(rendererType, displayCropped);
        }
    };

    this.uninitialize = function() {
        LogInfo("uninitialize: " + viewId + " " + layoutUpdateInterval);
        if (layoutUpdateInterval !== -1) {
            clearInterval(layoutUpdateInterval);
            layoutUpdateInterval = -1;
        }
        initialized = false;
    };

    function setPreviewMode() {
        if (currentContext.selfViewMode !== SELF_VIEW_DOCK && currentContext.selfViewMode !== SELF_VIEW_PIP) {
            return;
        }

        // For single participant, self view is dock
        // For more than 1 participants, self view is dock
        // For 1 participant, self view is pip
        if (currentContext.participantCount <= 0 || currentContext.participantCount > 1) {
            currentContext.selfViewMode = SELF_VIEW_DOCK;
        } else {
            currentContext.selfViewMode = SELF_VIEW_PIP;
        }
    };

    function showPreview (name) {
        currentContext.selfViewMode = SELF_VIEW_DOCK;
        setPreviewMode();
        calculateLayout(currentContext, currentLayout);
        var elem = document.getElementById(viewId + SELF_NAME_ID);
        if (elem) {
            elem.innerHTML = name;
        }
    };

    function hidePreview() {
        currentContext.selfViewMode = "None";
        var elem = document.getElementById(viewId + SELF_NAME_ID);
        if (elem) {
            elem.innerHTML = "";
        }
        calculateLayout(currentContext, currentLayout);
    };

    function isShareFrame(frame) {
        if (frame && frame.className.indexOf(" share") !== -1) {
            return true;
        }
        return false;
    };

    function isVideoFrame(frame) {
        if (frame && frame.className.indexOf(" video") !== -1) {
            return true;
        }
        return false;
    };

    function setShareFrame(frame) {
        if (frame) {
            frame.className = frame.className.replace(" video", " share");
        }
    };

    function setVideoFrame(frame) {
        if (frame) {
            frame.className = frame.className.replace(" share", " video");
        }
    };

    function showVideo(type, index, name) {
        var frame = document.getElementById(viewId + REMOTE_FRAME_ID + index);
        var elem = document.getElementById(viewId + REMOTE_NAME_ID + index);

        if (elem) {
            elem.innerHTML = name;
        }

        if (currentContext.participants.indexOf(index) !== -1) {

            if (type === STREAM_TYPE_SHARE && isVideoFrame(frame)) {
                LogInfo("showVideo: switch from video to share index " + index);
                hideVideo(STREAM_TYPE_VIDEO, index);
                showVideo(type, index, name);
            } else if (type === STREAM_TYPE_VIDEO && isShareFrame(frame)) {
                LogInfo("showVideo: switch from share to video index " + index);
                hideVideo(STREAM_TYPE_SHARE, index);
                showVideo(type, index, name);
            } else {
                LogInfo("showVideo: " + type + " index " + index + " already shown");
            }
            return;
        }

        LogInfo("showVideo: " + type + " index " + index + " name " + name);

        currentContext.participantCount += 1;
        if (type === STREAM_TYPE_SHARE) {
            currentContext.numShares += 1;
            for (var i = 0; i < NUM_ELEMENTS; i++) {
                if (currentContext.participants[i] === -1) {
                    currentContext.participants[i] = index;
                    break;
                }
            }
            setShareFrame(frame);
        } else {
            for (var i = NUM_ELEMENTS - 1; i >= 0; i--) {
                if (currentContext.participants[i] === -1) {
                    currentContext.participants[i] = index;
                    break;
                }
            }
            setVideoFrame(frame);
        }

        setPreviewMode(); // self view mode may change based on the number of participants
        calculateLayout(currentContext, currentLayout);
    };

    function hideVideo(type, index) {
        var i = 0;
        var elem = document.getElementById(viewId + REMOTE_NAME_ID + index);
        if (elem) {
            elem.innerHTML = "";
        }

        var isInLayout = (currentContext.participants.indexOf(index) !== -1);
        var poppedOut = (currentContext.poppedOutWindows[index] !== -1);

        if (!isInLayout && !poppedOut) {
            LogErr("hide: " + type + " index " + index + " already hidden");
            return;
        }

        LogInfo("hideVideo: " + type + " index " + index + " InLayout=" + isInLayout + " poppedOut=" + poppedOut);

        // If the window is popped out, close it
        if (poppedOut) {
            var wnd = currentContext.poppedOutWindows[index];
            currentContext.poppedOutWindows[index] = -1; // so that the unload handler is not processed
            wnd.close();
        }

        // decrement and remove only if it is in the layout, else it is already decremented when popped out
        if (isInLayout) {
            currentContext.participantCount -= 1;
            if (type === STREAM_TYPE_SHARE) {
                currentContext.numShares -= 1;
            }

            var pos = -1;
            for (i = 0; i < NUM_ELEMENTS; i++) {
                if (currentContext.participants[i] === index) {
                    currentContext.participants[i] = -1;
                    pos = i;
                    break;
                }
            }

            // Move the video elements to the end of the array so that the top slots are open for share
            // This is because the layout engine calculates the layout windows with preferred windows
            // followed by grid windows
            if (type === STREAM_TYPE_VIDEO) {
                for (i = pos; i > currentContext.numShares; i--) {
                    currentContext.participants[i] = currentContext.participants[i-1];
                }
                currentContext.participants[currentContext.numShares] = -1;
            } else if (type === STREAM_TYPE_SHARE) {
                // Do not leave empty spaces at the top of the array followed by share for eg [-1, S, ..]
                // The next show will occupy the top space causing it to be shown in the preferred window
                for (i = pos; i < currentContext.numShares; i++) {
                    currentContext.participants[i] = currentContext.participants[i+1];
                }
                currentContext.participants[currentContext.numShares] = -1;
            }
        }

        setPreviewMode(); // self view mode may change based on the number of participants
        calculateLayout(currentContext, currentLayout);
    };


    function popIn(type, index, name) {
        if (currentContext.poppedOutWindows[index] !== -1) {
            currentContext.poppedOutWindows[index] = -1;
            LogInfo("popIn " + type + " index=" + index + " name=" + name);
            showVideo(type, index, name);
        } else {
            LogInfo("popIn " + type + " index=" + index + " name=" + name + " window closed");
        }
    };

    function popOut(e) {
        var videoElem = e.target;
        var frame = videoElem.parentNode;
        // Only share windows are allowed to popped out, but this can be changed to pop out videos as well
        if (frame && isShareFrame(frame)) {
            var layoutIndex = parseInt(frame.dataset.index, 10);
            var name = document.getElementById(viewId + REMOTE_NAME_ID + layoutIndex).innerHTML;
            var height = videoElem.videoHeight;
            var width = videoElem.videoWidth;

            var src = URL.createObjectURL(videoElem.srcObject);

            LogInfo("popOut share frame with id " + frame.id + " name=" + name + " index=" + layoutIndex + " Res=" + width + "x" + height + " src=" + src);
            hideVideo(STREAM_TYPE_SHARE, layoutIndex);
            currentContext.poppedOutWindows[layoutIndex] = window.open("", "Share - " + name, "width=" + width + ",height=" + height);
            var html = "<html><head><title>Share - " + name + "</title></head><body style=\"background-color: #202020;\"><video autoplay src=\"" + src + "\" style=\"width: 100%; height: 100%;\"></video></body></html>";
            currentContext.poppedOutWindows[layoutIndex].document.write(html);
            currentContext.poppedOutWindows[layoutIndex].addEventListener("beforeunload", popIn.bind(null, STREAM_TYPE_SHARE, layoutIndex, name));
            currentContext.poppedOutWindows[layoutIndex].addEventListener("unload", popIn.bind(null, STREAM_TYPE_SHARE, layoutIndex, name));
        }
    };

    this.getVideoElement = function(type, index) {
        var frame;
        switch (type) {
            case STREAM_TYPE_PREVIEW:
                frame = document.getElementById(viewId + SELF_FRAME_ID);
            break;

            case STREAM_TYPE_SHARE:
            case STREAM_TYPE_VIDEO:
                if (NUM_ELEMENTS <= 1) {
                    index = 1;
                }
                frame = document.getElementById(viewId + REMOTE_FRAME_ID + (index-1));
            break;
        }

        if (frame) {
            return frame.getElementsByTagName("video")[0];
        }

        return frame;
    };

    this.show = function(type, index, name) {
        if (!initialized) {
            LogErr("show: NOT initialized");
            return;
        }
        if (NUM_ELEMENTS <= 1) {
            index = 1;
        }
        LogInfo("show " + type + " " + index + " " + name);
        switch (type) {
            case STREAM_TYPE_PREVIEW:
                showPreview(name);
            break;

            case STREAM_TYPE_SHARE:
            case STREAM_TYPE_VIDEO:
                showVideo(type, index-1, name);
            break;
        }
    };

    this.hide = function(type, index) {
        if (!initialized) {
            LogErr("hide: NOT initialized");
            return;
        }
        LogInfo("hide " + type + " " + index);
        if (NUM_ELEMENTS <= 1) {
            index = 1;
        }
        switch (type) {
            case STREAM_TYPE_PREVIEW:
                hidePreview();
            break;

            case STREAM_TYPE_SHARE:
            case STREAM_TYPE_VIDEO:
                hideVideo(type, index-1);
            break;
        }
    };

    this.videoStatus = function(type, index, status) {
        if (!initialized) {
            LogErr("videoStatus: NOT initialized");
            return;
        }
        LogInfo("videoStatus " + type + " " + index + " " + status);
        if (NUM_ELEMENTS <= 1) {
            index = 1;
        }
        var frame;
        switch (type) {
            case STREAM_TYPE_SHARE:
            case STREAM_TYPE_VIDEO:
                frame = document.getElementById(viewId + REMOTE_FRAME_ID + (index - 1));
            break;
        }

        if (frame) {
            if (status === "stalled") {
                frame.getElementsByTagName("video")[0].load();
            }
        }
    };

    this.showViewLabel = function(showLabel) {
        var display = showLabel ? "block" : "none";
        var view = document.getElementById(viewId);
        if (view) {
            var labels = view.getElementsByClassName("label");
            for (var i = 0; i < labels.length; i++) {
                labels[i].style.display = display;
            }
        }
    };

    this.setAudioLevel = function(type, index, level) {
        if (!initialized) {
            LogErr("setAudioLevels: NOT initialized");
            return;
        }
        // LogInfo("setAudioLevel " + type + " " + index + " " + level);
        if (NUM_ELEMENTS <= 1) {
            index = 1;
        }
        var frame;
        switch (type) {
            case STREAM_TYPE_PREVIEW:
                frame = document.getElementById(viewId + SELF_FRAME_ID);
            break;
            case STREAM_TYPE_SHARE:
            case STREAM_TYPE_VIDEO:
                frame = document.getElementById(viewId + REMOTE_FRAME_ID + (index - 1));
            break;
        }

        if (frame) {
            window.requestAnimationFrame(function() {
                frame.getElementsByClassName("level")[0].value = level;
            });
        }
    };

    this.showAudioMeters = function(showAudioMeter) {
        var display = showAudioMeter ? "block" : "none";
        var view = document.getElementById(viewId);
        if (view) {
            var elems = view.getElementsByClassName("audioContainer");
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.display = display;
            }
        }
    };
}


function VidyoClientTransport(plugInObj, statusChangeHandler, callbackHandler, plugInDivId){

    var transport = null;
    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    var sessionId = randomString(12, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

/* 
Possible args{}
({uiEvent:"create", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants, userData:userData, consoleLogFilter:consoleLogFilter, fileLogFilter:fileLogFilter, fileLogName:fileLogName});
({uiEvent:"constructor", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants, userData:userData, consoleLogFilter:consoleLogFilter, fileLogFilter:fileLogFilter, fileLogName:fileLogName});
({uiEvent:"CreateRendererFromViewId", viewId:viewId, x:x, y:y, width:width, height:height});
({uiEvent:"AssignViewToCompositeRenderer", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants});
({uiEvent:"AssignViewToLocalCamera", viewId:viewId, localCamera:localCamera, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"AssignViewToRemoteCamera", viewId:viewId, remoteCamera:remoteCamera, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"AssignViewToRemoteWindowShare", viewId:viewId, remoteWindowShare:remoteWindowShare, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"HideView", viewId:viewId});
({uiEvent:"SetViewAnimationSpeed", viewId:viewId, speedPercentage:speedPercentage});
({uiEvent:"SetViewBackgroundColor", viewId:viewId, red:red, green:green, blue:blue});
({uiEvent:"ShowAudioMeters", viewId:viewId, showMeters:showMeters});
({uiEvent:"ShowViewAt", viewId:viewId, x:x, y:y, width:width, height:height});
({uiEvent:"ShowViewLabel", viewId:viewId, showLabel:showLabel});
*/
    this.UpdateViewOnDOM = function(args){
        var plugInDivId = args.viewId ? sessionId + "_" + args.viewId : args.viewId;
        var type = "RENDERER";
        if((args.uiEvent.indexOf("create") !== -1) || (args.uiEvent.indexOf("constructor") !== -1) || (args.uiEvent.indexOf("AssignView") !== -1)){
            if(args.viewId){
                var view = VCUtils.jQuery('#' + args.viewId);
                if (view && view.has(".VidyoClientPlugIn").length <= 0) {
                    view.html("<div id='" + plugInDivId + "' vidyoclientplugin_type='" + type + "' class='VidyoClientPlugIn' style='width: 100%; height: 100%;'></div>");
                    if (args.uiEvent.indexOf("AssignViewToLocalCamera") !== -1 || args.uiEvent.indexOf("AssignViewToRemoteCamera") !== -1 || args.uiEvent.indexOf("AssignViewToRemoteWindowShare") !== -1) {
                        transport.GetWebRTCClient().setDisplayCropped(plugInDivId, args.displayCropped);
                    }
                }
            }
        }
        else if (args.uiEvent.indexOf("ShowView") !== -1){
        }
        else if (args.uiEvent.indexOf("HideView") !== -1){
            if(args.viewId){
                VCUtils.jQuery('#' + args.viewId).html('');
            }
        }

        if (args.uiEvent === "constructor" || args.uiEvent === "create") {
            transport = new VidyoClientTransportWebRTC(plugInObj, statusChangeHandler, callbackHandler, plugInDivId, function() {
                if (!args.viewId) {
                    transport.GetWebRTCClient().setRendererType(RENDERER_TYPE_TILES);
                } else {
                    transport.GetWebRTCClient().setRendererType(RENDERER_TYPE_COMPOSITE);
                }
            });
        } else if (args.uiEvent === "SetViewBackgroundColor") {
            if (args.viewId) {
                VCUtils.jQuery('#' + plugInDivId).css("background-color", "rgb(" + args.red + "," + args.green + "," + args.blue + ")");
            }
        } else if (args.uiEvent === "ShowViewLabel") {
            transport.GetWebRTCClient().showViewLabel(plugInDivId, args.showLabel);
        } else if (args.uiEvent === "ShowAudioMeters") {
            transport.GetWebRTCClient().showAudioMeters(plugInDivId, args.showMeters);
        }

        return plugInDivId;
    };

    this.SendMessage = function(data, asyncSuccess, asyncFailure, async){
        return transport.SendMessage(data, asyncSuccess, asyncFailure, async);
    };

    setTimeout(function() { statusChangeHandler({state: "READY", description: "WebRTC successfully loaded"}) }, 100);
}

function VidyoClientTransportWebRTC(plugInObj, statusChangeHandler, callbackHandler, plugInDivId, callback){

    const MAX_RETRIES = 10;
    const WAIT_TIME_BEFORE_RETRY = 400; // first retry after 400 ms, second retry after 800ms, third retry after 1200ms and so on

    var contextObj = plugInObj;
    var statusChangeCallback = statusChangeHandler;
    var receiveCallback = callbackHandler;

    var session = "";
    var callId = "";
    var ms = "";
    var webrtcServer = VCUtils.webRTCServer;
    var requestNum = 1;
    var webrtcClient = new VidyoClientWebRTC(this);
    var connectionState = "CONNECTING";
    var eventsCounter = 1;

    var loggedInTimer = null;

    var requestQueue = {};
    var requestPending = -1;

    var logLevel = (VCUtils.params && VCUtils.params.webrtcLogLevel) ? VCUtils.params.webrtcLogLevel : "info";

    if (logLevel !== "info") {
        window.adapter.disableLog(true);
    }

    var GetTimeForLogging = function() {
        return new Date().toLocaleTimeString();
    };

    var LogInfo = function(msg) {
        if (logLevel === "info") {
            console.log(GetTimeForLogging() + " Transport: " + msg);
        }
    };


    var LogErr = function(msg) {
        if (logLevel === "info" || logLevel === "error") {
            console.error(GetTimeForLogging() + " Transport: " + msg);
        }
    };

    var connectionError = function() {
        if (connectionState === "CONNECTED" || connectionState === "CONNECTING") {
            webrtcClient.Uninitialize();
            connectionState = "DISCONNECTED";
            statusChangeCallback({state: "FAILED", description: "Disconnected from the WebRTC Server"});
        }
    };

    var leftPad = function(num, size) {
        var s = num + "";
        while (s.length < size) {
            s = "0" + s;
        }
        return s;
    };

    var TransportMessageSequential = function(url, params, async, successCb, doLog) {
        requestQueue[leftPad(params.requestNum, 9)] = {url: url, params: params, async: async, successCb: successCb, doLog: doLog};
        CheckAndSendMessage();

    };

    var CheckAndSendMessage = function() {
        var requests = Object.keys(requestQueue);
        if (connectionState === "CONNECTING") {
            LogInfo("CheckAndSendMessage: Waiting for CONNECTED QLen=" + requests.length);
            return;
        }

        if (requests.length <= 0) {
            return;
        }

        var requestNumbers = requests.sort().splice(0, 10);
        var currentRequestNumber = requestQueue[requestNumbers[0]].params.requestNum;
        if (requestPending >= 0 && requestPending !== currentRequestNumber) {
            LogInfo("CheckAndSendMessage: Waiting for " + requestPending + " currentRequestNumber=" + currentRequestNumber + " QLen=" + requests.length);
        } else {
            var params = [];
            var callbacks = [];
            var destination = requestQueue[requestNumbers[0]].params.destination;
            var url = requestQueue[requestNumbers[0]].url;
            var async = requestQueue[requestNumbers[0]].async;

            requestNumbers.forEach(function(r) {
                var request = requestQueue[r];
                delete request.params.destination;
                delete request.params.session;
                params.push(request.params);
                callbacks.push(request.successCb);
                delete requestQueue[r];
            });

            var data = {
                destination: destination,
                params: params,
                session: session
            };
            var retryCount = 0;
            requestPending = params[0].requestNum;
            LogInfo("CheckAndSendMessage: Sending: " + requestPending + " - " + params[params.length-1].requestNum + " QLen=" + requests.length);

            var TransportMessageSuccess = function(a) {
                requestPending = -1;
                for (var i = 0; i < a.length; i++) {
                    callbacks[i](JSON.parse(a[i]));
                }
                CheckAndSendMessage();
            };

            var TransportMessageError = function(err) {
                if (err === "error" || err === "abort") {
                    if (retryCount <= MAX_RETRIES) {
                        retryCount++;
                        var timeout = retryCount * WAIT_TIME_BEFORE_RETRY;
                        LogInfo("CheckAndSendMessage [" + requestPending + "] err=" + err + " retryCount=" + retryCount + " retrying after " + timeout + "ms");
                        setTimeout(function() {
                            TransportMessage(url, data, async, TransportMessageSuccess, TransportMessageError, true);
                        }, timeout);
                    } else {
                        connectionError();
                    }
                } else {
                    connectionError();
                }
            };
      
            TransportMessage(url, data, async, TransportMessageSuccess, TransportMessageError, true);
        }
    };

    var TransportMessage = function(url, params, async, successCb, errorCb, doLog) {
        if (connectionState !== "CONNECTING" && connectionState !== "CONNECTED") {
            LogErr("Transport Message in invalid state " + connectionState);
            return;
        }
        var start = Date.now();
        var paramsStr = JSON.stringify(params);
        var logStr = webrtcServer + url + ":" + paramsStr;
        if (doLog) {
            LogInfo("Req: async:" + async + " - " + logStr);
        }
        var oReq = new XMLHttpRequest();
        oReq.open("post", webrtcServer + url, async);

        oReq.onload = function() {
            if (oReq.status !== 200) {
                LogErr(logStr + " " + oReq.status + " " + oReq.statusText);
                errorCb(oReq.status + " " + oReq.statusText);
                return;
            }

            var logRespStr = oReq.responseText.replace(/VidyoRoomFeedbackGetRoomPropertiesResult.*VIDYO_ROOMGETPROPERTIESRESULT/, "VidyoRoomFeedbackGetRoomPropertiesResult*****VIDYO_ROOMGETPROPERTIESRESULT");
            if (doLog) {
                LogInfo("Resp: [" + (Date.now() - start) + "] " + logStr + " response: " + logRespStr);
            }

            try {
                var response = JSON.parse(oReq.responseText);
                successCb(response);
                return;
            } catch (e) {
                LogErr("TransportMessage: " + logStr + " Exception - " + e.stack + " " +  e);
                // statusChangeCallback({error: e});
            }
        };

        oReq.onerror = function(e) {
            LogErr(logStr + " onerror: " +  e);
            errorCb("error");
        };

        oReq.onabort = function(e) {
            LogErr(logStr + " onabort: " +  e);
            errorCb("abort");
        };

        oReq.send(paramsStr);

    };


    var HandleEvents = function(evts) {
        for (var i = 0; i < evts.length; i++) {
            switch(evts[i].destination) {
                case "VidyoWebRTC":
                    webrtcClient.callback(evts[i].data);
                break;

                case "VidyoClient":
                    try {
                        receiveCallback(contextObj, JSON.parse(evts[i].data));
                    } catch (e) {
                        LogErr("HandleEvents: VidyoClient error: " + e.stack + " " + e);
                        // statusChangeCallback({error: e});
                    }
                    break;
            }
        }
    };

    var LongPoll = function(retryCnt) {
        if (retryCnt === undefined) {
            retryCnt = 0;
            eventsCounter++;
        }

        TransportMessage("/events", {session: session, count: eventsCounter}, true,
            function(resp) {
                HandleEvents(resp);
                LongPoll();
            }, function(err) {
                if (err === "error" || err === "abort") {
                    if (retryCnt <= MAX_RETRIES) {
                        retryCnt++;
                        var timeout = retryCnt * WAIT_TIME_BEFORE_RETRY;
                        LogInfo("LongPoll err=" + err + " retrying after " + timeout + "ms");
                        setTimeout(function() {
                            LongPoll(retryCnt);
                        }, timeout);
                    } else {
                        connectionError();
                    }
                } else {
                    connectionError();
                }
            }, true);
    };

    var Initialize = function() {
        TransportMessage("/initialize", {version: VCUtils.version}, true, function(resp) {
            session = resp.session;
            callId = resp.callId;
            ms = resp.ms;
            if (resp.host.length > 0) {
                webrtcServer = "https://" + resp.host;
            }
            connectionState = "CONNECTED";
            LongPoll();
            CheckAndSendMessage();
            callback();
            }, function() {
                connectionState = "DISCONNECTED";
                statusChangeCallback({state: "FAILED", description: "Could not initialize WebRTC transport"});
            }, true);
    };

    function SendVidyoClientMessage(data, asyncSuccess, async, reqNum) {
        var request = {
            destination: "VidyoClient",
            data: data,
            requestNum: reqNum,
            session: session
        };
        var ret;
        var localAsync = false;
        if (async === true && typeof asyncSuccess === "function") { 
            localAsync = async;
        }

        TransportMessageSequential("/transport", request, localAsync,
            function(response) {
                ret = response;
                if (localAsync) {
                    asyncSuccess(response);
                }
                return response;
            }, true);

        return ret;
    }

    this.SendMessage = function(data, asyncSuccess, asyncFailure, async){

        if (connectionState !== "CONNECTED" && connectionState !== "CONNECTING") {
            LogErr("SendMessage in invalid state " + connectionState);
            return {result: "error"};
        }

        return SendVidyoClientMessage(data, asyncSuccess, async, requestNum++);
    };

    function SendWebRTCMessageWithRetry(params, cb, retryCount) {
        var request = {
            destination: "VidyoWebRTC",
            data: JSON.stringify(params),
            session: session
        };
        TransportMessage("/transport", request, true, cb, function(err) {
            if (err === "error" || err === "abort") {
                if (retryCount <= MAX_RETRIES) {
                    retryCount++;
                    var timeout = retryCount * WAIT_TIME_BEFORE_RETRY;
                    LogInfo("SendWebRTCMessage err=" + err + " retrying after " + timeout + "ms");
                    setTimeout(function() {
                        SendWebRTCMessageWithRetry(params, cb, retryCount);
                    }, timeout);
                } else {
                    connectionError();
                }
            } else {
                connectionError();
            }
        }, params.method !== 'VidyoWebRTCStats');
    };

    this.SendWebRTCMessage = function(params, cb) {
        if (connectionState !== "CONNECTED") {
            LogErr("SendMessage in invalid state " + connectionState);
            return false;
        }

        SendWebRTCMessageWithRetry(params, cb, 0);
        return true;
    };

    this.SendLogs = function(logs, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("post", webrtcServer + "/uploadlogs?callId="+callId+"&mediaserver="+ms, true);

        oReq.onload = function() {
            cb(true);
        };

        oReq.onerror = function(e) {
            LogErr("SendLogs: onerror: " +  e);
            cb(false);
        };

        oReq.onabort = function(e) {
            LogErr("SendLogs: onabort: " +  e);
            cb(false);
        };


        oReq.send(logs);
    };

    this.GetWebRTCClient = function() {
        return webrtcClient;
    };


    this.Uninitialize = function() {
        webrtcClient.Uninitialize();
        connectionState = "DISCONNECTED";
        statusChangeCallback({state: "DISCONNECTED", description: "Disconnected from WebRTC Server"});
    };

    Initialize();
}

w.VidyoClientTransport = VidyoClientTransport;

})(window);

