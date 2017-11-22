//@flow

export default class Track {
  id: string;
  path: string;
  position: ?number;

  constructor(id: string, path: string, position: ?number) {
    this.id = id;
    this.path = path;
    this.position = position;
  }
}