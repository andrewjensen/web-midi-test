//See: http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/

var MIDI = (function() {

    var MIDI = function() {
        this._midiAccess = null;
    };

    MIDI.prototype.requestAccess = function(onSuccess, onError) {
        var thisMIDI = this;
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: false // this defaults to 'false' and we won't be covering sysex in this article.
            }).then(function(midiAccess) {
                //Success!
                thisMIDI._midiAccess = midiAccess;
                onSuccess();
            }, function(error) {
                //Error!
                onError('No access to MIDI devices or your browser does not support WebMIDI API. Please use WebMIDIAPIShim.', error);
            });
        } else {
            onError('No MIDI support in your browser.')
        }
    };

    MIDI.prototype.getInputs = function() {
        var devices = [];
        var inputs = this._midiAccess.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            var device = new MIDIInputDevice(input.value);
            devices.push(device);
        }
        return devices;
    };

    MIDI.prototype.getInput = function(name) {
        var inputs = this._midiAccess.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            if (input.value.name === name) {
                return new MIDIInputDevice(input.value);
            }
        }
        throw new Error('No input device \"' + name + '\" found.');
    };



    var MIDIInputDevice = function(midiInput) {
        if (! midiInput instanceof MIDIInput)
            throw new Error('invalid MIDI input device');

        this._midiInput = midiInput;

        this._midiInput.onmidimessage = function(message) {
            this._onMIDIMessage(message);
        }.bind(this);

        this._listeners = {};
        this.name = this._midiInput.name;
    };

    MIDIInputDevice.prototype._onMIDIMessage = function(message) {

        var data = message.data,
            cmd = data[0] >> 4,
            channel = (data[0] & 0xf) + 1,
            type = data[0] & 0xf0,
            note = data[1],
            velocity = data[2];

        if (type === 144) {
            this.noteOn(channel, note, velocity);
        } else if (type === 128) {
            this.noteOff(channel, note);
        } else if (type === 176) {
            this.cc(channel, note, velocity);
        } else {
            console.log('Unsupported message. type: ', type, 'note: ', note, 'velocity: ', velocity);
        }
    };

    MIDIInputDevice.prototype.on = function(eventName, callback) {
        this._listeners[eventName] = callback;
    };

    MIDIInputDevice.prototype.noteOn = function(channel, note, velocity) {
        if (typeof this._listeners.noteon === 'function') {
            this._listeners.noteon(channel, note, velocity);
        }
    };

    MIDIInputDevice.prototype.noteOff = function(channel, note) {
        if (typeof this._listeners.noteoff === 'function') {
            this._listeners.noteoff(channel, note);
        }
    };

    MIDIInputDevice.prototype.cc = function(channel, number, value) {
        if (typeof this._listeners.cc === 'function') {
            this._listeners.cc(channel, number, value);
        }
    };



    return MIDI;

})();
