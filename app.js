//See: http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false // this defaults to 'false' and we won't be covering sysex in this article.
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
}

// midi functions
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    console.log('MIDI Access Object', midiAccess);

    var inputs = midiAccess.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log("Input:", input.value.name);
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure(e) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

function onMIDIMessage(message) {
    var deviceName = message.currentTarget.name;
    console.log("Message from " + deviceName + ": ", message);

    var data = message.data,
        cmd = data[0] >> 4,
        channel = data[0] & 0xf,
        type = data[0] & 0xf0,
        note = data[1],
        velocity = data[2];

    if (type === 144) {
        noteOn(note, velocity);
    } else if (type === 128) {
        noteOff(note, velocity);
    } else if (type === 176) {
        cc(note, velocity);
    } else {
        console.log("type: ", type, "note: ", note, "velocity: ", velocity);
    }
}

function noteOn(note, velocity) {
    console.log("Note on: ", note, velocity);
}

function noteOff(note, velocity) {
    console.log("Note off: ", note, velocity);
}

function cc(number, value) {
    console.log("CC: ", number, value);
}
