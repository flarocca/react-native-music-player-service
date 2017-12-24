//@flow

import Sound from 'react-native-sound';
import MusicControl from 'react-native-music-control';

import Utils from './Utils';
import Track from './Track';
import RepeatModes from './RepeatModes';
import Events from './Events';

//test: general errors managment

let _bindFunctions = (context: any): void => {
  context.setQueue = context.setQueue.bind(context);
  context.setRandomGenerator = context.setRandomGenerator.bind(context);
  context.resetRandomGenerator = context.resetRandomGenerator.bind(context);
  context.setRepeatMode = context.setRepeatMode.bind(context);
  context.appendToQueue = context.appendToQueue.bind(context);
  context.togglePlayPause = context.togglePlayPause.bind(context);
  context.playNext = context.playNext.bind(context);
  context.playPrev = context.playPrev.bind(context);
  context.stop = context.stop.bind(context);
  context.toggleRandom = context.toggleRandom.bind(context);
  context.addEventListener = context.addEventListener.bind(context);
  context.removeEventListener = context.removeEventListener.bind(context);
  context.getDuration = context.getDuration.bind(context);
  context.getCurrentTime = context.getCurrentTime.bind(context);
  context.setCurrentTime = context.setCurrentTime.bind(context);

  context._initializeMusicControl = context._initializeMusicControl.bind(context);
  context._setEventListener = context._setEventListener.bind(context);
  context._loadTrack = context._loadTrack.bind(context);
  context._releaseTrack = context._releaseTrack.bind(context);
  context._playTrack = context._playTrack.bind(context);
  context._validateQueue = context._validateQueue.bind(context);
  context._pauseTrack = context._pauseTrack.bind(context);
  context._getNextNoneRepeatMode = context._getNextNoneRepeatMode.bind(context);
  context._getNextAllRepeatMode = context._getNextAllRepeatMode.bind(context);
  context._getPrevNoneRepeatMode = context._getPrevNoneRepeatMode.bind(context);
  context._getPrevAllRepeatMode = context._getPrevAllRepeatMode.bind(context);
  context._setNextTrack = context._setNextTrack.bind(context);
  context._setPreviousTrack = context._setPreviousTrack.bind(context);
  context._randomGenerator = context._randomGenerator.bind(context);
  context._setNowPlaying = context._setNowPlaying.bind(context);
  context._updatePlayback = context._updatePlayback.bind(context);
  context._getInfo = context._getInfo.bind(context);
  context._validateAtPosition = context._validateAtPosition.bind(context);
}

export default class MusicPlayerService {
  random: boolean;
  repeatMode: RepeatModes.None | RepeatModes.All | RepeatModes.One;
  queue: Array<Track>;
  isPlaying: boolean;
  currentIndex: number;
  enableSetNowPlaying: boolean;
  setNowPlayingConfig: ?{ notificationIcon: string, color: number };

  setQueue: Function;
  setRandomGenerator: Function;
  resetRandomGenerator: Function;
  setRepeatMode: Function;
  appendToQueue: Function;
  togglePlayPause: Function;
  playNext: Function;
  playPrev: Function;
  stop: Function;
  toggleRandom: Function;
  addEventListener: Function;
  removeEventListener: Function;
  getDuration: Function;
  getCurrentTime: Function;
  setCurrentTime: Function;

  _trackPlaying: ?Sound;
  _validateQueue: Function;
  _customRandomGenerator: ?Function;
  _onPlay: ?Function;
  _onPause: ?Function;
  _onStop: ?Function;
  _onNext: ?Function;
  _onPrevious: ?Function;
  _onEndReached: ?Function;

  constructor(enableSetNowPlaying: boolean = false, setNowPlayingConfig: ?{ notificationIcon: string, color: number } = null) {
    _bindFunctions(this);

    this.random = false;
    this.repeatMode = RepeatModes.None;
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.enableSetNowPlaying = enableSetNowPlaying;
    this._trackPlaying = null;

    if (this.enableSetNowPlaying) {
      this.setNowPlayingConfig = setNowPlayingConfig;
      this._initializeMusicControl();
    }
  }

  setQueue(queue: Array<Track>): Promise<Array<Track>> {
    try {
      this._validateQueue(queue);

      if (this.isPlaying) {
        this.stop();
      }

      this.queue = queue.slice(0).map((track, index) => {
        track.position = index;
        return track;
      });
      this.currentIndex = 0;

      return this._loadTrack(this.queue[this.currentIndex])
        .then(() => {
          if (this.isPlaying) {
            this._playTrack();
          }

          return Promise.resolve(this.queue);
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  setRandomGenerator(customRandomGenerator: Function): void {
    if (customRandomGenerator === undefined || customRandomGenerator === null || !Utils.isFunction(customRandomGenerator)) {
      throw new Error('Callback must not be null nor undefined. Allowed [Function]. Received [' + customRandomGenerator + ']');
    }

    this._customRandomGenerator = customRandomGenerator;
  }

  resetRandomGenerator() {
    this._customRandomGenerator = null;
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

  appendToQueue(queue: Array<Track>, atPosition: ?number): Promise<Array<Track>> {
    try {
      this._validateQueue(queue);
      this._validateAtPosition(queue, atPosition);

      if (this.queue.length == 0) {
        return this.setQueue(queue);
      }

      if (atPosition) {
        let after = this.queue.splice(0, atPosition || this.queue.length - 1);
        this.queue = this.queue.concat(queue).concat(after).map((track, index) => {
          track.position = index;
          return track;
        });
      } else {
        this.queue = this.queue.concat(queue);
      }

      return Promise.resolve(this.queue);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  togglePlayPause(): Promise<any> {
    if (!this.queue.length) {
      return Promise.reject('Queue not set. Set queue before playing.');
    }

    if (!this.isPlaying) {
      if (this.enableSetNowPlaying) {
        this._setNowPlaying(this.queue[this.currentIndex]);
      }

      return this._playTrack();
    } else {
      return this._pauseTrack();
    }
  }

  playNext(): void {
    let lastIndex = this.currentIndex;
    this._setNextTrack();

    if (lastIndex !== this.currentIndex) {
      this._releaseTrack();

      let track = this.queue[this.currentIndex];

      if (this.enableSetNowPlaying) {
        this._setNowPlaying(track);
      }

      if (this._onNext) {
        this._onNext(track);
      }

      if (this.isPlaying) {
        this._playTrack();
      }
    }
  }

  playPrev(): void {
    let lastIndex = this.currentIndex;
    this._setPreviousTrack();

    if (lastIndex !== this.currentIndex) {
      this._releaseTrack();

      let track = this.queue[this.currentIndex];

      if (this.enableSetNowPlaying) {
        this._setNowPlaying(track);
      }

      if (this._onPrevious) {
        this._onPrevious(track);
      }

      if (this.isPlaying) {
        this._playTrack();
      }
    }
  }

  stop(): void {
    if (this._trackPlaying) {
      this._trackPlaying.stop();
      this._releaseTrack();

      if (this.enableSetNowPlaying) {
        this._updatePlayback(MusicControl.STATE_PAUSED);
      }

      if (this._onStop) {
        this._onStop();
      }
    }
  }

  toggleRandom(): boolean {
    this.random = !this.random;
    return this.random;
  }

  addEventListener(event: Events.Play | Events.Pause | Events.Stop | Events.Next | Events.Previous | Events.EndReached, callback: Function): void {
    if (callback === undefined || callback === null || !Utils.isFunction(callback)) {
      throw new Error('Callback must not be null nor undefined. Allowed [Function]. Received [ ' + callback + ']');
    }

    this._setEventListener(event, callback);
  }

  removeEventListener(event: Events.Play | Events.Pause | Events.Stop | Events.Next | Events.Previous | Events.EndReached): void {
    this._setEventListener(event, null);
  }

  getDuration(): number {
    if (this._trackPlaying) {
      return this._trackPlaying.getDuration();
    }

    return 0;
  }

  getCurrentTime(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this._trackPlaying) {
        this._trackPlaying.getCurrentTime(currentTime => {
          resolve(currentTime);
        });
      } else {
        resolve(0);
      }
    });
  }

  setCurrentTime(time: number): void {
    if (time === undefined || time === null || !Utils.isNumber(time) || time < 0) {
      throw new Error('Time must not be null nor undefined. Allowed [Number | 0 >=]. Received [' + time + ']');
    }

    if (this._trackPlaying) {
      this._trackPlaying.setCurrentTime(time);
    }
  }

  _initializeMusicControl(): void {
    MusicControl.enableBackgroundMode(true);

    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);

    MusicControl.on('play', this.togglePlayPause);
    MusicControl.on('pause', this.togglePlayPause);
    MusicControl.on('nextTrack', this.playNext);
    MusicControl.on('previousTrack', this.playPrev);
  }

  _setEventListener(event: Events.Play | Events.Pause | Events.Stop | Events.Next | Events.Previous | Events.EndReached, callback: ?Function) {
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
      this._trackPlaying = null;
    }
  }

  _playTrack(): Promise<any> {
    let track = this.queue[this.currentIndex];
    let promise = Promise.resolve();

    if (!this._trackPlaying) {
      promise = this._loadTrack(track);
    }

    return promise.then(() => {
      if (this._trackPlaying) {
        this._trackPlaying.play(success => {
          this.playNext();
        });

        this.isPlaying = true;

        if (this.enableSetNowPlaying) {
          this._updatePlayback(MusicControl.STATE_PLAYING);
        }

        if (this._onPlay) {
          this._onPlay(track);
        }

        return Promise.resolve();
      } else {
        return Promise.reject();
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

  _validateAtPosition(queue: Array<Track>, atPosition: ?number): void {
    if (atPosition) {
      let pos = parseInt(atPosition);
      if (isNaN(pos) || pos < 0 || pos > queue.length) {
        throw new Error('Parameter atPosition must be a number between 0 and queue.length. Received [' + atPosition + ']');
      }
    }
  }

  _pauseTrack(): Promise<any> {
    if (this._trackPlaying) {
      this._trackPlaying.pause();

      this.isPlaying = false;

      if (this.enableSetNowPlaying) {
        this._updatePlayback(MusicControl.STATE_PAUSED);
      }

      if (this._onPause) {
        this._onPause();
      }

      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  }

  _getNextNoneRepeatMode(): number {
    if (this.random)
      return this._randomGenerator();

    if (this.queue.length - 1 === this.currentIndex)
      return this.currentIndex;

    return this.currentIndex + 1;
  }

  _getNextAllRepeatMode(): number {
    if (this.random)
      return this._randomGenerator();

    if (this.queue.length - 1 === this.currentIndex)
      return 0;

    return this.currentIndex + 1;
  }

  _getPrevNoneRepeatMode(): number {
    if (this.random)
      return this._randomGenerator();

    if (0 === this.currentIndex)
      return 0;

    return this.currentIndex - 1;
  }

  _getPrevAllRepeatMode(): number {
    if (this.random)
      return this._randomGenerator();

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

  _randomGenerator(): number {
    if (this._customRandomGenerator)
      return this._customRandomGenerator();

    return Math.floor(Math.random() * (this.queue.length - 1));
  }

  _setNowPlaying(track: Track): void {
    let config = { ...this.setNowPlayingConfig };
    let info = this._getInfo(track.additionalInfo);

    MusicControl.setNowPlaying({
      ...info,
      color: config.color, // Notification Color - Android Only
      notificationIcon: config.notificationIcon // Android Only (String), Android Drawable resource name for a custom notification icon
    });
  }

  _updatePlayback(state: MusicControl.STATE_PLAYING | MusicControl.STATE_PAUSED): void {
    this.getCurrentTime()
      .then(elapsedTime => {
        MusicControl.updatePlayback({
          state,
          elapsedTime
        });
      });
  }

  _getInfo(additionalInfo: ?{ title: ?string, artwork: ?any, artist: ?string, album: ?string, genre: ?string, duration: ?number }): { title: string, artwork: ?any, artist: string, album: string, genre: string, duration: number } {
    if (!additionalInfo) {
      return {
        title: '<unknown>',
        artwork: undefined,
        artist: '<unknown>',
        album: '<unknown>',
        genre: '<unknown>',
        duration: 0,
      }
    }

    return {
      title: additionalInfo.title || '<unknown>',
      artwork: additionalInfo.artwork || undefined, // URL or RN's image require()
      artist: additionalInfo.artist || '<unknown>',
      album: additionalInfo.album || '<unknown>',
      genre: additionalInfo.genre || '<unknown>',
      duration: parseFloat(additionalInfo.duration || 0), // (Seconds)
    }
  }
}