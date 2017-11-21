//@flow

export default class Track {
  id: string;
  path: string;
  position: ?number;

  constructor(track: { id: string, path: string, position: ?number }) {
    this.id = track.id;
    this.path = track.path;
    this.position = track.position;
  }
}