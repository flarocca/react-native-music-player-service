import 'jest';

import Track from '../../src/Track';

it('Track | properties is undefined | throws exception', () => {
  let nullProperties = undefined;
  expect(() => new Track(nullProperties)).toThrowError('Properties must not be either null or undefined. Received [undefined]');
});

it('Track | properties is null | throws exception', () => {
  let nullProperties = null;
  expect(() => new Track(nullProperties)).toThrowError('Properties must not be either null or undefined. Received [null]');
});

it('Track | properties.id is undefined | throws exception', () => {
  let properties = {
    id: undefined
  };

  expect(() => new Track(properties)).toThrowError('Id must not be either null or undefined. Allowed [number]. Received [undefined]');
});

it('Track | properties.id is null | throws exception', () => {
  let properties = {
    id: null
  };

  expect(() => new Track(properties)).toThrowError('Id must not be either null or undefined. Allowed [number]. Received [null]');
});

it('Track | properties.id is not a number | throws exception', () => {
  let properties = {
    id: 'not a number'
  };

  expect(() => new Track(properties)).toThrowError('Id must not be either null or undefined. Allowed [number]. Received [not a number]');
});

it('Track | properties.path is undefined | throws exception', () => {
  let properties = {
    id: 1,
    path: undefined
  };

  expect(() => new Track(properties)).toThrowError('Path must not be either null or undefined. Allowed [string]. Received [undefined]');
});

it('Track | properties.path is null | throws exception', () => {
  let properties = {
    id: 1,
    path: null
  };

  expect(() => new Track(properties)).toThrowError('Path must not be either null or undefined. Allowed [string]. Received [null]');
});

it('Track | properties.path is not a string | throws exception', () => {
  let properties = {
    id: 1,
    path: {}
  };

  expect(() => new Track(properties)).toThrowError('Path must not be either null or undefined. Allowed [string]. Received [' + {} + ']');
});

it('Track | properties.position is not a number | throws exception', () => {
  let properties = {
    id: 1,
    path: 'path',
    position: {}
  };

  expect(() => new Track(properties)).toThrowError('Position must be greater or equal than zero. Allowed [number | 0 >=]. Received [' + {} + ']');
});

it('Track | properties.position is neither null nor undefined and lower than 0 | throws exception', () => {
  let properties = {
    id: 1,
    path: 'path',
    position: -1
  };

  expect(() => new Track(properties)).toThrowError('Position must be greater or equal than zero. Allowed [number | 0 >=]. Received [-1]');
});

it('Track | creating new | properties are set', () => {
  let properties = {
    id: 1,
    path: 'path',
    position: 0,
    aditionalInfo: {}
  };

  let track = new Track(properties);

  expect(track.id).toEqual(properties.id);
  expect(track.path).toEqual(properties.path);
  expect(track.position).toEqual(properties.position);
  expect(track.aditionalInfo).toEqual(properties.aditionalInfo);
});