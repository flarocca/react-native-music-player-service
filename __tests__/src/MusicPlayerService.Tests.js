/** * @providesModule react-native-music-control */

import 'jest';

jest.mock('react-native-music-control', () => {

  let MusicControlMocked = () => { };

  MusicControlMocked.enableBackgroundMode = jest.fn();
  MusicControlMocked.on = jest.fn();
  MusicControlMocked.enableControl = jest.fn();
  MusicControlMocked.setNowPlaying = jest.fn();
  MusicControlMocked.updatePlayback = jest.fn();

  MusicControlMocked.STATE_PLAYING = 1;
  MusicControlMocked.STATE_PAUSED = 2;

  return MusicControlMocked;
});

jest.mock('react-native-sound', () => {
  let _filename = null;
  let _basePath = null;
  let _error = null;
  let _options = {
    callCallbackAfterPlay: false
  };

  let SoundMocked = (filename, basePath, onError, options) => {
    _filename = filename;
    _basePath = basePath;
    onError(_error);
  }

  SoundMocked.mockSetOptions = (options) => { _options = options };
  SoundMocked.mockSetError = (error) => { _error = error };
  SoundMocked.mockReset = () => {
    _options = {
      callCallbackAfterPlay: false
    };

    _error = null;
  };
  SoundMocked.prototype.mockGetFilename = () => _filename;
  SoundMocked.prototype.mockGetBasePath = () => _basePath;

  SoundMocked.prototype.play = jest.fn((callback) => {
    if (_options.callCallbackAfterPlay)
      callback();
  });
  SoundMocked.prototype.pause = jest.fn();
  SoundMocked.prototype.stop = jest.fn();
  SoundMocked.prototype.release = jest.fn();
  SoundMocked.prototype.getDuration = jest.fn();
  SoundMocked.prototype.getCurrentTime = jest.fn(callback => callback(0));
  SoundMocked.prototype.setCurrentTime = jest.fn();

  SoundMocked.LIBRARY = 2;

  return SoundMocked;
});

import Track from '../../src/Track';
import MusicPlayerService from '../../src/MusicPlayerService';
import RepeatModes from '../../src/RepeatModes';
import Events from '../../src/Events';

let Sound = require('react-native-sound');
let MusicControl = require('react-native-music-control');

beforeEach(() => {
  Sound.mockReset();
  Sound.prototype.play.mockClear();
  Sound.prototype.pause.mockClear();
  Sound.prototype.stop.mockClear();
  Sound.prototype.release.mockClear();

  MusicControl.on.mockClear();
  MusicControl.enableControl.mockClear();
  MusicControl.enableBackgroundMode.mockClear();
  MusicControl.setNowPlaying.mockClear();
  MusicControl.updatePlayback.mockClear();
});

it('MusicPlayerService | Created | default values are set', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(6);
  expect(musicPlayerService.random).toBe(false);
  expect(musicPlayerService.repeatMode).toBe(RepeatModes.None);
  expect(musicPlayerService.queue).toHaveLength(0);
  expect(musicPlayerService.currentIndex).toBe(-1);
  expect(musicPlayerService.isPlaying).toBe(false);
  expect(musicPlayerService.enableSetNowPlaying).toBe(false);
});

it('MusicPlayerService | Created with enableSetNowPlaying false | MusicControl is not set', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(3);
  expect(MusicControl.enableBackgroundMode).not.toHaveBeenCalled();
  expect(MusicControl.on).not.toHaveBeenCalled();
  expect(MusicControl.enableControl).not.toHaveBeenCalled();
});

it('MusicPlayerService | Created with enableSetNowPlaying true | MusicControl is set', () => {
  let musicPlayerService = new MusicPlayerService(true);

  expect.assertions(20);
  expect(MusicControl.enableBackgroundMode.mock.calls).toHaveLength(1);
  expect(MusicControl.enableBackgroundMode.mock.calls[0][0]).toEqual(true);

  expect(MusicControl.enableControl.mock.calls).toHaveLength(4);
  expect(MusicControl.enableControl.mock.calls[0][0]).toEqual('play');
  expect(MusicControl.enableControl.mock.calls[0][1]).toEqual(true);
  expect(MusicControl.enableControl.mock.calls[1][0]).toEqual('pause');
  expect(MusicControl.enableControl.mock.calls[1][1]).toEqual(true);
  expect(MusicControl.enableControl.mock.calls[2][0]).toEqual('nextTrack');
  expect(MusicControl.enableControl.mock.calls[2][1]).toEqual(true);
  expect(MusicControl.enableControl.mock.calls[3][0]).toEqual('previousTrack');
  expect(MusicControl.enableControl.mock.calls[3][1]).toEqual(true);

  expect(MusicControl.on.mock.calls).toHaveLength(4);
  expect(MusicControl.on.mock.calls[0][0]).toEqual('play');
  expect(MusicControl.on.mock.calls[0][1]).toEqual(musicPlayerService.togglePlayPause);
  expect(MusicControl.on.mock.calls[1][0]).toEqual('pause');
  expect(MusicControl.on.mock.calls[1][1]).toEqual(musicPlayerService.togglePlayPause);
  expect(MusicControl.on.mock.calls[2][0]).toEqual('nextTrack');
  expect(MusicControl.on.mock.calls[2][1]).toEqual(musicPlayerService.playNext);
  expect(MusicControl.on.mock.calls[3][0]).toEqual('previousTrack');
  expect(MusicControl.on.mock.calls[3][1]).toEqual(musicPlayerService.playPrev);
});

test('MusicPlayerService | setQueue with an undefined queue | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.setQueue(undefined)
    .catch(error => {
      expect(error.message).toEqual('Invalid queue [undefined | null]');
    });
});

test('MusicPlayerService | setQueue with a null queue | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.setQueue(null)
    .catch(error => {
      expect(error.message).toEqual('Invalid queue [undefined | null]');
    });
});

test('MusicPlayerService | setQueue a queue containing non Track elements | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.setQueue([new Track({ id: '1', path: 'some path' }), {}])
    .catch(error => {
      expect(error.message).toEqual('Invalid elements in queue [not Track | index: 1]');
    });
});

test('MusicPlayerService | setQueue | new queue is set', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(newQueue);
      expect(musicPlayerService.queue).toEqual(newQueue);
    });
});

test('MusicPlayerService | setQueue | currentPosition is set to 0', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | setQueue and isPlaying | stop is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService.stop = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.setQueue(newQueue)
    })
    .then(() => {
      expect(musicPlayerService.stop).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | setQueue and isPlaying | _playTrack is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.setQueue(newQueue)
    })
    .then(() => {
      expect(musicPlayerService._playTrack).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | setQueue and isPlaying false | stop is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService.stop = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      expect(musicPlayerService.stop).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | setQueue and isPlaying false | _playTrack is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      expect(musicPlayerService._playTrack).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | setQueue | first track in the queue is loaded', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService._loadTrack = jest.fn(track => Promise.resolve(track));

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      expect(musicPlayerService._loadTrack).toHaveBeenCalledWith(newQueue[0]);
    });
});

test('MusicPlayerService | appendToQueue with an undefined queue | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue(undefined)
    .catch(error => {
      expect(error.message).toEqual('Invalid queue [undefined | null]');
    });
});

test('MusicPlayerService | appendToQueue with a null queue | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue(null)
    .catch(error => {
      expect(error.message).toEqual('Invalid queue [undefined | null]');
    });
});

test('MusicPlayerService | appendToQueue a queue containing non Track elements | throws invalid queue', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track({ id: '1', path: 'some path' }), {}])
    .catch(error => {
      expect(error.message).toEqual('Invalid elements in queue [not Track | index: 1]');
    });
});

test('MusicPlayerService | appendToQueue NaN atPosition | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track({ id: '1', path: 'some path' })], {})
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [' + {} + ']');
    });
});

test('MusicPlayerService | appendToQueue atPosition lower than zero | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track({ id: '1', path: 'some path' })], -1)
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [-1]');
    });
});

test('MusicPlayerService | appendToQueue atPosition greater than queue.length | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track({ id: '1', path: 'some path' })], 2)
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [2]');
    });
});

test('MusicPlayerService | appendToQueue without atPosition | new queue is appended at the end', () => {
  let musicPlayerService = new MusicPlayerService();
  let originalQueue = [new Track({ id: '1', path: 'path' })];
  let appendedQueue = [new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];
  let fullQueue = originalQueue.concat(appendedQueue);

  musicPlayerService.setQueue(originalQueue);

  expect.assertions(2);
  return musicPlayerService.appendToQueue(appendedQueue)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(fullQueue);
      expect(musicPlayerService.queue).toEqual(fullQueue);
    });
});

test('MusicPlayerService | appendToQueue with atPosition | new queue is appended at position atPosition', () => {
  let musicPlayerService = new MusicPlayerService();
  let originalQueue = [new Track({ id: '1', path: 'path' }), new Track({ id: '4', path: 'path' })];
  musicPlayerService.setQueue(originalQueue);

  let appendedQueue = [new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];
  let after = originalQueue.splice(0, 1);
  let fullQueue = originalQueue.concat(appendedQueue).concat(after);

  expect.assertions(2);
  return musicPlayerService.appendToQueue(appendedQueue, 1)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(fullQueue);
      expect(musicPlayerService.queue).toEqual(fullQueue);
    });
});

test('MusicPlayerService | appendToQueue is called before setting up the queue | setQueue is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let queue = [new Track({ id: '1', path: 'path' }), new Track({ id: '4', path: 'path' })];
  musicPlayerService.setQueue = jest.fn(() => Promise.resolve(queue));

  expect.assertions(2);
  return musicPlayerService.appendToQueue(queue, 1)
    .then(returnedQueue => {
      expect(musicPlayerService.setQueue).toHaveBeenCalledTimes(1);
      expect(musicPlayerService.setQueue).toHaveBeenCalledWith(queue);
    });
});

test('MusicPlayerService | setRepeatMode not in [all, none, one] | throws invalid repeat mode', () => {
  let musicPlayerService = new MusicPlayerService();
  let invalidRepeatMode = 'invalid repeat mode';

  expect.assertions(1);
  expect(() => musicPlayerService.setRepeatMode(invalidRepeatMode)).toThrowError('Invalid repeat mode. Allowed [all | one | none]. Received [' + invalidRepeatMode + ']');
});

test('MusicPlayerService | setRepeatMode | new repeat mode is set', () => {
  let musicPlayerService = new MusicPlayerService();
  let repeatModeReturned = musicPlayerService.setRepeatMode(RepeatModes.All);

  expect.assertions(2);
  expect(musicPlayerService.repeatMode).toEqual(RepeatModes.All);
  expect(repeatModeReturned).toEqual(RepeatModes.All);
});

test('MusicPlayerService | setRandomGenerator and undefined callback | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.setRandomGenerator(undefined)).toThrowError('Callback must not be null nor undefined. Allowed [Function]. Received [undefined]');
});

test('MusicPlayerService | setRandomGenerator and null callback | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.setRandomGenerator(null)).toThrowError('Callback must not be null nor undefined. Allowed [Function]. Received [null]');
});

test('MusicPlayerService | setRandomGenerator and non-function callback | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();
  let nonFunctionCallback = {};

  expect.assertions(1);
  expect(() => musicPlayerService.setRandomGenerator(nonFunctionCallback)).toThrowError('Callback must not be null nor undefined. Allowed [Function]. Received [' + nonFunctionCallback + ']');
});

test('MusicPlayerService | resetRandomGenerator | set custom random generator to null', () => {
  let musicPlayerService = new MusicPlayerService();
  let nonFunctionCallback = {};

  musicPlayerService.setRandomGenerator(() => { });
  musicPlayerService.resetRandomGenerator();

  expect.assertions(1);
  expect(musicPlayerService._customRandomGenerator).toBeNull();
});

test('MusicPlayerService | toggleRandom when false | random is set to true', () => {
  let musicPlayerService = new MusicPlayerService();
  let randomReturned = musicPlayerService.toggleRandom();

  expect.assertions(2);
  expect(musicPlayerService.random).toEqual(true);
  expect(randomReturned).toEqual(true);
});

test('MusicPlayerService | toggleRandom when true | random is set to false', () => {
  let musicPlayerService = new MusicPlayerService();

  musicPlayerService.toggleRandom();
  let randomReturned = musicPlayerService.toggleRandom();

  expect.assertions(2);
  expect(musicPlayerService.random).toEqual(false);
  expect(randomReturned).toEqual(false);
});

test('MusicPlayerService | addEventListener with invalid event | throws error invalid event', () => {
  let musicPlayerService = new MusicPlayerService();
  let invalidEvent = 'invalid event';

  expect.assertions(1);
  expect(() => musicPlayerService.addEventListener(invalidEvent, () => { })).toThrowError('Invalid event. Allowed [play | pause | stop | next | previous | endReached]. Received [' + invalidEvent + ']');
});

test('MusicPlayerService | addEventListener with undefined callback | throws error invalid callback', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.addEventListener(Events.Pause, undefined)).toThrowError('Callback must not be null nor undefined');
});

test('MusicPlayerService | addEventListener with null callback | throws error invalid callback', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.addEventListener(Events.Pause, null)).toThrowError('Callback must not be null nor undefined');
});

test('MusicPlayerService | addEventListener with non-function callback | throws error invalid callback', () => {
  let musicPlayerService = new MusicPlayerService();
  let nonFunctionCallback = {};

  expect.assertions(1);
  expect(() => musicPlayerService.addEventListener(Events.Pause, nonFunctionCallback)).toThrowError('Callback must not be null nor undefined. Allowed [Function]. Received [ ' + nonFunctionCallback + ']');
});

test('MusicPlayerService | addEventListener setting events | events are set', () => {
  let musicPlayerService = new MusicPlayerService();
  let event = jest.fn();

  musicPlayerService.addEventListener(Events.Play, event);
  musicPlayerService.addEventListener(Events.Pause, event);
  musicPlayerService.addEventListener(Events.Stop, event);
  musicPlayerService.addEventListener(Events.Next, event);
  musicPlayerService.addEventListener(Events.Previous, event);
  musicPlayerService.addEventListener(Events.EndReached, event);

  musicPlayerService._onPlay();
  musicPlayerService._onPause();
  musicPlayerService._onStop();
  musicPlayerService._onNext();
  musicPlayerService._onPrevious();
  musicPlayerService._onEndReached();

  expect.assertions(1);
  expect(event).toHaveBeenCalledTimes(6);
});

test('MusicPlayerService | removeEventListener with invalid event | throws error invalid event', () => {
  let musicPlayerService = new MusicPlayerService();
  let invalidEvent = 'invalid event';

  expect.assertions(1);
  expect(() => musicPlayerService.removeEventListener(invalidEvent)).toThrowError('Invalid event. Allowed [play | pause | stop | next | previous | endReached]. Received [' + invalidEvent + ']');
});

test('MusicPlayerService | removeEventListener setting events | events are set', () => {
  let musicPlayerService = new MusicPlayerService();

  const event = jest.fn();

  musicPlayerService.addEventListener(Events.Play, event);
  musicPlayerService.addEventListener(Events.Pause, event);
  musicPlayerService.addEventListener(Events.Stop, event);
  musicPlayerService.addEventListener(Events.Next, event);
  musicPlayerService.addEventListener(Events.Previous, event);
  musicPlayerService.addEventListener(Events.EndReached, event);

  musicPlayerService.removeEventListener(Events.Play);
  musicPlayerService.removeEventListener(Events.Pause);
  musicPlayerService.removeEventListener(Events.Stop);
  musicPlayerService.removeEventListener(Events.Next);
  musicPlayerService.removeEventListener(Events.Previous);
  musicPlayerService.removeEventListener(Events.EndReached);

  expect.assertions(6);
  expect(musicPlayerService._onPlay).toBeNull();
  expect(musicPlayerService._onPause).toBeNull();
  expect(musicPlayerService._onStop).toBeNull();
  expect(musicPlayerService._onNext).toBeNull();
  expect(musicPlayerService._onPrevious).toBeNull();
  expect(musicPlayerService._onEndReached).toBeNull();
});

test('MusicPlayerService | tooglePlayPause when is not playing and no track loaded | track at currentIndex is loaded', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedPlayingTrack = new Track({ id: '1', path: 'some path' });
  let newQueue = [expectedPlayingTrack, new Track({ id: '2', path: 'some path' })];

  expect.assertions(3);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService._trackPlaying).not.toBeNull();
      expect(musicPlayerService._trackPlaying.mockGetFilename()).toEqual(expectedPlayingTrack.path);
      expect(musicPlayerService._trackPlaying.mockGetBasePath()).toEqual(2);
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing and no queue loaded | reject is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.togglePlayPause()
    .catch((err) => {
      expect(err).toEqual('Queue not set. Set queue before playing.');
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing and no track loaded and error loading track | reject is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];
  let error = 'mock error';

  Sound.mockSetError(error);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.togglePlayPause()
    }).catch((err) => {
      expect(err).toEqual(error);
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing | play is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService._trackPlaying.play).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing and play is called | playNext is called after track finishes', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService.playNext = jest.fn();
  Sound.mockSetOptions({ callCallbackAfterPlay: true });

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService.playNext).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing and onPlay is set | onPlay is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedTrack = new Track({ id: '2', path: 'some path' });
  let newQueue = [expectedTrack];
  let mockOnPlay = jest.fn();

  musicPlayerService.addEventListener(Events.Play, mockOnPlay);

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(mockOnPlay).toHaveBeenCalledTimes(1);
      expect(mockOnPlay).toHaveBeenCalledWith(expectedTrack);
    });
});

test('MusicPlayerService | tooglePlayPause when is not playing | isPlaying is set to true', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService.isPlaying).toEqual(true);
    });
});

test('MusicPlayerService | tooglePlayPause when is playing | pause is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService._trackPlaying.pause).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | tooglePlayPause when is playing and onPause is set | onPause is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];
  let mockOnPause = jest.fn();

  musicPlayerService.addEventListener(Events.Pause, mockOnPause);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(mockOnPause).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | tooglePlayPause when is playing | isPlaying is set to false', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(musicPlayerService.isPlaying).toEqual(false);
    });
});

test('MusicPlayerService | tooglePlayPause to play and enableSetNowPlaying true | MusicControl.setNowPlaying is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }

  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path', additionalInfo })];

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.setNowPlaying).toHaveBeenCalledTimes(1);
      expect(MusicControl.setNowPlaying).toHaveBeenCalledWith({ ...setNowPlayingConfig, ...additionalInfo });
    });
});

test('MusicPlayerService | tooglePlayPause to play and enableSetNowPlaying true | MusicControl.updatePlayback is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }
  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }
  let elapsedTime = 100;

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path', additionalInfo })];

  musicPlayerService.getCurrentTime = jest.fn(() => Promise.resolve(elapsedTime));

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.updatePlayback).toHaveBeenCalledTimes(1);
      expect(MusicControl.updatePlayback).toHaveBeenCalledWith({ state: MusicControl.STATE_PLAYING, elapsedTime });
    });
});

test('MusicPlayerService | tooglePlayPause to pause and enableSetNowPlaying true | MusicControl.updatePlayback is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }
  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }
  let elapsedTime = 100;

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path', additionalInfo })];

  musicPlayerService.getCurrentTime = jest.fn(() => Promise.resolve(elapsedTime));

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      MusicControl.updatePlayback.mockClear();
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.updatePlayback).toHaveBeenCalledTimes(1);
      expect(MusicControl.updatePlayback).toHaveBeenCalledWith({ state: MusicControl.STATE_PAUSED, elapsedTime });
    });
});

test('MusicPlayerService | tooglePlayPause to play and enableSetNowPlaying false | MusicControl.setNowPlaying is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.setNowPlaying).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | tooglePlayPause to play and enableSetNowPlaying false | MusicControl.updatePlayback is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.updatePlayback).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | tooglePlayPause to pause and enableSetNowPlaying false | MusicControl.updatePlayback is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      expect(MusicControl.updatePlayback).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playNext and random false and repeatMode one | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.One);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playNext and random true and repeatMode one | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.One);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playNext and random false and repeatMode all and currentIndex != lastIndex | currentIndex increments in one', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(1);
    });
});

test('MusicPlayerService | playNext and random false and repeatMode all and currentIndex == lastIndex | currentIndex changes to 0', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.currentIndex = 2;
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playNext and random true and repeatMode all | currentIndex sets according to random generator function', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 3;
  musicPlayerService._randomGenerator = () => expectedIndex;
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
    });
});

test('MusicPlayerService | playNext and random false and repeatMode none and currentIndex != lastIndex | currentIndex increments in one', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(1);
    });
});

test('MusicPlayerService | playNext and random false and repeatMode none and currentIndex == lastIndex | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.currentIndex = 2;
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(2);
    });
});

test('MusicPlayerService | playNext and random true and repeatMode none | currentIndex changes according to random generator function', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 3;
  musicPlayerService._randomGenerator = () => expectedIndex;
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playNext()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
    });
});

test('MusicPlayerService | playNext and onNext is set | onNext is called with next track', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedTrack = new Track({ id: '2', path: 'some path' });
  let newQueue = [new Track({ id: '1', path: 'some path' }), expectedTrack];
  let mockOnNext = jest.fn();

  musicPlayerService.addEventListener(Events.Next, mockOnNext);

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.playNext();

      expect(mockOnNext).toHaveBeenCalledTimes(1);
      expect(mockOnNext).toHaveBeenCalledWith(expectedTrack);
    });
});

test('MusicPlayerService | playNext when is not playing | _playTrack is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.playNext();

      expect(musicPlayerService._playTrack).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playNext when is playing | _playTrack is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      musicPlayerService.playNext()

      expect(musicPlayerService._playTrack).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | playNext and random true and customRandomGenerator is set | currentIndex is set according to customRandomGenerator', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 5;
  let customRandomGenerator = jest.fn(() => expectedIndex);
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' }), new Track({ id: '6', path: 'some path' }), new Track({ id: '7', path: 'some path' })];

  musicPlayerService.setRandomGenerator(customRandomGenerator);
  musicPlayerService.toggleRandom();

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.playNext()

      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
      expect(customRandomGenerator).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | playNext and enableSetNowPlaying true | MusicControl.setNowPlaying is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }

  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path', additionalInfo })];

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.playNext();

      expect(MusicControl.setNowPlaying).toHaveBeenCalledTimes(1);
      expect(MusicControl.setNowPlaying).toHaveBeenCalledWith({ ...setNowPlayingConfig, ...additionalInfo });
    });
});

test('MusicPlayerService | playNext and enableSetNowPlaying true and isPlaying and currentIndex does not change | takes no effect', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  MusicControl._releaseTrack = jest.fn();
  MusicControl._setNowPlaying = jest.fn();
  MusicControl._onNext = jest.fn();
  MusicControl._playTrack = jest.fn();

  expect.assertions(4);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.isPlaying = true;
      musicPlayerService.playNext();

      expect(MusicControl._releaseTrack).not.toHaveBeenCalled();
      expect(MusicControl._setNowPlaying).not.toHaveBeenCalled();
      expect(MusicControl._onNext).not.toHaveBeenCalled();
      expect(MusicControl._playTrack).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playNext and enableSetNowPlaying false | MusicControl.setNowPlaying is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.playNext();

      expect(MusicControl.setNowPlaying).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playNext and currentIndex changes | _releaseTrack is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService._releaseTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService._releaseTrack.mockClear()

      musicPlayerService.playNext();

      expect(musicPlayerService._releaseTrack).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | playPrev and random false and repeatMode one | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.One);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playPrev and random true and repeatMode one | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.One);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playPrev and random false and repeatMode all and currentIndex != 0 | currentIndex decrements in one', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.currentIndex = 2;

      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(1);
    });
});

test('MusicPlayerService | playPrev and random false and repeatMode all and currentIndex == 0 | currentIndex changes to lastIndex', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(2);
    });
});

test('MusicPlayerService | playPrev and random true and repeatMode all | currentIndex sets according to random generator function', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 3;
  musicPlayerService._randomGenerator = () => expectedIndex;
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.All);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
    });
});

test('MusicPlayerService | playPrev and random false and repeatMode none and currentIndex != 0 | currentIndex decrements in one', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.currentIndex = 1
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playPrev and random false and repeatMode none and currentIndex == 0 | currentIndex does not change', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(0);
    });
});

test('MusicPlayerService | playPrev and random true and repeatMode none | currentIndex changes according to random generator function', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 3;
  musicPlayerService._randomGenerator = () => expectedIndex;
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' })];

  musicPlayerService.setRepeatMode(RepeatModes.None);
  musicPlayerService.toggleRandom();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.playPrev()
    })
    .then(() => {
      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
    });
});

test('MusicPlayerService | playPrev and onPrev is set | onPrev is called with prev track', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedTrack = new Track({ id: '2', path: 'some path' });
  let newQueue = [expectedTrack, new Track({ id: '1', path: 'some path' })];
  let mockOnPrev = jest.fn();

  musicPlayerService.addEventListener(Events.Previous, mockOnPrev);

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.currentIndex = 1;
      musicPlayerService.playPrev();

      expect(mockOnPrev).toHaveBeenCalledTimes(1);
      expect(mockOnPrev).toHaveBeenCalledWith(expectedTrack);
    });
});

test('MusicPlayerService | playPrev when is not playing | _playTrack is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.playPrev();

      expect(musicPlayerService._playTrack).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playPrev when is playing | _playTrack is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' })];

  musicPlayerService._playTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(returnedQueue => {
      musicPlayerService.playPrev()

      expect(musicPlayerService._playTrack).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | playPrev and random true and customRandomGenerator is set | currentIndex is set according to customRandomGenerator', () => {
  let musicPlayerService = new MusicPlayerService();
  let expectedIndex = 5;
  let customRandomGenerator = jest.fn(() => expectedIndex);
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' }), new Track({ id: '3', path: 'some path' }), new Track({ id: '4', path: 'some path' }), new Track({ id: '5', path: 'some path' }), new Track({ id: '6', path: 'some path' }), new Track({ id: '7', path: 'some path' })];

  musicPlayerService.setRandomGenerator(customRandomGenerator);
  musicPlayerService.toggleRandom();

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      musicPlayerService.playPrev()

      expect(musicPlayerService.currentIndex).toEqual(expectedIndex);
      expect(customRandomGenerator).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | playPrev and enableSetNowPlaying true | MusicControl.setNowPlaying is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }

  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '1', path: 'some path', additionalInfo }), new Track({ id: '2', path: 'some path' })];

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.currentIndex = 1;
      musicPlayerService.playPrev();

      expect(MusicControl.setNowPlaying).toHaveBeenCalledTimes(1);
      expect(MusicControl.setNowPlaying).toHaveBeenCalledWith({ ...setNowPlayingConfig, ...additionalInfo });
    });
});

test('MusicPlayerService | playPrev and isPlaying and currentIndex does not change | takes no effect', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  MusicControl._releaseTrack = jest.fn();
  MusicControl._setNowPlaying = jest.fn();
  MusicControl._onNext = jest.fn();
  MusicControl._playTrack = jest.fn();

  expect.assertions(4);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.isPlaying = true;
      musicPlayerService.playPrev();

      expect(MusicControl._releaseTrack).not.toHaveBeenCalled();
      expect(MusicControl._setNowPlaying).not.toHaveBeenCalled();
      expect(MusicControl._onNext).not.toHaveBeenCalled();
      expect(MusicControl._playTrack).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playPrev and enableSetNowPlaying false | MusicControl.setNowPlaying is not called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService.playPrev();

      expect(MusicControl.setNowPlaying).not.toHaveBeenCalled();
    });
});

test('MusicPlayerService | playPrev and currentIndex changes | _releaseTrack is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];

  musicPlayerService._releaseTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService._releaseTrack.mockClear()
      musicPlayerService.currentIndex = 1;

      musicPlayerService.playPrev();

      expect(musicPlayerService._releaseTrack).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | stop and track loaded | stop is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];

  musicPlayerService._releaseTrack = jest.fn();

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      musicPlayerService.stop();

      expect(musicPlayerService._trackPlaying.stop).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | stop and track loaded | release is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];


  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      musicPlayerService._trackPlaying.release = jest.fn(() => {
        expect(musicPlayerService._trackPlaying.release).toHaveBeenCalledTimes(1);
      });

      musicPlayerService.stop();

      expect(musicPlayerService._trackPlaying).toBeNull();
    });
});

test('MusicPlayerService | stop and track loaded and onStop is set | onStop is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '2', path: 'some path' })];
  let mockOnStop = jest.fn();

  musicPlayerService.addEventListener(Events.Stop, mockOnStop);

  expect.assertions(1);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      musicPlayerService.stop();

      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | stop and enableSetNowPlaying true | MusicControl.updatePlayback is called', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }
  let additionalInfo = {
    title: 'title',
    artwork: 'artwork',
    artist: 'artist',
    album: 'album',
    genre: 'genre',
    duration: 1000
  }
  let elapsedTime = 100;

  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let newQueue = [new Track({ id: '2', path: 'some path', additionalInfo })];

  musicPlayerService.getCurrentTime = jest.fn(() => Promise.resolve(elapsedTime));

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause()
    })
    .then(() => {
      MusicControl.updatePlayback.mockClear();
      musicPlayerService.stop();

      return Promise.resolve();
    })
    .then(() => {
      expect(MusicControl.updatePlayback).toHaveBeenCalledTimes(1);
      expect(MusicControl.updatePlayback).toHaveBeenCalledWith({ state: MusicControl.STATE_PAUSED, elapsedTime });
    });
});

test('MusicPlayerService | getDuration and isPlaying false | returns 0', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(musicPlayerService.getDuration()).toEqual(0);
});

test('MusicPlayerService | getDuration and isPlaying true | returns current track duration', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];
  let expectedDuration = 3;

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause();
    })
    .then(() => {
      musicPlayerService._trackPlaying.getDuration = jest.fn(() => expectedDuration);

      expect(musicPlayerService.getDuration()).toEqual(expectedDuration);
      expect(musicPlayerService._trackPlaying.getDuration).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | getCurrentTime and no track loaded | returns 0', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.getCurrentTime()
    .then(currentTime => {
      expect(currentTime).toEqual(0);
    });
});

test('MusicPlayerService | getCurrentTime and track loaded | returns current track time', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];
  let expectedCurrentTime = 3;

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(() => {
      musicPlayerService._trackPlaying.getCurrentTime = jest.fn(callback => callback(expectedCurrentTime));
      return musicPlayerService.getCurrentTime()
    })
    .then(currentTime => {
      expect(currentTime).toEqual(expectedCurrentTime);
      expect(musicPlayerService._trackPlaying.getCurrentTime).toHaveBeenCalledTimes(1);
    });
});

test('MusicPlayerService | setCurrentTime and and time undefined | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.setCurrentTime(undefined)).toThrowError('Time must not be null nor undefined. Allowed [Number | 0 >=]. Received [undefined]')
});

test('MusicPlayerService | setCurrentTime and and time null | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  expect(() => musicPlayerService.setCurrentTime(null)).toThrowError('Time must not be null nor undefined. Allowed [Number | 0 >=]. Received [null]')
});

test('MusicPlayerService | setCurrentTime and and time not a number | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();
  let nonNumber = {};

  expect.assertions(1);
  expect(() => musicPlayerService.setCurrentTime(nonNumber)).toThrowError('Time must not be null nor undefined. Allowed [Number | 0 >=]. Received [' + nonNumber + ']')
});

test('MusicPlayerService | setCurrentTime and and time lower than 0 | throws exception', () => {
  let musicPlayerService = new MusicPlayerService();
  let time = -0.1;

  expect.assertions(1);
  expect(() => musicPlayerService.setCurrentTime(time)).toThrowError('Time must not be null nor undefined. Allowed [Number | 0 >=]. Received [' + time + ']')
});

test('MusicPlayerService | setCurrentTime when playing | track playing setCurrentTime is called', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track({ id: '1', path: 'some path' }), new Track({ id: '2', path: 'some path' })];
  let expectedTime = 2.5;

  expect.assertions(2);
  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      return musicPlayerService.togglePlayPause();
    })
    .then(() => {
      musicPlayerService._trackPlaying.setCurrentTime = jest.fn();
      musicPlayerService.setCurrentTime(expectedTime);

      expect(musicPlayerService._trackPlaying.setCurrentTime).toHaveBeenCalledTimes(1);
      expect(musicPlayerService._trackPlaying.setCurrentTime).toHaveBeenCalledWith(expectedTime);
    });
});

test('MusicPlayerService | _setNowPlaying with track with no additionalInfo | setNowPlaying is set with default values', () => {
  let setNowPlayingConfig = {
    color: 'some color',
    notificationIcon: 'notificationIcon'
  }
  let musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);
  let trackWithNoAdditionalInfo = new Track({ id: '1', path: 'some path' });

  expect.assertions(2);
  musicPlayerService._setNowPlaying(trackWithNoAdditionalInfo);

  expect(MusicControl.setNowPlaying).toHaveBeenCalledTimes(1);
  expect(MusicControl.setNowPlaying).toHaveBeenCalledWith({
    title: '<unknown>',
    artwork: undefined,
    artist: '<unknown>',
    album: '<unknown>',
    genre: '<unknown>',
    duration: 0,
    color: setNowPlayingConfig.color,
    notificationIcon: setNowPlayingConfig.notificationIcon
  });
});

test('MusicPlayerService | _setNowPlaying with track with no configuration provided | setNowPlaying is set with default values', () => {
  let musicPlayerService = new MusicPlayerService(true);
  let trackWithNoAdditionalInfo = new Track({ id: '1', path: 'some path' });

  expect.assertions(2);
  musicPlayerService._setNowPlaying(trackWithNoAdditionalInfo);

  expect(MusicControl.setNowPlaying).toHaveBeenCalledTimes(1);
  expect(MusicControl.setNowPlaying).toHaveBeenCalledWith({
    title: '<unknown>',
    artwork: undefined,
    artist: '<unknown>',
    album: '<unknown>',
    genre: '<unknown>',
    duration: 0,
    color: undefined,
    notificationIcon: undefined
  });
});