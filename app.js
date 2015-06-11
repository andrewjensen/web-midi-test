var midi = new MIDI();
midi.requestAccess(function() {

    var inputs = midi.getInputs();
    console.log('Inputs:', inputs.map(function(i) { return i.name; }));

    var input = midi.getInput('IAC Driver Bus 1');
    input.on('noteon', function(channel, note, velocity) {
        console.log('Note on: ', channel, note, velocity);
    });
    input.on('noteoff', function(channel, note) {
        console.log('Note off: ', channel, note);
    });
    input.on('cc', function(channel, number, value) {
        console.log('cc: ', channel, number, value);
    });

},
function(error) {
    console.log("Error:", error);
});
