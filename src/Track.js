//@flow

import Utils from './Utils';

export default class Track {
  id: string;
  path: string;
  position: ?number;
  additionalInfo: ?{
    title: ?string,
    artwork: ?any,
    artist: ?string,
    album: ?string,
    genre: ?string,
    duration: ?number
  };

  constructor(properties: { id: string, path: string, position: ?number, additionalInfo: ?{ title: ?string, artwork: ?any, artist: ?string, album: ?string, genre: ?string, duration: ?number } }) {
    if (Utils.isNullOrUndefined(properties)) {
      throw new Error('Properties must not be either null or undefined. Received [' + properties + ']');
    }

    if (Utils.isNullOrUndefined(properties.id) || !Utils.isNumber(properties.id)) {
      throw new Error('Id must not be either null or undefined. Allowed [number]. Received [' + properties.id + ']');
    }

    if (Utils.isNullOrUndefined(properties.path) || !Utils.isString(properties.path)) {
      throw new Error('Path must not be either null or undefined. Allowed [string]. Received [' + properties.path + ']');
    }

    if (!Utils.isNullOrUndefined(properties.position)) {
      if (!Utils.isNumber(properties.position) || (parseInt(properties.position) < 0)) {
        throw new Error('Position must be greater or equal than zero. Allowed [number | 0 >=]. Received [' + properties.position + ']');
      }
    }

    this.id = properties.id;
    this.path = properties.path;
    this.position = properties.position;
    this.additionalInfo = properties.additionalInfo;
  }
}