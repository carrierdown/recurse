inlets = 1;
outlets = 1;

//--------------------------------------------------------------------
// Clip class

function Clip() {
    var path = "live_set view highlighted_clip_slot clip";
    this.liveObject = new LiveAPI(path);
}

Clip.prototype.getLength = function() {
    return this.liveObject.get('length');
};

Clip.prototype._parseNoteData = function(data) {
    var notes = [];
    // data starts with "notes"/count and ends with "done" (which we ignore)
    for(var i=2,len=data.length-1; i<len; i+=6) {
        // and each note starts with "note" (which we ignore) and is 6 items in the list
        var note = new Note(data[i+1], data[i+2], data[i+3], data[i+4], data[i+5]);
        notes.push(note);
    }
    return notes;
};

Clip.prototype.getSelectedNotes = function() {
    var data = this.liveObject.call('get_selected_notes');
    return this._parseNoteData(data);
};


Clip.prototype.getNotes = function(startTime, timeRange, startPitch, pitchRange) {
    if(!startTime) startTime = 0;
    if(!timeRange) timeRange = this.getLength();
    if(!startPitch) startPitch = 0;
    if(!pitchRange) pitchRange = 128;

    var data = this.liveObject.call("get_notes", startTime, startPitch, timeRange, pitchRange);
    return this._parseNoteData(data);
};

Clip.prototype._sendNotes = function(notes) {
    var liveObject = this.liveObject;
    liveObject.call("notes", notes.length);
    notes.forEach(function(note) {
        liveObject.call("note", note.getPitch(),
            note.getStart(), note.getDuration(),
            note.getVelocity(), note.getMuted());
    });
    liveObject.call('done');
};

Clip.prototype.replaceSelectedNotes = function(notes) {
    this.liveObject.call("replace_selected_notes");
    this._sendNotes(notes);
};

Clip.prototype.setNotes = function(notes) {
    this.liveObject.call("set_notes");
    this._sendNotes(notes);
};

Clip.prototype.selectAllNotes = function() {
    this.liveObject.call("select_all_notes");
};

Clip.prototype.replaceAllNotes = function(notes) {
    this.selectAllNotes();
    this.replaceSelectedNotes(notes);
};

//--------------------------------------------------------------------
// Note class

function Note(pitch, start, duration, velocity, muted) {
    this.pitch = pitch;
    this.start = start;
    this.duration = duration;
    this.velocity = velocity;
    this.muted = muted;
}

Note.prototype.toString = function() {
    return '{pitch:' + this.pitch +
        ', start:' + this.start +
        ', duration:' + this.duration +
        ', velocity:' + this.velocity +
        ', muted:' + this.muted + '}';
};

Note.MIN_DURATION = 1/128;

Note.prototype.getPitch = function() {
    if(this.pitch < 0) return 0;
    if(this.pitch > 127) return 127;
    return this.pitch;
};

Note.prototype.getStart = function() {
    // we convert to strings with decimals to work around a bug in Max
    // otherwise we get an invalid syntax error when trying to set notes
    if(this.start <= 0) return "0.0";
    return this.start.toFixed(4);
};

Note.prototype.getDuration = function() {
    if(this.duration <= Note.MIN_DURATION) return Note.MIN_DURATION;
    return this.duration.toFixed(4); // workaround similar bug as with getStart()
};

Note.prototype.getVelocity = function() {
    if(this.velocity < 0) return 0;
    if(this.velocity > 127) return 127;
    return this.velocity;
};

Note.prototype.getMuted = function() {
    if(this.muted) return 1;
    return 0;
};

function set_json(jsonString) {
    var input = JSON.parse(jsonString),
        i,
        output,
        notes = [],
        note,
        clip;

    for (i = 0; i < input.length; i++) {
        note = new Note(input[i].pitch, input[i].start, input[i].duration, input[i].velocity, false);
        notes.push(note);
        //output = 'bar:' + input[i].bar + '_beat:' + input[i].beat + '_sixteenth:' + input[i].sixteenth + '_note:' + input[i].note;
        outlet(0, 'append', note.start);
    }

    clip = new Clip();
    clip.replaceAllNotes(notes);
}

// temp - just for testing
function get_intervals() {
    outlet(1, ['/recurse/intervals', '2,4,6,8']);
}

// dummy function for testing creation of multiple clips in the currently selected track, starting at clip 0
function setTrackClips() {
    var notes = [],
        liveObject,
        i,
        c;
    var basePath = "live_set view selected_track";
    // clip_slot: has_clip, create_clip
    // clip: is_midi_clip, length  -  select_all_notes,

    liveObject = new LiveAPI(basePath);

    if (!liveObject) {
        post('Invalid liveObject, exiting...');
        return;
    }

    for (i = 0; i < 4; i++) {
        notes.push(new Note(60, i, 0.5, 127, false));
    }

    // the liveAPI seems to have some weird issues with comparing directly with 1 and 0, so we use < and > instead
    if (liveObject.get('has_audio_input') < 1 && liveObject.get('has_midi_input') > 0) {
        post('track type is valid');

        for (i = 0; i < 4; i++) {
            liveObject.goto(basePath + ' clip_slots ' + i);

            if (liveObject.get('has_clip') < 1) {
                liveObject.call('create_clip', '4.0');
            } else {
                post('no clip to create');
            }

            // todo: check length of clip according to data, and adjust if necessary

            liveObject.goto(basePath + ' clip_slots ' + i + ' clip');
            liveObject.call('select_all_notes');
            liveObject.call('replace_selected_notes');

            liveObject.call('notes', notes.length);
            for (c = 0; c < notes.length; c++) {
                liveObject.call('note', notes[c].getPitch(),
                    notes[c].getStart(), notes[c].getDuration(),
                    notes[c].getVelocity(), notes[c].getMuted());
            }
            liveObject.call('done');
        }
    } else {
        post('not a midi track!');
    }
}