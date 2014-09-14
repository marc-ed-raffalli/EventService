# global define, describe, it, expect
define [
  'src/EventService'
], (EventService) ->

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
      evtService = undefined
      testEvtArr = []
      evtName = 'evtName'
      channel = 'channelA'

      registerEvent = (evtArgs) ->
        evtId = evtService.on evtArgs
        testEvtArr.push
          evtId: evtId,
          channel: evtArgs.channel
        return evtId

      cleanAllEvts = ->
        testEvtArr.forEach (evt)->
          evtService.off evt

      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        testEvtArr = []
        evtService = undefined

      # -------------------------------------------------------
      it 'should accept event name and callback', ->
        registerEvent
          evtName: evtName
          callBack: ->
            return

      # -------------------------------------------------------
      it 'should accept event name, callback and priority', ->
        registerEvent
          evtName: evtName
          callBack: ->
          priority: 1

      # -------------------------------------------------------
      it 'should return an event id {id}', ->
        evtId = registerEvent
          evtName: evtName
          callBack: ->

        expect(evtId).to.be.a.string
        expect(evtId).not.to.be.undefined
        expect(Number.isNaN(evtId)).to.be.false

      # -------------------------------------------------------
      it 'should return an event id channel:{id}', ->
        evtId = registerEvent
          evtName: evtName
          channel: channel
          callBack: ->

        split = evtId.split ':'

        expect(evtId).to.be.a.string
        expect(split.length).to.equal 2
        expect(split).to.contain channel
        expect(Number.isNaN(split[1])).to.be.false


      # -------------------------------------------------------
      it 'should throw if name is not string', ->
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
      evtService = undefined
      testEvtIdArr = []
      evtName = 'evtName'
      channel = 'channelA'

      registerEvent = (evtArgs) ->
        evtId = evtService.on evtArgs
        testEvtIdArr.push evtId
        return evtId

      cleanAllEvts = ->
        testEvtIdArr.forEach (evtId)->
          evtService.off evtId

      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        testEvtIdArr = []
        evtService = undefined

      # -------------------------------------------------------
      it 'should accept evtId {string}, evtName {string}, channel {string}, prioritySelector {function}', ->
        evtId = registerEvent
          evtName: evtName
          callBack: ->

        fn = ->
          evtService.off evtId

        expect(fn).not.to.throw

        fn = ->
          evtService.off
            evtName: evtName
            channel: channel

        expect(fn).not.to.throw

      # -------------------------------------------------------
      it 'should not throw if evtId not found', ->
        fn = ->
          evtService.off 'fooBarId'
        expect(fn).not.to.throw

      # -------------------------------------------------------
      it 'should throw if evtId is not string', ->
        fn = ->
          evtService.off 2
        expect(fn).to.throw

      # -------------------------------------------------------
      it 'should remove event from default channel', ->
        ctr = 0
        params =
          evtName: evtName
          callBack: ->
            ctr++

        registerEvent params
        evt2Id = registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off evt2Id

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
        evt2Id = registerEvent params
        registerEvent params

        evtService.trigger
          evtName: evtName
          channel: channel

        expect(ctr).to.equal 3

        ctr = 0
        evtService.off evt2Id

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
      evtService = undefined
      testEvtIdArr = []
      evtName = 'evtName'
      channel = 'channelA'

      registerEvent = (evtArgs) ->
        evtId = evtService.on evtArgs
        testEvtIdArr.push evtId
        return evtId

      cleanAllEvts = ->
        testEvtIdArr.forEach (evtId)->
          evtService.off evtId

      beforeEach ->
        evtService = new EventService()

      afterEach ->
        cleanAllEvts()
        testEvtIdArr = []
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

#------------------------------------------------------------
#------------------------------------------------------------
