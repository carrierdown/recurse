export enum ValueType {
    FILL,
    INTERVAL,
    NOTE,
    PITCH_OFFSET,
    SCALE_DEGREE,
    RAW_NOTE, // MIDI pitch numbers 0-127. Currently not in use - replaced by scale_degree
    REST,
    SELECT_INDEX,
    VARIABLE,// special type for variable contents - so that same sequence can mean different things, e.g. intervals in rm-context and pitch offset inside a pitch declaration.
    VELOCITY
}