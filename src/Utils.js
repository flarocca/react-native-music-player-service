let _isFunction = (value: any): boolean => {
  return (typeof value === 'function');
}

let _isNumber = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

let _isNullOrUndefined = (value: any): boolean => {
  return (value === null || value === undefined);
}

let _isString = (value: any): boolean => {
  return typeof (value) === 'string';
}

let Utils = {};

Utils.isFunction = _isFunction;
Utils.isNumber = _isNumber;
Utils.isNullOrUndefined = _isNullOrUndefined;
Utils.isString = _isString;

export default Utils;