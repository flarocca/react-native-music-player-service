import 'jest';

jest.mock('react-native-sound', () => ({
  Sound: jest.fn()
}));

import Track from '../../src/Track';
import MusicPlayerService from '../../src/MusicPlayerService';
import RepeatModes from '../../src/RepeatModes';
import Events from '../../src/Events';

it('MusicPlayerService | Created | default values are set', () => {
  let musicPlayerService = new MusicPlayerService();

  expect(musicPlayerService.random).toBe(false);
  expect(musicPlayerService.repeatMode).toBe(RepeatModes.None);
  expect(musicPlayerService.queue).toHaveLength(0);
  expect(musicPlayerService.currentIndex).toBe(-1);
  expect(musicPlayerService.isPlaying).toBe(false);
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
  return musicPlayerService.setQueue([new Track('1', 'some path'), {}])
    .catch(error => {
      expect(error.message).toEqual('Invalid elements in queue [not Track | index: 1]');
    });
});

test('MusicPlayerService | setQueue | new queue is set', () => {
  let musicPlayerService = new MusicPlayerService();
  let newQueue = [new Track('1', 'some path'), new Track('2', 'some path')];

  return musicPlayerService.setQueue(newQueue)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(newQueue);
      expect(musicPlayerService.queue).toEqual(newQueue);
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
  return musicPlayerService.appendToQueue([new Track('1', 'some path'), {}])
    .catch(error => {
      expect(error.message).toEqual('Invalid elements in queue [not Track | index: 1]');
    });
});

test('MusicPlayerService | appendToQueue NaN atPosition | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track('1', 'some path')], {})
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [' + {} + ']');
    });
});

test('MusicPlayerService | appendToQueue atPosition lower than zero | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track('1', 'some path')], -1)
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [-1]');
    });
});

test('MusicPlayerService | appendToQueue atPosition greater than queue.length | throws invalid atPosition', () => {
  let musicPlayerService = new MusicPlayerService();

  expect.assertions(1);
  return musicPlayerService.appendToQueue([new Track('1', 'some path')], 2)
    .catch(error => {
      expect(error.message).toEqual('Parameter atPosition must be a number between 0 and queue.length. Received [2]');
    });
});

test('MusicPlayerService | appendToQueue without atPosition | new queue is appended at the end', () => {
  let musicPlayerService = new MusicPlayerService();
  let originalQueue = [new Track('1', 'path')];
  let appendedQueue = [new Track('2', 'some path'), new Track('3', 'some path')];
  let fullQueue = originalQueue.concat(appendedQueue);

  musicPlayerService.setQueue(originalQueue);

  expect.assertions(2);
  return musicPlayerService.appendToQueue(appendedQueue)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(fullQueue);
      expect(musicPlayerService.queue).toEqual(fullQueue);
    });
});

test('MusicPlayerService | appendToQueue without atPosition | new queue is appended at position 1', () => {
  let musicPlayerService = new MusicPlayerService();
  let originalQueue = [new Track('1', 'path'), new Track('4', 'path')];
  musicPlayerService.setQueue(originalQueue);

  let appendedQueue = [new Track('2', 'some path'), new Track('3', 'some path')];
  let after = originalQueue.splice(0, 1);
  let fullQueue = originalQueue.concat(appendedQueue).concat(after);

  expect.assertions(2);
  return musicPlayerService.appendToQueue(appendedQueue, 1)
    .then(returnedQueue => {
      expect(returnedQueue).toEqual(fullQueue);
      expect(musicPlayerService.queue).toEqual(fullQueue);
    });
});

test('MusicPlayerService | setRepeatMode not in [all, none, one] | throws invalid repeat mode', () => {
  let musicPlayerService = new MusicPlayerService();
  let invalidRepeatMode = 'invalid repeat mode';

  expect(() => musicPlayerService.setRepeatMode(invalidRepeatMode)).toThrowError('Invalid repeat mode. Allowed [all | one | none]. Received [' + invalidRepeatMode + ']');
});

test('MusicPlayerService | setRepeatMode | new repeat mode is set', () => {
  let musicPlayerService = new MusicPlayerService();

  let repeatModeReturned = musicPlayerService.setRepeatMode(RepeatModes.All);
  expect(musicPlayerService.repeatMode).toEqual(RepeatModes.All);
  expect(repeatModeReturned).toEqual(RepeatModes.All);
});

test('MusicPlayerService | toggleRandom when false | random is set to true', () => {
  let musicPlayerService = new MusicPlayerService();

  let randomReturned = musicPlayerService.toggleRandom();
  expect(musicPlayerService.random).toEqual(true);
  expect(randomReturned).toEqual(true);
});

test('MusicPlayerService | toggleRandom when true | random is set to false', () => {
  let musicPlayerService = new MusicPlayerService();

  musicPlayerService.toggleRandom();
  let randomReturned = musicPlayerService.toggleRandom();
  expect(musicPlayerService.random).toEqual(false);
  expect(randomReturned).toEqual(false);
});

test('MusicPlayerService | on with invalid event | throws error invalid event', () => {
  let musicPlayerService = new MusicPlayerService();
  let invalidEvent = 'invalid event';

  expect(() => musicPlayerService.on(invalidEvent, () => { })).toThrowError('Invalid event. Allowed [play | pause | stop | next | previous | endReached]. Received [' + invalidEvent + ']');
});

test('MusicPlayerService | on with undefined callback | throws error invalid callback', () => {
  let musicPlayerService = new MusicPlayerService();

  expect(() => musicPlayerService.on(Events.Pause, undefined)).toThrowError('Callback must not be null nor undefined');
});

test('MusicPlayerService | on with null callback | throws error invalid callback', () => {
  let musicPlayerService = new MusicPlayerService();

  expect(() => musicPlayerService.on(Events.Pause, null)).toThrowError('Callback must not be null nor undefined');
});

test('MusicPlayerService | on setting events | events are set', () => {
  let musicPlayerService = new MusicPlayerService();
  let event = () => { expect(true).toBe(true) }

  musicPlayerService.on(Events.Play, event);
  musicPlayerService.on(Events.Pause, event);
  musicPlayerService.on(Events.Stop, event);
  musicPlayerService.on(Events.Next, event);
  musicPlayerService.on(Events.Previous, event);
  musicPlayerService.on(Events.EndReached, event);

  expect.assertions(6);
  musicPlayerService._onPlay();
  musicPlayerService._onPause();
  musicPlayerService._onStop();
  musicPlayerService._onNext();
  musicPlayerService._onPrevious();
  musicPlayerService._onEndReached();
});