inlets = 1;
outlets = 2;

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
    startTime = startTime || 0;
    timeRange = timeRange || this.getLength();
    startPitch = startPitch || 0;
    pitchRange = pitchRange || 128;

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

Note.NOTE_NAMES = ['C-2', 'C#-2', 'D-2', 'D#-2', 'E-2', 'F-2', 'F#-2', 'G-2', 'G#-2', 'A-2', 'A#-2', 'B-2', 'C-1', 'C#-1', 'D-1', 'D#-1', 'E-1', 'F-1', 'F#-1', 'G-1', 'G#-1', 'A-1', 'A#-1', 'B-1', 'C0', 'C#0', 'D0', 'D#0', 'E0', 'F0', 'F#0', 'G0', 'G#0', 'A0', 'A#0', 'B0', 'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C8', 'C#8', 'D8', 'D#8', 'E8', 'F8', 'F#8', 'G8'];
Note.MIN_DURATION = 1/128;

Note.prototype.toString = function() {
    return '{pitch:' + this.pitch +
        ', start:' + this.start +
        ', duration:' + this.duration +
        ', velocity:' + this.velocity +
        ', muted:' + this.muted + '}';
};

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

// gets intervals from currently selected clips and converts them to recurse code, then sends resulting code as OSC message to /recurse/intervals
function get_intervals() {
    var clip = new Clip(),
        noteList = clip.getNotes(),
        clipLength = clip.getLength(),
        results = [{ intervals: [], notes: [], velocities: [] }],
        currentResultIndex = 0,
        currentStartPos,
        currentEndPos,
        backlog,
        output = "",
        velocitiesNeeded = false;

    noteList.sort(function (a, b) {
        if (a.start > b.start) {
            return 1;
        }
        if (a.start < b.start) {
            return -1;
        }
        return 0;
    });

    do {
        backlog = [];
        currentEndPos = currentStartPos = 0;
        for (var _i = 0, noteList_1 = noteList; _i < noteList_1.length; _i++) {
            var note = noteList_1[_i];
            if (!results[currentResultIndex]) {
                results[currentResultIndex] = { intervals: [], notes: [], velocities: [] };
            }
            var currentResults = results[currentResultIndex];
            if (currentEndPos <= note.start) {
                if (currentEndPos < note.start) {
                    currentResults.intervals.push(0 - ((note.start - currentEndPos) * 4));
                }
                currentResults.intervals.push(note.duration * 4);
                currentResults.notes.push(note.pitch);
                currentResults.velocities.push(note.velocity);
                if (note.velocity !== 127 && !velocitiesNeeded) {
                    velocitiesNeeded = true;
                }
                currentStartPos = note.start;
                currentEndPos = note.start + note.duration;
            }
            else {
                backlog.push(note);
            }
        }
        noteList = backlog;
        currentResultIndex++;
    } while (backlog.length !== 0);

    for (var r = 0; r < results.length; r++) {
        var result = results[r];
        var totalLength = clipLength * 4;
        if (totalLength !== 64) {
            output += "length(" + totalLength + ") ";
        }
        var rmOutput = "";
        for (var i = 0; i < result.intervals.length; i++) {
            var interval = result.intervals[i];
            if (interval > 0) {
                rmOutput += interval;
            }
            else {
                interval = Math.abs(interval);
                rmOutput += "_" + interval;
            }
            totalLength -= interval;
            if (i < result.intervals.length - 1) {
                rmOutput += ",";
            }
        }
        if (totalLength > 0) {
            rmOutput += ",_" + totalLength;
        }
        output += "rm(" + rmOutput + ") ";
        var noteOutput = "";
        var noteValueStatic = -1;
        for (var i = 0; i < result.notes.length; i++) {
            var note = result.notes[i];
            if (noteValueStatic !== note) {
                if (noteValueStatic === -1) {
                    noteValueStatic = note;
                }
                else {
                    noteValueStatic = -2;
                }
            }
            noteOutput += Note.NOTE_NAMES[note].toLowerCase() + (i < result.notes.length - 1 ? "," : "");
        }
        if (noteValueStatic >= 0) {
            noteOutput = Note.NOTE_NAMES[noteValueStatic].toLowerCase();
        }
        output += "ns(" + noteOutput + ")";
        if (velocitiesNeeded) {
            var velOutput = "";
            for (var i = 0; i < result.velocities.length; i++) {
                var velocity = result.velocities[i];
                velOutput += "" + velocity + (i < result.velocities.length - 1 ? "," : "");
            }
            output += " vel(" + velOutput + ")";
        }
        output += "" + (r < results.length - 1 ? ";\n" : "");
    }
    outlet(1, ['/recurse/intervals', output]);
}

function convertPitch(pitch) {
    if (pitch < 0) return 0;
    if (pitch > 127) return 127;
    return pitch;
}

function convertStart(start) {
    // we convert to strings with decimals to work around a bug in Max
    // otherwise we get an invalid syntax error when trying to set notes
    if (start <= 0) return "0.0";
    return start.toFixed(4);
}

function convertDuration(duration) {
    if (duration <= Note.MIN_DURATION) return Note.MIN_DURATION;
    return duration.toFixed(4); // workaround similar bug as with getStart()
}

function convertVelocity(velocity) {
    if (velocity < 0) return 0;
    if (velocity > 127) return 127;
    return velocity;
}

function convertMuted(muted) {
    if (muted) return 1;
    return 0;
}

// creates multiple clips in the currently selected track, starting at clip 0
function set_track_clips(jsonString) {
    var input = JSON.parse(jsonString),
        liveObject,
        basePath = "live_set view selected_track";
    // clip_slot: has_clip, create_clip
    // clip: is_midi_clip, length  -  select_all_notes,

    liveObject = new LiveAPI(basePath);

    if (!liveObject) {
        post('Invalid liveObject, exiting...');
        return;
    }

    // the liveAPI seems to have some weird issues with comparing directly with 1 and 0, so we use < and > instead
    if (liveObject.get('has_audio_input') < 1 && liveObject.get('has_midi_input') > 0) {
        post('track type is valid');

        for (var i = 0; i < input.length; i++) {
            var notes = input[i].notes,
                loopLength = input[i].loopLength;

            liveObject.goto(basePath + ' clip_slots ' + i);

            if (liveObject.get('has_clip') < 1) {
                liveObject.call('create_clip', '4.0');
            } else {
                post('no clip to create');
            }

            liveObject.goto(basePath + ' clip_slots ' + i + ' clip');
            liveObject.call('looping', 1);
            liveObject.call('loop_end', loopLength);
            liveObject.call('select_all_notes');
            liveObject.call('replace_selected_notes');

            liveObject.call('notes', notes.length);
            for (var c = 0; c < notes.length; c++) {
                liveObject.call('note', convertPitch(notes[c].pitch),
                    convertStart(notes[c].start), convertDuration(notes[c].duration),
                    convertVelocity(notes[c].velocity), convertMuted(false));
            }
            liveObject.call('done');
        }
    } else {
        post('not a midi track!');
    }
}

