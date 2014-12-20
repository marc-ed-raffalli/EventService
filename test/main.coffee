# global require
'use strict'

main = ->
  eventServiceTest = require './EventService.coffee'
  eventTest = require './Event.coffee'
  registryTest = require './registry/Registry.coffee'
  registryItemTest = require './registry/RegistryItem.coffee'

  eventServiceTest()
  eventTest()
  registryTest()
  registryItemTest()

main()

module.exports = main
