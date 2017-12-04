# react-native-music-player-service

# Under construction

React Native module ready to use for playing music and managing queue.
It is intended to be used with no configuration and to have a clean and simple interface. It also provides almost everything what it is needed in order to work as a music player.

It is based on [react-native-sound](https://github.com/zmxv/react-native-sound) which is a great library and easy to use. So **react-native-music-player-service** tries to add some semantic through its API interface

## Installation

## API Overview

Method | Description
---|---
setQueue | Set a list of track as a new queue for playing.
setRandomGenerator | Allows to set a custom function in order to generate the next index from the queue to be reproduced. 
setRepeatMode | Sets the repeat mode to use. Use RepeatModes enum. <ul><li>RepeatModes.None</li><li>RepeatModes.One</li><li>RepeatModes.All</li></ul>
appendToQueue | Appends to the current queue a new list of tracks.
togglePlayPause | Play or Pause the current track.
playNext | Play the next track in the queue.
playPrev | Play the previous track in the queue.
stop | Stop the current track.
toggleRandom | Set random mode to true or false.
on | Allows to set a callback for the differents events. <ul><li>Events.Play</li><li>Events.Pause</li><li>Events.Stop</li><li>Events.Next</li><li>Events.Previous</li><li>Events.EndReached</li></ul>
getDuration | Gets the duration of the current track
getCurrentTime | Gets the current played elapsed time of the current track
setCurrentTime | Sets the current played elapsed time of the current track


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


### togglePlayPause

Starts playing the track at the current index or pauses it if it is already playing.
The queue should have already set so there is something to reproduce, otherwise thr reproduction will not start.

- Return type: ``Promise<Any>``


## Usage

## FAQ

# Under construction
