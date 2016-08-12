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

