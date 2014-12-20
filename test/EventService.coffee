# global require
'use strict'

EventService = require '../src/EventService.js'
Event = require '../src/Event.js'

testEvtArr = []
nameA = 'nameA'
channelA = 'channelA'
evtService = undefined
callBackA = undefined
priorityDefault = 1
priorityA = 2

_registerEvent = (evtArgs) ->
  evt = evtService.on evtArgs
  testEvtArr.push evt
  return evt

cleanAllEvts = ->
  testEvtArr.forEach (evt)->
    evtService.off evt
  testEvtArr = []

# ------------------------------------------------------
describe 'EventService', ->
  # ----------------------------------------
  describe 'Class definition', ->
    it 'EventService API should be defined', ->
      expect(EventService).not.to.be.undefined

      expect(EventService.prototype.on).not.to.be.undefined
      expect(EventService.prototype.off).not.to.be.undefined
      expect(EventService.prototype.trigger).not.to.be.undefined

  # ----------------------------------------
  # ----------------------------------------
  describe 'API', ->
    beforeEach ->
      callBackA = sinon.spy()
      evtService = new EventService()

    afterEach ->
      cleanAllEvts()
      evtService = undefined

    describe 'EventService on()', ->

      # -------------------------------------------------------
      it 'should accept minimum arguments / event name and callback', ->
        evt = _registerEvent
          name: nameA
          callBack: callBackA

        expect(evt).not.to.be.undefined
        expect(evt instanceof Event).to.be.true

        expect(evt.name).to.equal nameA
        expect(evt.callBack).to.equal callBackA
        expect(evt.callBack.callCount).to.equal 0
        # default values
        expect(evt.priority).to.equal priorityDefault
        expect(evt.channel).to.equal undefined

      # -------------------------------------------------------
      it 'should accept full arguments / event name, callback, channel and priority', ->
        evt = _registerEvent
          name: nameA
          channel: channelA
          callBack: callBackA
          priority: priorityA

        expect(evt).not.to.be.undefined
        expect(evt instanceof Event).to.be.true

        expect(evt.name).to.equal nameA
        expect(evt.channel).to.equal channelA
        expect(evt.callBack).to.equal callBackA
        expect(evt.callBack.callCount).to.equal 0
        expect(evt.priority).to.equal priorityA

      # -------------------------------------------------------
      it 'should throw if name is not string', ->
        fn = ->
          evtService.on
            name: 1
        expect(fn).to.throw

      # -------------------------------------------------------
      it 'should throw if name or callback are missing', ->
        missingNameClbkFunc = ->
          evtService.on()

        missingNameFunc = ->
          evtService.on
            callBack: ->

        missingClbkFunc = ->
          evtService.on
            name: nameA

        expect(missingNameClbkFunc).to.throw
        expect(missingNameFunc).to.throw
        expect(missingClbkFunc).to.throw

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'EventService off()', ->

      # -------------------------------------------------------
      it 'should remove event from default channel', ->
        params =
          name: nameA
          callBack: callBackA

        _registerEvent params
        evt2 = _registerEvent params
        _registerEvent params

        # triggers 3 times
        evtService.trigger
          name: nameA

        callCount = callBackA.callCount
        expect(callCount).to.equal 3

        # removes 1 event
        evtService.off evt2

        # triggers 2 times
        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal (callCount + 2)

      # -------------------------------------------------------
      it 'should remove event from default channel based on selector filter', ->
        params =
          priority: 1
          name: nameA
          callBack: callBackA

        _registerEvent params #priority 1

        params.priority = 2

        _registerEvent params #priority 2
        _registerEvent params #priority 2

        evtService.trigger
          name: nameA

        # triggers 3 times
        callCount = callBackA.callCount
        expect(callCount).to.equal 3

        # removes 2 events
        evtService.off
          selector: (e)->
            return e.priority == 2

        # triggers 1 event
        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal (callCount + 1)

      # -------------------------------------------------------
      it 'should remove event from default channel based on event name', ->
        params =
          name: nameA
          callBack: callBackA

        _registerEvent params #priority 1
        _registerEvent params #priority 1

        params.name = 'anotherEventName'
        _registerEvent params #priority 1

        evtService.trigger
          name: nameA

        callCount = callBackA.callCount
        expect(callCount).to.equal 2

        evtService.off
          name: nameA

        evtService.trigger
          name: nameA

        # check the event registered under nameA are cleared
        # the callCount should be unchanged
        expect(callBackA.callCount).to.equal callCount

        # only the other event should be left
        evtService.trigger
          selector: (e)->
            return e.priority == 1

        # check the other event registered are left
        expect(callBackA.callCount).to.equal (callCount + 1)

      # -------------------------------------------------------
      it 'should remove event from defined channel', ->
        params =
          name: nameA
          channel: channelA
          callBack: callBackA

        _registerEvent params
        evt2 = _registerEvent params
        _registerEvent params

        # triggers 3 times
        evtService.trigger
          name: nameA
          channel: channelA

        callCount = callBackA.callCount
        expect(callCount).to.equal 3

        # removes 1 event
        evtService.off evt2

        # triggers 2 times
        evtService.trigger
          name: nameA
          channel: channelA

        expect(callBackA.callCount).to.equal (callCount + 2)

      # -------------------------------------------------------
      it 'should remove event from defined channel based on priority filter', ->
        params =
          priority: 2
          name: nameA
          callBack: callBackA

        _registerEvent params #priority 2

        params.priority = 3

        _registerEvent params #priority 3
        _registerEvent params #priority 3

        # triggers 3 times
        evtService.trigger
          name: nameA

        callCount = callBackA.callCount
        expect(callCount).to.equal 3

        # removes 1 event
        evtService.off
          selector: (e)->
            return e.priority == 2

        # triggers 2 times
        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal (callCount + 2)

      # -------------------------------------------------------
      it 'should remove event from defined channel based on event name', ->
        params =
          name: nameA
          channel: channelA
          callBack: callBackA

        _registerEvent params #priority default
        _registerEvent params #priority default

        params.name = 'anotherEventName'
        _registerEvent params #priority default

        # triggers 2 events
        evtService.trigger
          name: nameA
          channel: channelA

        callCount = callBackA.callCount
        expect(callCount).to.equal 2

        # removes 2
        evtService.off
          name: nameA
          channel: channelA

        # triggers 0
        evtService.trigger
          name: nameA
          channel: channelA

        # check the event registered under nameA are cleared
        # the callCount should be unchanged
        expect(callBackA.callCount).to.equal callCount


        evtService.trigger
          channel: channelA
          prioritySelector: (e)->
            return e.priority == priorityDefault

        # check the other event registered are left
        expect(callBackA.callCount).to.equal (callCount + 1)


    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'EventService trigger()', ->

      # -------------------------------------------------------
      it 'should trigger event registered on default channel', (done) ->
        _registerEvent
          name: nameA
          callBack: ->
            done()

        evtService.trigger
          name: nameA

      # -------------------------------------------------------
      it 'should trigger event registered on defined channel', (done) ->
        _registerEvent
          name: nameA
          channel: channelA
          callBack: ->
            done()

        evtService.trigger
          name: nameA
          channel: channelA

      # -------------------------------------------------------
      it 'should trigger events based on priority', (done) ->
        ctr = 0

        # last
        _registerEvent # priority 1 default
          name: nameA
          callBack: ->
            expect(ctr).to.equal 11
            done()

        # second
        _registerEvent
          name: nameA
          priority: 2
          callBack: ->
            expect(ctr).to.equal 1
            ctr += 10

        # first
        _registerEvent
          name: nameA
          priority: 3
          callBack: ->
            expect(ctr).to.equal 0
            ctr++

        evtService.trigger
          name: nameA

      # -------------------------------------------------------
      it 'should trigger events filtered on selector', ->
        ctr = 0

        # fourth / last
        _registerEvent
          name: nameA
          callBack: ->
            ctr++

        # second
        _registerEvent
          name: nameA
          priority: 2
          callBack: ->
            ctr += 10

        # first
        _registerEvent
          name: nameA
          priority: 3
          callBack: ->
            ctr += 100

        _registerEvent
          name: 'anotherEventName'
          priority: 3
          callBack: ->
            ctr += 1000

        # should trigger all events nameA
        evtService.trigger
          selector: (e)->
            return e.name == nameA

        expect(ctr).to.equal 111
        ctr = 0

        # should trigger only one
        evtService.trigger
          name: nameA
          selector: (e)->
            return e.priority == 3

        expect(ctr).to.equal 100
        ctr = 0

        # should trigger two
        evtService.trigger
          name: nameA
          selector: (e)->
            return e.priority >= 2

        expect(ctr).to.equal 110
        ctr = 0

        # should trigger all but the first
        evtService.trigger
          selector: (e)->
            return e.priority >= 2

        expect(ctr).to.equal 1110

      # -------------------------------------------------------
      it 'should trigger event passing parameters on default channel', ->
        evt = _registerEvent
          name: nameA
          callBack: callBackA

        evtService.trigger
          name: nameA
        , 1, 2, 3

        expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be.true;

      # -------------------------------------------------------
      it 'should trigger event passing parameters on defined channel', ->
        evt = _registerEvent
          name: nameA
          channel: channelA
          callBack: callBackA

        evtService.trigger
          name: nameA
          channel: channelA
        , 1, 2, 3

        expect(evt.callBack.firstCall.calledWith(1, 2, 3)).to.be.true;

      # -------------------------------------------------------
      it 'should trigger event as many times as registered', ->
        params =
          name: nameA
          channel: channelA
          callBack: callBackA

        _registerEvent params
        _registerEvent params
        _registerEvent params

        evtService.trigger
          name: nameA
          channel: channelA

        expect(callBackA.callCount).to.equal 3

      # -------------------------------------------------------
      it 'should not trigger if the event is paused', ->
        params =
          name: nameA
          callBack: callBackA

        _registerEvent params
        evt2 = _registerEvent params
        _registerEvent params

        evt2.pause()

        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal 2

      # -------------------------------------------------------
      it 'should trigger if the event is resumed', ->
        params =
          name: nameA
          callBack: callBackA

        _registerEvent params
        evt2 = _registerEvent params
        _registerEvent params

        evt2.pause()

        evtService.trigger
          name: nameA

        callCount = callBackA.callCount
        expect(callCount).to.equal 2

        evt2.resume()

        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal (callCount + 3)

      # -------------------------------------------------------
      it 'should not trigger if the event is stopped', ->
        ctr = 0
        params =
          name: nameA
          callBack: callBackA

        _registerEvent params
        evt2 = _registerEvent params
        _registerEvent params

        evt2.stop()

        evtService.trigger
          name: nameA

        expect(callBackA.callCount).to.equal 2
