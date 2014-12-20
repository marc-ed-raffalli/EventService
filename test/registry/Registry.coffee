# global require
'use strict'

Registry = require '../../src/registry/Registry.js'

channelA = 'channelA'
nameA = 'nameA'
nameB = 'nameB'

# ------------------------------------------------------
describe 'Registry', ->
  # ----------------------------------------
  describe 'Class definition', ->
    it 'Registry API should be defined', ->
      expect(Registry).not.to.be.undefined

      expect(Registry.prototype.register).not.to.be.undefined
      expect(Registry.prototype.remove).not.to.be.undefined

  # ----------------------------------------
  # ----------------------------------------
  describe 'API', ->
    # ----------------------------------------
    # ----------------------------------------
    describe 'Registry -> register()', ->
      # -------------------
      registry = undefined
      # -------------------
      beforeEach ->
        registry = new Registry()
      # -------------------
      afterEach ->
        registry.emptyRegistryChannel()
        registry.emptyRegistryChannel(channelA)
        registry = undefined
      # ----------------------------------------
      it 'should register item to the default channel', ->
        item = registry.register
          name: nameA

        itemArr = registry.getRegistryChannel()[nameA]
        expect(itemArr.indexOf(item)).not.to.equal -1
        expect(itemArr.length).to.equal 1
      # ----------------------------------------
      it 'should register item to a custom channel', ->
        item = registry.register
          channel: channelA,
          name: nameA

        itemArr = registry.getRegistryChannel(channelA)[nameA]
        expect(itemArr.indexOf(item)).not.to.equal -1
        expect(itemArr.length).to.equal 1

    # ----------------------------------------
    # ----------------------------------------
    describe 'Registry -> remove()', ->
      # -------------------
      registry = undefined
      defaultEvtA = undefined
      channelAEvtA = undefined
      defaultChannel = undefined
      countEvtAOnDefaultChannel = undefined
      countEvtBOnDefaultChannel = undefined
      otherChannel = undefined
      countEvtAOnOtherChannel = undefined
      countEvtBOnOtherChannel = undefined
      # -------------------
      beforeEach ->
        registry = new Registry()
        # register the item to the default registry channel
        itemArgs =
          name: nameA
        defaultEvtA = registry.register itemArgs
        registry.register itemArgs
        registry.register itemArgs

        itemArgs.name = nameB
        registry.register itemArgs
        registry.register itemArgs
        registry.register itemArgs

        # register the item to the custom registry channel
        itemArgs =
          channel: channelA,
          name: nameA
        channelAEvtA = registry.register itemArgs
        registry.register itemArgs
        registry.register itemArgs

        itemArgs.name = nameB
        registry.register itemArgs
        registry.register itemArgs
        registry.register itemArgs
        # default item counts
        defaultChannel = registry.getRegistryChannel()
        countEvtAOnDefaultChannel = defaultChannel[nameA].length
        countEvtBOnDefaultChannel = defaultChannel[nameB].length

        otherChannel = registry.getRegistryChannel(channelA)
        countEvtAOnOtherChannel = otherChannel[nameA].length
        countEvtBOnOtherChannel = otherChannel[nameB].length
      # -------------------
      afterEach ->
        registry.emptyRegistryChannel()
        registry.emptyRegistryChannel(channelA)
        registry = undefined
      # ----------------------------------------
      it 'should remove ONE item from the default channel when using item object', ->
        expect(countEvtAOnDefaultChannel).to.equal 3

        res = registry.remove defaultEvtA

        # is found
        expect(res).not.to.deep.equal []
        # the item is no longer present
        expect(defaultChannel[nameA].indexOf(defaultEvtA)).to.equal -1
        # only one is removed
        expect(defaultChannel[nameA].length).to.equal (countEvtAOnDefaultChannel - 1)
        # check for side effect
        expect(defaultChannel[nameB].length).to.equal countEvtBOnDefaultChannel
        expect(otherChannel[nameA].length).to.equal countEvtAOnOtherChannel
        expect(otherChannel[nameB].length).to.equal countEvtBOnOtherChannel
      # ----------------------------------------
      it 'should remove item from the custom channel using item object', ->
        expect(countEvtAOnOtherChannel).to.equal 3

        res = registry.remove channelAEvtA

        # is found
        expect(res).not.to.deep.equal []
        # the item is no longer present
        expect(otherChannel[nameA].indexOf(channelAEvtA)).to.equal -1
        # only one is removed
        expect(otherChannel[nameA].length).to.equal(countEvtAOnOtherChannel - 1)
        # check for side effect
        expect(otherChannel[nameB].length).to.equal countEvtBOnOtherChannel
        expect(defaultChannel[nameA].length).to.equal countEvtAOnDefaultChannel
        expect(defaultChannel[nameB].length).to.equal countEvtBOnDefaultChannel
      # ----------------------------------------
      it 'should remove all named item from the default channel using name selector', ->
        expect(countEvtAOnDefaultChannel).to.equal 3

        res = registry.remove
          name: nameA

        # nameA is registered so should be found
        expect(res).not.to.deep.equal []
        # All nameA are removed from channel
        expect(defaultChannel[nameA].length).to.equal 0
        # check for side effect
        expect(defaultChannel[nameB].length).to.equal countEvtBOnDefaultChannel
        expect(otherChannel[nameA].length).to.equal countEvtAOnOtherChannel
        expect(otherChannel[nameB].length).to.equal countEvtBOnOtherChannel
      # ----------------------------------------
      it 'should remove all named item from the custom channel using name selector', ->
        expect(countEvtAOnOtherChannel).to.equal 3

        res = registry.remove
          channel: channelA,
          name: nameA

        # nameA is registered so should be found
        expect(res).not.to.deep.equal []
        # All nameA are removed from channel
        expect(otherChannel[nameA].length).to.equal 0
        # check for side effect
        expect(otherChannel[nameB].length).to.equal countEvtBOnOtherChannel
        expect(defaultChannel[nameA].length).to.equal countEvtAOnDefaultChannel
        expect(defaultChannel[nameB].length).to.equal countEvtBOnDefaultChannel
