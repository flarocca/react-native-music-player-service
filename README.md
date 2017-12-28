[npm-badge]: https://img.shields.io/badge/npm-v0.1.4--beta-blue.svg
[coverage-badge]: https://img.shields.io/badge/coverage-%2597-brightgreen.svg
[license-badge]: https://img.shields.io/badge/license-MIT-red.svg
[npm-url]: https://www.npmjs.com/package/react-native-music-player-service
[license-url]: https://github.com/flarocca/react-native-music-player-service/blob/master/LICENSE

# react-native-music-player-service

[![npm][npm-badge]][npm-url]
![coverage][coverage-badge]
[![license][license-badge]][license-url]

React Native module ready to use for playing music and managing queue.
It is intended to be used with no configuration and to have a clean and simple interface. It also provides almost everything what it is needed in order to work as a music player.

It is based on [react-native-sound](https://github.com/zmxv/react-native-sound) and [react-native-music-control](https://github.com/tanguyantoine/react-native-music-control) which are great libraries and easy to use. So **react-native-music-player-service** tries to add some semantic through their API interfaces and put them to work togheter so It can be used with a minimal effort.


## Installation

```
npm install -save react-native-music-player-service
```
```
react-native link
```

Or follow manual installation from:

- [react-native-sound](https://github.com/zmxv/react-native-sound/wiki/Installation)
- [react-native-music-control](https://github.com/tanguyantoine/react-native-music-control)


## API Overview

Property | Type | Description
---|---|---
random | ``boolean`` | Indicates whether random mode is toggled on or off
repeatMode | ``RepeatModes`` | Indicates which type of repeating mode is set
queue | ``Array<Track>`` | Current queue
isPlaying | ``boolean`` | Indicates whther the current track is in reproduction or not
currentIndex | ``number`` | Points to the current track in the queue
enableSetNowPlaying | ``boolean`` | Indicates whether to use Music Control or not
setNowPlayingConfig | ``{ notificationIcon: string, color: number }`` | Configuration eventually required by **react-native-music-control**

Method | Description
---|---
setQueue | Set a list of track as a new queue for playing.
setRandomGenerator | Allows to set a custom function in order to generate the next index from the queue to be reproduced. 
resetRandomGenerator | Sets back the random generator to the original one. 
setRepeatMode | Sets the repeat mode to use. Use RepeatModes enum. <ul><li>``RepeatModes.None``</li><li>``RepeatModes.One``</li><li>``RepeatModes.All``</li></ul>
appendToQueue | Appends to the current queue a new list of tracks.
togglePlayPause | Play or Pause the current track.
playNext | Play the next track in the queue.
playPrev | Play the previous track in the queue.
stop | Stop the current track.
toggleRandom | Set random mode to true or false.
addEventListener | Allows to set a callback for different events. <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li><li>``Events.OnError``</li></ul>
removeEventListener | Removes a callback for a particular event. <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li><li>``Events.OnError``</li></ul>
getDuration | Gets the duration of the current track
getCurrentTime | Gets the current played elapsed time of the current track
setCurrentTime | Sets the current played elapsed time of the current track


### constructor

Allows to activate the music control provided by **react-native-music-control** and its configuration. If ``enableSetNowPlaying`` is set to ``true`` the music control will be available. The music control will be updated everytime the current tarck changes and will also respond to commands executed by the user.

Parameters | Type | Mandatory
---|---|---
enableSetNowPlaying | ``boolean`` | 
setNowPlayingConfig | ``{ notificationIcon: string, color: number }`` | ✓


### setQueue

Sets a list of tracks as a new queue to be played. This will replace the current queue. In addition, It will also stop and release the current playing track if playing.

- Return type: ``Promise<Array<Track>>``

Parameters | Type | Mandatory
---|---|---
queue | ``Array<Track>`` | ✓


### setRandomGenerator

Sets a custom random generator to be used when random mode is toggled to true. This is particularlly useful when you want to have some custom logic to randomize.
If you want to reset this generator in order to use the build-in one, just set it to null.

- Return type: ``void``

Parameters | Type | Mandatory
---|---|---
customRandomGenerator | ``Function: number`` | 


### resetRandomGenerator

Sets back the random generator to the original one.

- Return type: ``void``


### setRepeatMode

Sets the repeat mode, by default the repeat mode is set to ``None``. Allowed values are available by importing ``RepeatModes`` enum.

- ``None``: Set by default, It does not repeat at all. Once the end of the queue is reached, reproduction stops. It moves from 0 to the end of the queue.
- ``All``: Keeps looping the overall queue, once the end is reached it starts from the begining. 
- ``One``: Keeps looping junt on the current track.

- Return type: ``string``

Parameters | Type | Mandatory
---|---|---
repeatMode | <ul><li>``RepeatModes.None``</li><li>``RepeatModes.One``</li><li>``RepeatModes.All``</li></ul> | ✓


### appendToQueue

Appends to the existing queue the queue passed as a parameter. By default, the new queue is appended to the end of the current one. It is possible to specify a particular position through ``atPosition`` parameter.
``atPosition`` must be an integer between 0 and queue's length.

- Return type: ``Promise<Array<Track>>``

Parameters | Type | Mandatory
---|---|---
queue | ``Array<Track>`` | ✓
atPosition | ``number`` | 


### removeFromQueue

Removes from the queue the ids sent by through parameters. If an id is not found in the queue it is just ignored. If the current playing track is removed, the reproduction is stopped and next track in the queue is automaticly played.
Returns a promise with the queue after being modified.

- Return type: ``Promise<Array<Track>>``

Parameters | Type | Mandatory
---|---|---
ids | ``Array<string>`` | ✓


### togglePlayPause

Starts playing the track at the current index or pauses it if it was already playing.
The queue should have already set so there is something to play, otherwise it will not start.

If Events.Play was set, then that callback will be fired receiving the current Track as a parameter.

- Return type: ``Promise<Any>``


### play

Starts playing the track corresponding to the id passed through parameters. Is important to mention that the currentIndex will be moved to the position where the track is situated.
If the id does not exist or it is null or undefined the promise is rejected. If there is a track in reproduction it will be stopped.

Event.Stop and Event.Play will be fired if they were properly set.

- Return type: ``Promise<Any>``

Parameters | Type | Mandatory
---|---|---
id | ``string`` | ✓


### playNext

It jumps to the next track in the queue according to the repeat mode selected:

- ``RepeatModes.None``: jumps to the next track in the queue until the last track. Once the last index is reached it stops there
- ``RepeatModes.One``: keeps on the same track
- ``RepeatModes.All``: jumps to the next track in the queue until the last track. Once the last index is reached it starts from the beggining (position 0)

If the service is actually playing the track will start automatically after changing.
When the random mode is toggled on, ``RepeatModes.All`` and ``RepeatModes.None`` behave the same, jumping according to the random generator.

If Events.Next was set, then that callback will be fired receiving the current Track as a parameter.
If an error occurs and Events.OnError was set, then that callback will be fired receiving the error as a parameter.

- Return type: ``void``


### playPrev

It jumps to the previous track in the queue according to the repeat mode selected:

- ``RepeatModes.None``: jumps to the previous track in the queue until the first track. Once the first index is reached it stops there
- ``RepeatModes.One``: keeps on the same track
- ``RepeatModes.All``: jumps to the provious track in the queue until the first track. Once the first index is reached it starts from the end (position queue.length - 1)

If the service is actually playing the track will start automatically after changing.
When the random mode is toggled on, ``RepeatModes.All`` and ``RepeatModes.None`` behave the same, jumping according to the random generator.

If Events.Previous was set, then that callback will be fired receiving the current Track as a parameter.
If an error occurs and Events.OnError was set, then that callback will be fired receiving the error as a parameter.

- Return type: ``void``


### stop

Stops the current reproduction and release the resources taken. It does not reset the queue.

If Events.Stop was set, then that callback will be fired.
If an error occurs and Events.OnError was set, then that callback will be fired receiving the error as a parameter.

- Return type: ``void``


### toggleRandom

Toggles the random mode between true and false. When this mode is toggled on the next or previous track to be played is calculated using the random generator function. Default value for random is ``false``.
It will return the value after changing.

If there is no custom random generator set, the following generator will be used:

```javascript
Math.floor(Math.random() * (this.queue.length - 1))
```

- Return type: ``boolean``


### addEventListener

Allows to set a callback to be fired when the corresponding event.

- Return type: ``void``

Parameters | Type | Mandatory
---|---|---
event | <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li></ul> | ✓
callback | ``Function`` | ✓


### removeEventListener

Allows to remove a callback to the corresponding event.

- Return type: ``void``

Parameters | Type | Mandatory
---|---|---
event | <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li></ul> | ✓


### getDuration

Returns the duration of the track at the current index in the queue. If there is no track in the queue it returns 0.

- Return type: ``number``


### getCurrentTime

Returns the current elapsed time in seconds. If there is no track (e.g. calling it before setting the queue) it returns 0.

- Return type: ``Promise<number>``


### setCurrentTime

Sets tue current timeframe where the current track is situated. If there is no track loaded it does nothing.
Time must be a number greater or equal than 0. An exception is thrown otherwise.

- Return type: ``void``

Parameters | Type | Mandatory
---|---|---
time | ``number`` | ✓


### Track

Parameters | Type | Mandatory
---|---|---
id | ``string`` | ✓
path | ``string`` | ✓
position | ``number`` | 
additionalInfo | <ul><li>title: ``?string``</li><li>artwork: ``?any``</li><li>artist: ``?string``</li><li>album: ``?string``</li><li>genre: ``?string``</li><li>duration: ``?number``</li></ul> | 

- **additionalInfo** will be used to show information about the current tarck in the music control
- **position** is set after the queue is set or appended. It does not actually support pre-ordering based on it. If you want to have a partilar order, you must do it before setting the queue at the creation of the array level.


## Usage

```javascript
import MusicPlayerService, { Track, Events, RepeatModes } from 'react-native-music-player-service';

const _event = (event, track) => { 
    console.log(event.toString() + ' has been raised with ' + track.toString());
}

const setNowPlayingConfig = {
  color: 0x2E2E2E,
  notificationIcon: 'my_custom_icon'
}

var musicPlayerService = new MusicPlayerService(true, setNowPlayingConfig);

/* Initialization */
musicPlayerService.addEventListener(Events.Play, track => _event(Events.Play, track));
musicPlayerService.addEventListener(Events.Pause, track => _event(Events.Pause, track));
musicPlayerService.addEventListener(Events.Next, track => _event(Events.Next, track));
musicPlayerService.addEventListener(Events.Previous, track => _event(Events.Previous, track));
musicPlayerService.addEventListener(Events.EndReached, track => _event(Events.EndReached, track));

/* Setting up the queue */
var songsInformation = [
    {
        id: "1",
        path: "//path_physical_file",
        title: "track_1",
        album: "some album",
        artist: "some artist",
        genre: "some genre",
        duration: 2260,
        artwork: "//path_to_image"
    }
]
var tracks = songsInformation.map(s => {
    return new Track({id: s.id, path: s.path, additionalInfo: s});
})

musicPlayerService.setQueue(tracks)
  .then(returnedQueue => {
      console.log('Queue has been set');
      return musicPlayerService.togglePlayPause();
  })
  .then(() => {
    console.log('Play or pause has been toggled');
  });

musicPlayerService.playNext();
```