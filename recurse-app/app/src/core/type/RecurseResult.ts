import {RecurseStatus} from "./RecurseStatus";

export class RecurseResult<T> {
    public error: string;
    public status: RecurseStatus;
    public result: T;

    constructor(status = RecurseStatus.OK, error = '') {
        this.status = status;
        this.error = error;
    }

    public isOk(): boolean {
        return (this.status === RecurseStatus.OK);
    }

    public setError(msg: string): RecurseResult<T> {
        this.error = msg;
        this.status = RecurseStatus.ERROR;
        return this;
    }
}