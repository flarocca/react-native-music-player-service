# react-native-music-player-service

# Under construction

React Native module ready to use for playing music and managing queue.
It is intended to be used with no configuration and to have a clean and simple interface. It also provides almost everything what it is needed in order to work as a music player.

It is based on [react-native-sound](https://github.com/zmxv/react-native-sound) which is a great library and easy to use. So **react-native-music-player-service** tries to add some semantic through its API interface


## Installation

```
npm install -save react-native-music-player-service
```


## API Overview

Property | Type | Description
---|---|---
random | ``boolean`` | Indicates whether random mode is toggled on or off
repeatMode | ``RepeatModes`` | Indicates which type of repeating mode is set
queue | ``Array<Track>`` | Current queue
isPlaying | ``boolean`` | Indicates whther the current track is in reproduction or not
currentIndex | ``number`` | Points to the current track in the queue

Method | Description
---|---
setQueue | Set a list of track as a new queue for playing.
setRandomGenerator | Allows to set a custom function in order to generate the next index from the queue to be reproduced. 
setRepeatMode | Sets the repeat mode to use. Use RepeatModes enum. <ul><li>``RepeatModes.None``</li><li>``RepeatModes.One``</li><li>``RepeatModes.All``</li></ul>
appendToQueue | Appends to the current queue a new list of tracks.
togglePlayPause | Play or Pause the current track.
playNext | Play the next track in the queue.
playPrev | Play the previous track in the queue.
stop | Stop the current track.
toggleRandom | Set random mode to true or false.
addEventListener | Allows to set a callback for different events. <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li></ul>
removeEventListener | Removes a callback for a particular event. <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li></ul>
getDuration | Gets the duration of the current track
getCurrentTime | Gets the current played elapsed time of the current track
setCurrentTime | Sets the current played elapsed time of the current track


### setQueue

Sets a list of tracks as a new queue to be played. This will replace the current queue. In addition, It will also stop and release the current playing track if playing.

- Return type: ``Promise<Array<Track>>``

:Parameters | :Type | :Mandatory
---|---|---
queue | ``Array<Track>`` | ✓


### setRandomGenerator

Sets a custom random generator to be used when random mode is toggled to true. This is particularlly useful when you want to have some custom logic to randomize.
If you want to reset this generator in order to use the build-in one, just set it to null.

- Return type: ``void``

:Parameters | :Type | :Mandatory
---|---|---
customRandomGenerator | ``Function: number`` | 


### setRepeatMode

Sets the repeat mode, by default the repeat mode is set to ``None``. Allowed values are available by importing ``RepeatModes`` enum.

- ``None``: Set by default, It does not repeat at all. Once the end of the queue is reached, reproduction stops. It moves from 0 to the end of the queue.
- ``All``: Keeps looping the overall queue, once the end is reached it starts from the begining. 
- ``One``: Keeps looping junt on the current track.

- Return type: ``string``

:Parameters | :Type | :Mandatory
---|---|---
repeatMode | <ul><li>``RepeatModes.None``</li><li>``RepeatModes.One``</li><li>``RepeatModes.All``</li></ul> | ✓


### appendToQueue

Appends to the existing queue the queue passed as a parameter. By default, the new queue is appended to the end of the current one. It is possible to specify a particular position through ``atPosition`` parameter.
``atPosition`` must be an integer between 0 and queue's length.

- Return type: ``Promise<Array<Track>>``

:Parameters | :Type | :Mandatory
---|---|---
queue | ``Array<Track>`` | ✓
atPosition | ``number`` | 


### togglePlayPause

Starts playing the track at the current index or pauses it if it was already playing.
The queue should have already set so there is something to play, otherwise it will not start.

If Events.Play was set, then that callback will be fired receiving the current Track as a parameter.

- Return type: ``Promise<Any>``


### playNext

It jumps to the next track in the queue according to the repeat mode selected:

- ``RepeatModes.None``: jumps to the next track in the queue until the last track. Once the last index is reached it stops there
- ``RepeatModes.One``: keeps on the same track
- ``RepeatModes.All``: jumps to the next track in the queue until the last track. Once the last index is reached it starts from the beggining (position 0)

If the service is actually playing the track will start automatically after changing.
When the random mode is toggled on, ``RepeatModes.All`` and ``RepeatModes.None`` behave the same, jumping according to the random generator.

If Events.Next was set, then that callback will be fired receiving the current Track as a parameter.

- Return type: ``void``


### playPrev

It jumps to the previous track in the queue according to the repeat mode selected:

- ``RepeatModes.None``: jumps to the previous track in the queue until the first track. Once the first index is reached it stops there
- ``RepeatModes.One``: keeps on the same track
- ``RepeatModes.All``: jumps to the provious track in the queue until the first track. Once the first index is reached it starts from the end (position queue.length - 1)

If the service is actually playing the track will start automatically after changing.
When the random mode is toggled on, ``RepeatModes.All`` and ``RepeatModes.None`` behave the same, jumping according to the random generator.

If Events.Previous was set, then that callback will be fired receiving the current Track as a parameter.

- Return type: ``void``


### stop

Stops the current reproduction and release the resources taken. It does not reset the queue.

If Events.Stop was set, then that callback will be fired.

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

:Parameters | :Type | :Mandatory
---|---|---
event | <ul><li>``Events.Play``</li><li>``Events.Pause``</li><li>``Events.Stop``</li><li>``Events.Next``</li><li>``Events.Previous``</li><li>``Events.EndReached``</li></ul> | ✓
callback | ``Function`` | ✓


### removeEventListener

Allows to remove a callback to the corresponding event.

- Return type: ``void``

:Parameters | :Type | :Mandatory
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

:Parameters | :Type | :Mandatory
---|---|---
time | ``number`` | ✓


## Usage

```javascript

```

## FAQ


# Under construction
