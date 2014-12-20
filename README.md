EventService
============

[![Build Status](https://travis-ci.org/chi-mai2b/EventService.svg?branch=master)](https://travis-ci.org/chi-mai2b/EventService)
[![Coverage Status](https://coveralls.io/repos/chi-mai2b/EventService/badge.png)](https://coveralls.io/r/chi-mai2b/EventService)

The EventService is a lightweight implementation of the "Observer" pattern. 

It allows for filtering when triggering / *publishing* or removing / *unsubscribing*.  
Events can be triggered or removed based on name, priority, channels.

Implemented without any dependency.

## Features

* Channels
* Priority
* Event selection / filtering
* Individual event control
    * pause / resume
    * increment / decrement priority 
    * stop

## API & Examples

[EventService API and examples](./api/EventService.md)
[Event API and examples](./api/Event.md)

## Requirements

Minimum ECMAScript 5.1 (ECMA-262)  

## Tested browsers

* Chrome 39
* Firefox 31