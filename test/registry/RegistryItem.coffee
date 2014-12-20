# global require
'use strict'

RegistryItem = require '../../src/registry/RegistryItem.js'

idA = 1
channelA = 'channelA'
nameA = 'nameA'
nameB = 'nameB'

registryItemTestRunner = ->
  # ------------------------------------------------------
  describe 'RegistryItem', ->
    # ----------------------------------------
    describe 'Class definition', ->
      it 'RegistryItem API should be defined', ->
        expect(RegistryItem).not.to.be.undefined
        expect(RegistryItem.prototype.extends).not.to.be.undefined
        expect(RegistryItem.prototype.init).not.to.be.undefined

    # ----------------------------------------
    # ----------------------------------------
    describe 'API', ->

      # ----------------------------------------
      describe 'RegistryItem -> init()', ->
        it 'should accept id, name [,channel]', ->
          item = new RegistryItem
            id: idA
            name: nameA

          expect(item.id).to.equal idA
          expect(item.name).to.equal nameA
          expect(item.channel).to.equal undefined

        # ----------------------------------------
        it 'should THROW TypeError on missing id or name', ->
          missingIdFunc = ->
            new RegistryItem
              name: nameA
          missingNameFunc = ->
            new RegistryItem
              id: idA
          missingIdNameFunc = ->
            new RegistryItem

          expect(missingIdFunc).to.throw
          expect(missingNameFunc).to.throw
          expect(missingIdNameFunc).to.throw

      # ----------------------------------------
      # ----------------------------------------
      describe 'RegistryItem -> extends()', ->
        it 'should return new Class with RegistryItem functions overridden/inherited', ->
          CST = 123
          _init = ->
          _fcA = ->

          Klass = RegistryItem.prototype.extends
            CST: CST
            init: _init
            fcA: _fcA

          expect(Klass).not.to.be.undefined

          expect(Klass.prototype.extends).not.to.be.undefined
          expect(Klass.prototype.init).not.to.be.undefined

          expect(Klass.prototype.CST).to.equal CST
          expect(Klass.prototype.init).to.equal _init
          expect(Klass.prototype.fcA).to.equal _fcA

        # ----------------------------------------
        it 'should new Class extending RegistryItem', ->
          _attr = 1234
          _init = (options) ->
            Object.defineProperty this, 'attr',
              value: options.attr

          Klass = RegistryItem.prototype.extends
            init: _init

          k = new Klass
            id: idA
            name: nameA
            attr: _attr

          expect(k.id).to.equal idA
          expect(k.name).to.equal nameA
          expect(k.channel).to.equal undefined

          expect(k.attr).to.equal _attr

#------------------------------------------------------------
#------------------------------------------------------------

module.exports = registryItemTestRunner;