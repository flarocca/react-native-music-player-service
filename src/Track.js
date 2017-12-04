//@flow

let _isNullOrUndefined = (value: any): boolean => {
  return (value === null || value === undefined);
}

let _isNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

let _isString = (value: any): boolean => {
  return typeof (value) === 'string';
}

export default class Track {
  id: string;
  path: string;
  position: ?number;
  aditionalInfo: ?any;

  constructor(properties: { id: string, path: string, position: ?number, aditionalInfo: ?any }) {
    if (_isNullOrUndefined(properties)) {
      throw new Error('Properties must not be either null or undefined. Received [' + properties + ']');
    }

    if (_isNullOrUndefined(properties.id) || !_isNumber(properties.id)) {
      throw new Error('Id must not be either null or undefined. Allowed [number]. Received [' + properties.id + ']');
    }

    if (_isNullOrUndefined(properties.path) || !_isString(properties.path)) {
      throw new Error('Path must not be either null or undefined. Allowed [string]. Received [' + properties.path + ']');
    }

    if (!_isNullOrUndefined(properties.position)) {
      if (!_isNumber(properties.position) || (properties.position < 0)) {
        throw new Error('Position must be greater or equal than zero. Allowed [number | 0 >=]. Received [' + properties.position + ']');
      }
    }

    this.id = properties.id;
    this.path = properties.path;
    this.position = properties.position;
    this.aditionalInfo = properties.aditionalInfo;
  }
}