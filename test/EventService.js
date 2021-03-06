// Generated by CoffeeScript 1.8.0
(function() {
  'use strict';
  var Event, EventService, callBackA, channelA, cleanAllEvts, evtService, nameA, priorityA, priorityDefault, testEvtArr, _registerEvent;

  EventService = require('../src/EventService.js');

  Event = require('../src/Event.js');

  testEvtArr = [];

  nameA = 'nameA';

  channelA = 'channelA';

  evtService = void 0;

  callBackA = void 0;

  priorityDefault = 1;

  priorityA = 2;

  _registerEvent = function(evtArgs) {
    var evt;
    evt = evtService.on(evtArgs);
    testEvtArr.push(evt);
    return evt;
  };

  cleanAllEvts = function() {
    testEvtArr.forEach(function(evt) {
      return evtService.off(evt);
    });
    return testEvtArr = [];
  };

  describe('EventService', function() {
    describe('Class definition', function() {
      return it('EventService API should be defined', function() {
        expect(EventService).not.to.be.undefined;
        expect(EventService.prototype.on).not.to.be.undefined;
        expect(EventService.prototype.off).not.to.be.undefined;
        return expect(EventService.prototype.trigger).not.to.be.undefined;
      });
    });
    return describe('API', function() {
      beforeEach(function() {
        callBackA = sinon.spy();
        return evtService = new EventService();
      });
      afterEach(function() {
        cleanAllEvts();
        return evtService = void 0;
      });
      describe('EventService on()', function() {
        it('should accept minimum arguments / event name and callback', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            callBack: callBackA
          });
          expect(evt).not.to.be.undefined;
          expect(evt instanceof Event).to.be["true"];
          expect(evt.name).to.equal(nameA);
          expect(evt.callBack).to.equal(callBackA);
          expect(evt.callBack.callCount).to.equal(0);
          expect(evt.priority).to.equal(priorityDefault);
          return expect(evt.channel).to.equal(void 0);
        });
        it('should accept full arguments / event name, callback, channel and priority', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: callBackA,
            priority: priorityA
          });
          expect(evt).not.to.be.undefined;
          expect(evt instanceof Event).to.be["true"];
          expect(evt.name).to.equal(nameA);
          expect(evt.channel).to.equal(channelA);
          expect(evt.callBack).to.equal(callBackA);
          expect(evt.callBack.callCount).to.equal(0);
          return expect(evt.priority).to.equal(priorityA);
        });
        it('should throw if name is not string', function() {
          var fn;
          fn = function() {
            return evtService.on({
              name: 1
            });
          };
          return expect(fn).to["throw"];
        });
        return it('should throw if name or callback are missing', function() {
          var missingClbkFunc, missingNameClbkFunc, missingNameFunc;
          missingNameClbkFunc = function() {
            return evtService.on();
          };
          missingNameFunc = function() {
            return evtService.on({
              callBack: function() {}
            });
          };
          missingClbkFunc = function() {
            return evtService.on({
              name: nameA
            });
          };
          expect(missingNameClbkFunc).to["throw"];
          expect(missingNameFunc).to["throw"];
          return expect(missingClbkFunc).to["throw"];
        });
      });
      describe('EventService off()', function() {
        it('should remove event from default channel', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off(evt2);
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        it('should remove event from default channel based on selector filter', function() {
          var callCount, params;
          params = {
            priority: 1,
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          params.priority = 2;
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off({
            selector: function(e) {
              return e.priority === 2;
            }
          });
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
        it('should remove event from default channel based on event name', function() {
          var callCount, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          params.name = 'anotherEventName';
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evtService.off({
            name: nameA
          });
          evtService.trigger({
            name: nameA
          });
          expect(callBackA.callCount).to.equal(callCount);
          evtService.trigger({
            selector: function(e) {
              return e.priority === 1;
            }
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
        it('should remove event from defined channel', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off(evt2);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        it('should remove event from defined channel based on priority filter', function() {
          var callCount, params;
          params = {
            priority: 2,
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          params.priority = 3;
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(3);
          evtService.off({
            selector: function(e) {
              return e.priority === 2;
            }
          });
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 2);
        });
        return it('should remove event from defined channel based on event name', function() {
          var callCount, params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          params.name = 'anotherEventName';
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evtService.off({
            name: nameA,
            channel: channelA
          });
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          expect(callBackA.callCount).to.equal(callCount);
          evtService.trigger({
            channel: channelA,
            prioritySelector: function(e) {
              return e.priority === priorityDefault;
            }
          });
          return expect(callBackA.callCount).to.equal(callCount + 1);
        });
      });
      return describe('EventService trigger()', function() {
        it('should trigger event registered on default channel', function(done) {
          _registerEvent({
            name: nameA,
            callBack: function() {
              return done();
            }
          });
          return evtService.trigger({
            name: nameA
          });
        });
        it('should trigger event registered on defined channel', function(done) {
          _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: function() {
              return done();
            }
          });
          return evtService.trigger({
            name: nameA,
            channel: channelA
          });
        });
        it('should trigger events based on priority', function(done) {
          var ctr;
          ctr = 0;
          _registerEvent({
            name: nameA,
            callBack: function() {
              expect(ctr).to.equal(11);
              return done();
            }
          });
          _registerEvent({
            name: nameA,
            priority: 2,
            callBack: function() {
              expect(ctr).to.equal(1);
              return ctr += 10;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 3,
            callBack: function() {
              expect(ctr).to.equal(0);
              return ctr++;
            }
          });
          return evtService.trigger({
            name: nameA
          });
        });
        it('should trigger events filtered on selector', function() {
          var ctr;
          ctr = 0;
          _registerEvent({
            name: nameA,
            callBack: function() {
              return ctr++;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 2,
            callBack: function() {
              return ctr += 10;
            }
          });
          _registerEvent({
            name: nameA,
            priority: 3,
            callBack: function() {
              return ctr += 100;
            }
          });
          _registerEvent({
            name: 'anotherEventName',
            priority: 3,
            callBack: function() {
              return ctr += 1000;
            }
          });
          evtService.trigger({
            selector: function(e) {
              return e.name === nameA;
            }
          });
          expect(ctr).to.equal(111);
          ctr = 0;
          evtService.trigger({
            name: nameA,
            selector: function(e) {
              return e.priority === 3;
            }
          });
          expect(ctr).to.equal(100);
          ctr = 0;
          evtService.trigger({
            name: nameA,
            selector: function(e) {
              return e.priority >= 2;
            }
          });
          expect(ctr).to.equal(110);
          ctr = 0;
          evtService.trigger({
            selector: function(e) {
              return e.priority >= 2;
            }
          });
          return expect(ctr).to.equal(1110);
        });
        it('should trigger event passing parameters on default channel', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            callBack: callBackA
          });
          evtService.trigger({
            name: nameA
          }, 1, 2, 3);
          return expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be["true"];
        });
        it('should trigger event passing parameters on defined channel', function() {
          var evt;
          evt = _registerEvent({
            name: nameA,
            channel: channelA,
            callBack: callBackA
          });
          evtService.trigger({
            name: nameA,
            channel: channelA
          }, 1, 2, 3);
          return expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be["true"];
        });
        it('should trigger event as many times as registered', function() {
          var params;
          params = {
            name: nameA,
            channel: channelA,
            callBack: callBackA
          };
          _registerEvent(params);
          _registerEvent(params);
          _registerEvent(params);
          evtService.trigger({
            name: nameA,
            channel: channelA
          });
          return expect(callBackA.callCount).to.equal(3);
        });
        it('should not trigger if the event is paused', function() {
          var evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.pause();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(2);
        });
        it('should trigger if the event is resumed', function() {
          var callCount, evt2, params;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.pause();
          evtService.trigger({
            name: nameA
          });
          callCount = callBackA.callCount;
          expect(callCount).to.equal(2);
          evt2.resume();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(callCount + 3);
        });
        return it('should not trigger if the event is stopped', function() {
          var ctr, evt2, params;
          ctr = 0;
          params = {
            name: nameA,
            callBack: callBackA
          };
          _registerEvent(params);
          evt2 = _registerEvent(params);
          _registerEvent(params);
          evt2.stop();
          evtService.trigger({
            name: nameA
          });
          return expect(callBackA.callCount).to.equal(2);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=EventService.js.map
