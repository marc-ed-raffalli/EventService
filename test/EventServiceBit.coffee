# global define, describe, it, expect
define [
  'src/EventService'
], (EventService) ->

  testEvtArr = []
  evtName = 'evtName'
  channel = 'channelA'
  evtService = undefined

  registerEvent = (evtArgs) ->
    evt = evtService.on evtArgs
    testEvtArr.push evt
    return evt

  cleanAllEvts = ->
    testEvtArr.forEach (evt)->
      evtService.off evt
    testEvtArr = []

  # ------------------------------------------------------
  describe 'EventService', ->
    it 'EventService API should be defined', ->
      expect(EventService).not.to.be.undefined

      evtService = new EventService()

      expect(evtService.on).not.to.be.undefined
      expect(evtService.off).not.to.be.undefined
      expect(evtService.trigger).not.to.be.undefined

    # ------------------------------------------------------
    # ------------------------------------------------------
    describe 'EventService on()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should accept minimum arguments / event name and callback', ->
        registerEvent
          evtName: evtName
          callBack: ->
            return

      # -------------------------------------------------------
      it 'should accept full arguments / event name, callback, channel and priority', ->
        registerEvent
          evtName: evtName
          channel: channel
          callBack: ->
          priority: 1

      # -------------------------------------------------------
      it 'should return an event object with event data', ->
        cbk = ->
        p = 1
        evt = registerEvent
          evtName: evtName
          callBack: cbk

        expect(evt).not.to.be.undefined
        expect(evt).to.be.an('object')

        expect(evt.evtName).to.equal evtName
        expect(evt.callBack).to.equal cbk
        # default values
        expect(evt.priority).to.equal 0
        expect(evt.channel).to.equal undefined

        evt = registerEvent
          evtName: evtName
          channel: channel
          callBack: cbk
          priority: p

        expect(evt).not.to.be.undefined
        expect(evt).to.be.an('object')

        expect(evt.evtName).to.equal evtName
        expect(evt.callBack).to.equal cbk
        # custom values
        expect(evt.priority).to.equal p
        expect(evt.channel).to.equal channel

      # -------------------------------------------------------
      it 'should throw if evtName is not string', ->
        fn = ->
          evtService.on
            evtName: 1
        expect(fn).to.throw

      # -------------------------------------------------------
      it 'should throw if name or callback are missing', ->
        fn = ->
          evtService.on
            priority: 1
        expect(fn).to.throw
        fn = ->
          evtService.on
            callBack: ->
            priority: 1
        expect(fn).to.throw
        fn = ->
          evtService.on
            evtName: evtName
            priority: 1
        expect(fn).to.throw

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'EventService off()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should accept evt {Event} or evtName {string}, channel {string}, prioritySelector {function}', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->

        fn = ->
          evtService.off evt

        expect(fn).not.to.throw

        fn = ->
          evtService.off
            evtName: evtName
            channel: channel

        expect(fn).not.to.throw

      # -------------------------------------------------------
      it 'should remove event from default channel', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params
        evt2 = registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off evt2

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 2

      # -------------------------------------------------------
      it 'should remove event from default channel based on priority filter', ->
        ctr = 0
        params =
          priority: 1
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params

        params.priority = 2

        registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off
          prioritySelector: (priority)->
            return priority == 2

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 1

      # -------------------------------------------------------
      it 'should remove event from default channel based on event name', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params #priority 0
        registerEvent params #priority 0

        params.evtName = 'anotherEventName'
        registerEvent params #priority 0

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 2

        ctr = 0
        evtService.off
          evtName: evtName

        evtService.trigger
          evtName: evtName

        # check the event registered under evtName are cleared
        expect(ctr).to.equal 0

        ctr = 0
        evtService.trigger
          prioritySelector: (priority)->
            return priority == 0

        # check the other event registered are left
        expect(ctr).to.equal 1


      # -------------------------------------------------------
      it 'should remove event from defined channel', ->
        ctr = 0
        params =
          evtName: evtName
          channel: channel
          callBack: ->
            ctr++

        registerEvent params
        evt2 = registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName
          channel: channel

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off evt2

        evtService.trigger
          evtName: evtName
          channel: channel

        expect(ctr).to.equal 2

      # -------------------------------------------------------
      it 'should remove event from defined channel based on priority filter', ->
        ctr = 0
        params =
          priority: 1
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params

        params.priority = 2

        registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off
          prioritySelector: (priority)->
            return priority == 2

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 1

      # -------------------------------------------------------
      it 'should remove event from defined channel based on event name', ->
        ctr = 0
        params =
          evtName: evtName
          channel: channel
          callBack: ->
            ctr++

        registerEvent params #priority 0
        registerEvent params #priority 0

        params.evtName = 'anotherEventName'
        registerEvent params #priority 0

        evtService.trigger
          evtName: evtName
          channel: channel

        expect(ctr).to.equal 2

        ctr = 0
        evtService.off
          evtName: evtName
          channel: channel

        evtService.trigger
          evtName: evtName
          channel: channel

        # check the event registered under evtName are cleared
        expect(ctr).to.equal 0

        ctr = 0
        evtService.trigger
          channel: channel
          prioritySelector: (priority)->
            return priority == 0

        # check the other event registered are left
        expect(ctr).to.equal 1


    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'EventService trigger()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should accept evtName {string}, channel {string}, prioritySelector {function}', ->
        fn = ->
          evtService.trigger evtName

        expect(fn).not.to.throw

        fn = ->
          evtService.trigger
            evtName: evtName
            channel: channel

        expect(fn).not.to.throw

        fn = ->
          evtService.trigger
            evtName: evtName
            prioritySelector: ->

        expect(fn).not.to.throw

      # -------------------------------------------------------
      it 'should trigger event registered on default channel', (done) ->
        registerEvent
          evtName: evtName
          callBack: ->
            done()

        evtService.trigger
          evtName: evtName

      # -------------------------------------------------------
      it 'should trigger event registered on defined channel', (done) ->
        registerEvent
          evtName: evtName
          channel: channel
          callBack: ->
            done()

        evtService.trigger
          evtName: evtName
          channel: channel

      # -------------------------------------------------------
      it 'should trigger events based on priority', (done) ->
        ctr = 0

        registerEvent
          evtName: evtName
          callBack: ->
            expect(ctr).to.equal 0
            ctr++

        registerEvent
          evtName: evtName
          priority: 1
          callBack: ->
            expect(ctr).to.equal 1
            ctr += 10

        registerEvent
          evtName: evtName
          priority: 2
          callBack: ->
            expect(ctr).to.equal 11
            done()

        expect(ctr).to.equal 0

        evtService.trigger
          evtName: evtName

      # -------------------------------------------------------
      it 'should have up to date priority order when event priority is updated', (done) ->
        ctr = 0

        # first event to trigger
        registerEvent
          evtName: evtName
          callBack: ->
            evt2.incrementPriority 3
            expect(ctr).to.equal 0
            ctr++

        # updated to priority 4
        # last
        evt2 = registerEvent
          evtName: evtName
          priority: 1
          callBack: ->
            expect(ctr).to.equal 111
            done()

        # second
        registerEvent
          evtName: evtName
          priority: 2
          callBack: ->
            evt3.decrementPriority 2
            expect(ctr).to.equal 1
            ctr += 10

        # updated to priority 3
        # third
        evt3 = registerEvent
          evtName: evtName
          priority: 5
          callBack: ->
            expect(ctr).to.equal 11
            ctr += 100

        expect(ctr).to.equal 0

        evtService.trigger
          evtName: evtName

      # -------------------------------------------------------
      it 'should trigger events filtered on priority', ->
        ctr = 0

        registerEvent
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent
          evtName: evtName
          priority: 1
          callBack: ->
            ctr += 10

        registerEvent
          evtName: evtName
          priority: 2
          callBack: ->
            ctr += 100

        registerEvent
          evtName: 'anotherEventName'
          priority: 2
          callBack: ->
            ctr += 1000

        expect(ctr).to.equal 0

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 111
        ctr = 0

        evtService.trigger
          evtName: evtName
          prioritySelector: (priority)->
            return priority == 1

        expect(ctr).to.equal 10
        ctr = 0

        evtService.trigger
          evtName: evtName
          prioritySelector: (priority)->
            return priority >= 1

        expect(ctr).to.equal 110
        ctr = 0

        evtService.trigger
          prioritySelector: (priority)->
            return priority >= 1

        expect(ctr).to.equal 1110

      # -------------------------------------------------------
      it 'should trigger event passing parameters on default channel', (done) ->
        params = [1, 2, 3]
        registerEvent
          evtName: evtName
          callBack: ->
            expect(Array.prototype.slice.call(arguments, 0)).to.eql params
            done()

        evtService.trigger
          evtName: evtName
        , 1, 2, 3

      # -------------------------------------------------------
      it 'should trigger event passing parameters on defined channel', (done) ->
        params = [1, 2, 3]
        registerEvent
          evtName: evtName
          channel: channel
          callBack: ->
            expect(Array.prototype.slice.call(arguments, 0)).to.eql params
            done()

        evtService.trigger
          evtName: evtName
          channel: channel
        , 1, 2, 3

      # -------------------------------------------------------
      it 'should trigger event as many times as registered', ->
        ctr = 0
        params =
          evtName: evtName
          channel: channel
          callBack: ->
            ctr++

        registerEvent params
        registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName
          channel: channel

        expect(ctr).to.equal 3

      # -------------------------------------------------------
      it 'should not trigger if the event is paused', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params
        evt2 = registerEvent params
        registerEvent params

        evt2.pause()

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 2

      # -------------------------------------------------------
      it 'should trigger if the event is resumed', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params
        evt2 = registerEvent params
        registerEvent params

        evt2.pause()

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 2

        ctr = 0
        evt2.resume()

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 3

      # -------------------------------------------------------
      it 'should not trigger if the event is stopped', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params
        evt2 = registerEvent params
        registerEvent params

        evt2.stop()

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 2

  #------------------------------------------------------------
  #------------------------------------------------------------

  describe 'Event', ->
    beforeEach ->
      evtService = new EventService()

    afterEach ->
      cleanAllEvts()
      evtService = undefined

    # -------------------------------------------------------
    it 'Event API should be defined', ->
      evt = registerEvent
        evtName: evtName
        callBack: ->
          throw new Error 'should not be called'

      expect(evt.incrementPriority).not.to.be.undefined
      expect(evt.decrementPriority).not.to.be.undefined

      expect(evt.trigger).not.to.be.undefined

      expect(evt.isPaused).not.to.be.undefined
      expect(evt.pause).not.to.be.undefined
      expect(evt.resume).not.to.be.undefined

      expect(evt.stop).not.to.be.undefined
      expect(evt.isStopped).not.to.be.undefined

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'Event incrementPriority()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should increment priority value by one if no value provided', ->
        p = 1
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
          priority: p

        expect(evt.priority).to.equal p

        evt.incrementPriority()

        expect(evt.priority).to.equal (p + 1)

      # -------------------------------------------------------
      it 'should increment priority value by the value provided', ->
        p = 1
        step = 5
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
          priority: p

        expect(evt.priority).to.equal p

        evt.incrementPriority(step)

        expect(evt.priority).to.equal (p + step)

      # -------------------------------------------------------
      it 'should throw if event stopped', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'

        evt.stop()

        expect(->
          evt.incrementPriority()).to.throw

        expect(->
          evt.incrementPriority(5)).to.throw

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'Event decrementPriority()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should decrement priority value by one if no value provided', ->
        p = 1
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
          priority: p

        expect(evt.priority).to.equal p

        evt.decrementPriority()

        expect(evt.priority).to.equal (p - 1)

      # -------------------------------------------------------
      it 'should decrement priority value by the value provided', ->
        p = 1
        step = 5
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
          priority: p

        expect(evt.priority).to.equal p

        evt.decrementPriority(step)

        expect(evt.priority).to.equal (p - step)

      # -------------------------------------------------------
      it 'should throw if event stopped', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'

        evt.stop()

        expect(->
          evt.decrementPriority()).to.throw

        expect(->
          evt.decrementPriority(5)).to.throw

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'Event trigger()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'should trigger callback', (done) ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            done()

        evt.trigger()

      # -------------------------------------------------------
      it 'should not trigger callback when paused', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'

        evt.pause()
        evt.trigger()

      # -------------------------------------------------------
      it 'should throw if event stopped', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
        evt.stop()
        expect(->
          evt.trigger()).to.throw

    # -------------------------------------------------------
    # -------------------------------------------------------
    describe 'Event flow isPaused() / pause() / resume()', ->
      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        evtService = undefined

      # -------------------------------------------------------
      it 'event should be paused = false by default', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'

        expect(evt.isPaused()).to.be.false

      # -------------------------------------------------------
      it 'pause / resume should change pause status', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'

        expect(evt.isPaused()).to.be.false
        evt.pause()
        expect(evt.isPaused()).to.be.true
        evt.resume()
        expect(evt.isPaused()).to.be.false

      # -------------------------------------------------------
      it 'pause / resume should throw if event is stopped', ->
        evt = registerEvent
          evtName: evtName
          callBack: ->
            throw new Error 'should not be called'
        evt.stop()
        expect(->
          evt.pause()).to.throw
        expect(->
          evt.resume()).to.throw
        expect(->
          evt.isPaused()).not.to.throw
