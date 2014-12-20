# global require
'use strict'

Event = require '../src/Event.js'

idA = 1
channelA = 'channelA'
nameA = 'nameA'
nameB = 'nameB'
callBackA = undefined
contextA = {dummy: 'context'}

# ------------------------------------------------------
eventTestRunner = ->
  describe 'Event', ->
    # ----------------------------------------
    describe 'Class definition', ->
      it 'Event API should be defined', ->
        expect(Event).not.to.be.undefined

        expect(Event.prototype.init).not.to.be.undefined
        expect(Event.prototype.getId).not.to.be.undefined
        expect(Event.prototype.getChannel).not.to.be.undefined
        expect(Event.prototype.getCallback).not.to.be.undefined
        expect(Event.prototype.getContext).not.to.be.undefined
        expect(Event.prototype.getName).not.to.be.undefined
        expect(Event.prototype.getPriority).not.to.be.undefined
        expect(Event.prototype.incrementPriority).not.to.be.undefined
        expect(Event.prototype.decrementPriority).not.to.be.undefined
        expect(Event.prototype.trigger).not.to.be.undefined
        expect(Event.prototype.isPaused).not.to.be.undefined
        expect(Event.prototype.pause).not.to.be.undefined
        expect(Event.prototype.resume).not.to.be.undefined
        expect(Event.prototype.stop).not.to.be.undefined
        expect(Event.prototype.isStopped).not.to.be.undefined

    # ----------------------------------------
    # ----------------------------------------
    describe 'API', ->
      # -------------------
      evt = undefined
      # -------------------
      beforeEach ->
        callBackA = sinon.spy()
        evt = new Event
          id: idA
          name: nameA
          channel: channelA
          callBack: callBackA
          context: contextA
          priority: 2

      # ----------------------------------------
      describe 'Event -> init()', ->
        it 'should accept id, name, callBack [,channel, priority, context]', ->
          evt = new Event
            id: idA
            name: nameA
            callBack: callBackA

          expect(evt.id).to.equal idA
          expect(evt.name).to.equal nameA
          expect(evt.callBack).to.equal callBackA
          expect(evt.callBack.callCount).to.equal 0
          expect(evt.channel).to.equal undefined
          expect(evt.context).to.equal undefined
          expect(evt.priority).to.equal 1

        # ----------------------------------------
        it 'should set id, name, callBack, channel, context as READ ONLY', ->
          editIdFunc = ->
            evt.id = -1

          editNameFunc = ->
            evt.name = ''

          editChannelFunc = ->
            evt.channel = ''

          editCallBackFunc = ->
            evt.callBack = ->

          editContextFunc = ->
            evt.context = {}

          expect(editIdFunc).to.throw
          expect(editNameFunc).to.throw
          expect(editChannelFunc).to.throw
          expect(editCallBackFunc).to.throw
          expect(editContextFunc).to.throw

          expect(evt.id).to.equal idA
          expect(evt.name).to.equal nameA
          expect(evt.channel).to.equal channelA
          expect(evt.callBack).to.equal callBackA
          expect(evt.context).to.equal contextA

        # ----------------------------------------
        it 'should THROW TypeError on missing id, name, callBack', ->
          emptyCallFunc = ->
            new Event
          missingIdFunc = ->
            new Event
              name: nameA
              callBack: callBackA
          missingNameFunc = ->
            new Event
              id: idA
              callBack: callBackA
          missingCallBackFunc = ->
            new Event
              id: idA
              name: nameA

          expect(emptyCallFunc).to.throw
          expect(missingIdFunc).to.throw
          expect(missingNameFunc).to.throw
          expect(missingCallBackFunc).to.throw

      # ----------------------------------------
      # ----------------------------------------
      describe 'Event -> trigger()', ->

        # ----------------------------------------
        it 'should execute callBack', ->
          expect(evt.callBack.callCount).to.equal 0
          evt.trigger()
          expect(evt.callBack.callCount).to.equal 1

        # ----------------------------------------
        it 'should execute callBack providing context', ->
          contextB = {}
          callBackB = sinon.spy()

          evtB = new Event
            id: idA
            name: nameA
            callBack: callBackB
            context: contextB

          expect(evt.callBack.callCount).to.equal 0
          expect(evtB.callBack.callCount).to.equal 0

          evt.trigger()
          evtB.trigger()

          expect(evt.callBack.callCount).to.equal 1
          expect(evt.callBack.calledOn(contextA)).to.be.true

          expect(evtB.callBack.callCount).to.equal 1
          expect(evtB.callBack.calledOn(contextB)).to.be.true

        # ----------------------------------------
        it 'should execute callBack providing arguments', ->
          arg0 = 123
          arg1 = 'abc'
          arg2 = [4, 5, 6]
          arg3 = {}

          expect(evt.callBack.callCount).to.equal 0

          evt.trigger arg0, arg1, arg2, arg3

          expect(evt.callBack.callCount).to.equal 1
          expect(evt.callBack.firstCall.calledWith(arg0, arg1, arg2, arg3)).to.be.true;

      # ----------------------------------------
      # ----------------------------------------
      describe 'Event - Getters', ->

        # ----------------------------------------
        it 'Event -> getId() should return id value', ->
          expect(evt.getId()).to.equal idA

        # ----------------------------------------
        it 'Event -> getChannel() should return channel value', ->
          expect(evt.getChannel()).to.equal channelA

        # ----------------------------------------
        it 'Event -> getCallback() should return callBack value', ->
          expect(evt.getCallback()).to.equal callBackA

        # ----------------------------------------
        it 'Event -> getContext() should return context value', ->
          expect(evt.getContext()).to.equal contextA

        # ----------------------------------------
        it 'Event -> getName() should return name value', ->
          expect(evt.getName()).to.equal nameA

        # ----------------------------------------
        it 'Event -> getPriority() should return priority value', ->
          expect(evt.getPriority()).to.equal 2

        describe 'Event -> isPaused()', ->
          # ----------------------------------------
          it 'should return false by default', ->
            expect(evt.isPaused()).to.be.false

          # ----------------------------------------
          it 'should return true after a call to pause()', ->
            evt.pause()
            expect(evt.isPaused()).to.be.true

      # ----------------------------------------
      # ----------------------------------------
      describe 'Event - Setters', ->
        describe 'Event -> incrementPriority()', ->
          # ----------------------------------------
          it 'should increment priority value by 1 when step is undefined', ->
            _p = evt.getPriority()
            expect(_p).to.equal 2
            evt.incrementPriority()
            expect(evt.getPriority()).to.equal _p + 1

          # ----------------------------------------
          it 'should increment priority value by step', ->
            _p = evt.getPriority()
            step = 2
            expect(_p).to.equal 2
            evt.incrementPriority(step)
            expect(evt.getPriority()).to.equal _p + step

        describe 'Event -> decrementPriority()', ->
          # ----------------------------------------
          it 'should decrement priority value by 1 when step is undefined', ->
            _p = evt.getPriority()
            expect(_p).to.equal 2
            evt.decrementPriority()
            expect(evt.getPriority()).to.equal _p - 1

          # ----------------------------------------
          it 'should decrement priority value by step', ->
            _p = evt.getPriority()
            step = 2
            expect(_p).to.equal 2
            evt.decrementPriority(step)
            expect(evt.getPriority()).to.equal _p - step

        describe 'Event -> pause()', ->
          # ----------------------------------------
          it 'should set the property paused to true', ->
            expect(evt.paused).to.be.false
            evt.pause()
            expect(evt.paused).to.be.true

          # ----------------------------------------
          it 'should prevent trigger from executing the callBack', ->
            expect(evt.callBack.callCount).to.equal 0
            evt.pause()
            evt.trigger()
            expect(evt.callBack.callCount).to.equal 0

          # ----------------------------------------
          it 'should THROW if the event is stopped', ->
            pauseOnStoppedFunc = ->
              evt.pause()

            evt.stop()
            expect(pauseOnStoppedFunc).to.throw

        describe 'Event -> resume()', ->
          # ----------------------------------------
          it 'should set the property paused to false', ->
            evt.pause()
            expect(evt.paused).to.be.true
            evt.resume()
            expect(evt.paused).to.be.false

          # ----------------------------------------
          it 'should allow trigger executing the callBack after the event has been paused', ->
            evt.pause()
            evt.trigger()
            expect(evt.callBack.callCount).to.equal 0
            evt.resume()
            evt.trigger()
            expect(evt.callBack.callCount).to.equal 1

          # ----------------------------------------
          it 'should THROW if the event is stopped', ->
            resumeOnStoppedFunc = ->
              evt.resume()

            evt.stop()
            expect(resumeOnStoppedFunc).to.throw

        describe 'Event -> stop()', ->
          # ----------------------------------------
          it 'should set the property stopped to true', ->
            expect(evt.stopped).to.be.undefined
            evt.stop()
            expect(evt.stopped).to.be.true

          # ----------------------------------------
          it 'should THROW on altering / triggering stopped event', ->
            pauseOnStoppedFunc = ->
              evt.pause()
            resumeOnStoppedFunc = ->
              evt.resume()
            triggerOnStoppedFunc = ->
              evt.trigger()
            incPriorityOnStoppedFunc = ->
              evt.incrementPriority()
            decPriorityOnStoppedFunc = ->
              evt.decrementPriority()

            evt.stop()

            expect(pauseOnStoppedFunc).to.throw
            expect(resumeOnStoppedFunc).to.throw
            expect(triggerOnStoppedFunc).to.throw
            expect(incPriorityOnStoppedFunc).to.throw
            expect(decPriorityOnStoppedFunc).to.throw

#------------------------------------------------------------
#------------------------------------------------------------

module.exports = eventTestRunner;