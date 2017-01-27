# Runtypes [![Build Status](https://travis-ci.org/pelotom/runtypes.svg?branch=master)](https://travis-ci.org/pelotom/runtypes)

## Bring untyped data into the fold, safely

Runtypes is a JavaScript and TypeScript library which allows you to take values about which you have no assurances and ensure
that they conform to some type `A`. This is done by means of composable type validators: it supports primitives, literals, arrays,
tuples, records, unions. Better yet, it has TypeScript bindings which allow exactly expressing the validated results in a type-safe
manner.
