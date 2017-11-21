//@flow

import Sound from 'react-native-sound';

import Track from './Track';
import RepeatModes from './RepeatModes';
import Events from './Events';

export default class MusicPlayerService {
  random: boolean;
  repeatMode: RepeatModes.None | RepeatModes.All | RepeatModes.One;
  queue: Array<Track>;
  isPlaying: boolean;
  currentIndex: number;

  _trackPlaying: ?Sound;
  _validateQueue: Function;
  _onPlay: Function;
  _onPause: Function;
  _onStop: Function;
  _onNext: Function;
  _onPrevious: Function;
  _onEndReached: Function;

  constructor() {
    this.random = false;
    this.repeatMode = RepeatModes.None;
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this._trackPlaying = null;
  }

  setQueue(queue: Array<Track>): Promise<Array<Track>> {
    try {
      this._validateQueue(queue);

      //if playing, stop and release current track
      this.queue = queue.slice(0);

      return Promise.resolve(this.queue);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  appendToQueue(queue: Array<Track>, atPosition: ?number): Promise<Array<Track>> {
    try {
      this._validateQueue(queue);

      if (atPosition) {
        let pos = parseInt(atPosition);

        if (!isNaN(pos) && (pos >= 0 && pos < this.queue.length)) {
          let after = this.queue.splice(0, atPosition || this.queue.length - 1);
          this.queue = this.queue.concat(queue).concat(after);
        } else {
          throw new Error('Parameter atPosition must be a number between 0 and queue.length. Received [' + atPosition + ']');
        }
      } else {
        this.queue = this.queue.concat(queue);
      }

      return Promise.resolve(this.queue);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  togglePlayPause() {
    //test
    if (this.isPlaying) {
      this._playTrack();
    } else {
      this._pauseTrack();
    }
  }

  playNext(): void {
    //test
    this._setNextTrack();
    if (this._onNext) {
      this._onNext();
    }

    if (this.isPlaying) {
      this._playTrack();
    }
  }

  playPrev(): void {
    //test
    this._setPreviousTrack();
    if (this._onPrevious) {
      this._onPrevious();
    }

    if (this.isPlaying) {
      this._playTrack();
    }
  }

  stop(): void {
    //test
    if (this._trackPlaying) {
      this._trackPlaying.stop();
      this._releaseTrack();

      if (this._onStop) {
        this._onStop();
      }
    }
  }

  setRepeatMode(repeatMode: RepeatModes.None | RepeatModes.All | RepeatModes.One): string {
    switch (repeatMode) {
      case RepeatModes.None:
      case RepeatModes.All:
      case RepeatModes.One:
        this.repeatMode = repeatMode;
        return this.repeatMode;

      default:
        throw new Error('Invalid repeat mode. Allowed [all | one | none]. Received [' + repeatMode + ']');
    }
  }

  toggleRandom(): boolean {
    this.random = !this.random;
    return this.random;
  }

  on(event: Events.Play | Events.Pause | Events.Stop | Events.Next | Events.Previous | Events.EndReached, callback: Function): void {
    if (callback === undefined || callback === null) {
      throw new Error('Callback must not be null nor undefined');
    }

    switch (event) {
      case Events.Play:
        this._onPlay = callback;
        break;
      case Events.Pause:
        this._onPause = callback;
        break;
      case Events.Stop:
        this._onStop = callback;
        break;
      case Events.Next:
        this._onNext = callback;
        break;
      case Events.Previous:
        this._onPrevious = callback;
        break;
      case Events.EndReached:
        this._onEndReached = callback;
        break;
      default:
        throw new Error('Invalid event. Allowed [play | pause | stop | next | previous | endReached]. Received [' + event + ']');
    }
  }

  _loadTrack(track: Track): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => {
      this._releaseTrack();

      this._trackPlaying = new Sound(track.path, Sound.LIBRARY, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  _releaseTrack(): void {
    if (this._trackPlaying) {
      this._trackPlaying.release();
    }
  }

  _playTrack(): void {
    let promise = Promise.resolve();
    if (!this._trackPlaying) {
      promise = this._loadTrack(this.queue[this.currentIndex])
    }

    promise.then(() => {
      if (this._trackPlaying) {
        this._trackPlaying.play(success => {
          this.playNext();
        });

        if (this._onPlay) {
          this._onPlay();
        }
      }
    });
  }

  _validateQueue(queue: Array<Track>): void {
    if (queue === undefined || queue === null) {
      throw new Error('Invalid queue [undefined | null]');
    }

    for (let i = 0; i < queue.length; i++) {
      if (!(queue[i] instanceof Track)) {
        throw new Error('Invalid elements in queue [not Track | index: ' + i + ']');
      }
    }
  }

  _pauseTrack(): void {
    if (this._trackPlaying) {
      this._trackPlaying.pause();

      if (this._onPause) {
        this._onPause();
      }
    }
  }

  _getNextNoneRepeatMode(): number {
    if (this.random)
      return Math.floor(Math.random() * (this.queue.length - 1));

    if (this.queue.length - 1 === this.currentIndex)
      return -1;

    return this.currentIndex + 1;
  }

  _getNextAllRepeatMode(): number {
    if (this.random)
      return Math.floor(Math.random() * (this.queue.length - 1));

    if (this.queue.length - 1 === this.currentIndex)
      return 0;

    return this.currentIndex + 1;
  }

  _getPrevNoneRepeatMode(): number {
    if (this.random)
      return Math.floor(Math.random() * (this.queue.length - 1));

    if (0 === this.currentIndex)
      return -1;

    return this.currentIndex - 1;
  }

  _getPrevAllRepeatMode(): number {
    if (this.random)
      return Math.floor(Math.random() * (this.queue.length - 1));

    if (0 === this.currentIndex)
      return this.queue.length - 1;

    return this.currentIndex - 1;
  }

  _setNextTrack(): void {
    let nextIndex = this.currentIndex;
    switch (this.repeatMode) {
      case RepeatModes.None:
        nextIndex = this._getNextNoneRepeatMode();
        break;
      case RepeatModes.All:
        nextIndex = this._getNextAllRepeatMode();
        break;
    }

    this.currentIndex = nextIndex;
  }

  _setPreviousTrack(): void {
    let nextIndex = this.currentIndex;
    switch (this.repeatMode) {
      case RepeatModes.None:
        nextIndex = this._getPrevNoneRepeatMode();
        break;
      case RepeatModes.All:
        nextIndex = this._getPrevAllRepeatMode();
        break;
    }

    this.currentIndex = nextIndex;
  }
}

