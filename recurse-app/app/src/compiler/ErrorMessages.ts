import sprintf_js = require('sprintf-js');

export class ErrorMessages {
    public static FILE_READ_ERROR: string = 'Unable to read file %s';
    public static UNEXPECTED_TOKEN_ERROR: string = 'Expected %s following %s, but found %s';
    public static REPEAT_STATEMENT_TOO_MANY_OPERANDS: string = 'Repeat statement can only contain 2 operands';
    public static INVALID_IDENTIFIER: string = 'Invalid identifier: %s';
    public static REPEAT_SHORTHAND_INVALID_IN_ALT_SHORTHAND: string = 'Shorthand repeat statement can not be used inside shorthand alternating statement. Use regular alternating statement alt() instead.';
    public static NUMERIC_ARGUMENT_NOT_ALLOWED: string = "Numeric arguments not allowed in %s";
    public static NOT_IN_CHAIN: string = "Encountered ; (new part) but not currently in chain";
    public static PARENTHESES_DO_NOT_MATCH: string = "Parentheses do not match up. Check that all parentheses start and end correctly.";

    public static getError(errorMsg: string, ...tokens: Array<string>): string {
        return sprintf_js.vsprintf(errorMsg, tokens);
    }
}