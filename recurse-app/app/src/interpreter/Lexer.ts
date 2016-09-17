import IToken from './IToken';
import { TokenType } from "./TokenType";

// todo: should rewrite from scratch to make it all K(tm)
// also, should have support for floating numbers and should parse the correct value right away so that Parser doesn't need to care about that type of thing
// also, should differentiate between keywords (maybe with separate classes for functions, scales, and so on) and identifiers (or maybe scales belong here, together with variables and so on)

export default class Lexer {
    private position: number = 0;
    private buffer: string = null;
    private bufferLength: number;

    private operatorTable: any = {
        '\\': TokenType.BACKSLASH,
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '*': TokenType.MULTIPLY,
        '.': TokenType.PERIOD,
        ':': TokenType.COLON,
        '%': TokenType.PERCENT,
        '|': TokenType.PIPE,
        '!': TokenType.EXCLAMATION,
        '?': TokenType.QUESTION,
        '#': TokenType.POUND,
        '&': TokenType.AMPERSAND,
        ';': TokenType.SEMI,
        ',': TokenType.COMMA,
        '(': TokenType.LEFT_PAREN,
        ')': TokenType.RIGHT_PAREN,
        '<': TokenType.LEFT_ANGLE,
        '>': TokenType.RIGHT_ANGLE,
        '{': TokenType.LEFT_BRACE,
        '}': TokenType.RIGHT_BRACE,
        '[': TokenType.LEFT_BRACKET,
        ']': TokenType.RIGHT_BRACKET,
        '=': TokenType.EQUALS,
        '\'': TokenType.SINGLE_QUOTE
    };


    // Initialize the Lexer's buffer. This resets the lexer's internal
    // state and subsequent tokens will be returned starting with the
    // beginning of the new buffer.
    setBuffer(buffer) {
        this.position = 0;
        this.buffer = buffer;
        this.bufferLength = buffer.length;
    }

    getTokenSet(inputBuffer: string): Array<IToken> {
        var token: IToken,
            tokenSet: Array<IToken> = [];

        this.setBuffer(inputBuffer);
        while (token = this.token()) {
            tokenSet.push(token);
        }
        return tokenSet;
    }

    // Get the next token from the current buffer. A token is an object with
    // the following properties:
    // - name: name of the pattern that this token matched (taken from rules).
    // - value: actual string value of the token.
    // - pos: offset in the current buffer where the token starts.
    //
    // If there are no more tokens in the buffer, returns null. In case of
    // an error throws Error.

    token(): IToken {
        this.skipNonTokens();
        if (this.position >= this.bufferLength) {
            return null;
        }

        // The char at this.pos is part of a real token. Figure out which.
        var char = this.buffer.charAt(this.position);

        // '/' is treated specially, because it starts a comment if followed by
        // another '/'. If not followed by another '/', it's the DIVIDE
        // operator.
        var nextChar = this.buffer.charAt(this.position + 1);
        if (char === '/') {
            if (nextChar === '/') {
                return this.processComment();
            } else {
                return {type: TokenType.DIVIDE, value: '/', pos: this.position++};
            }
        } else if (char === ';' && nextChar === ';') {
            return {type: TokenType.DOUBLE_SEMI, value: ';;', pos: this.position += 2};
        } else if (char === '.' && nextChar === '.') {
            return {type: TokenType.DOUBLE_PERIOD, value: '..', pos: this.position += 2};
        } else {
            // Look it up in the table of operators
            var op = this.operatorTable[char];
            // special case: x can also be part of an identifier, but if alone it is the repeat token
            if (op !== undefined) {
                return {type: op, value: char, pos: this.position++};
            } else {
                // Not an operator - so it's the beginning of another token.
                if (Lexer.isNote(char, nextChar)) {
                    return this.processNote();
                } else if (Lexer.isAlpha(char) && Lexer.isAlpha(nextChar)) { // note that this makes one-letter identifiers impossible unless specifically detected below
                    return this.processIdentifier();
                } else if (Lexer.isAlpha(char)) {
                    // check for one-letter alphabetic tokens (a-z, A-Z, _, $)
                    if (char === 'x') {
                        return {type: TokenType.REPEAT, value: char, pos: this.position++};
                    }
                    if (char === '_') {
                        return {type: TokenType.UNDERSCORE, value: char, pos: this.position++};
                    }
                } else if (Lexer.isDigit(char)) {
                    return this.processNumber();
                } else if (char === '"') {
                    return this.processQuote();
                } else {
                    throw Error('Token error at ' + this.position);
                }
            }
        }
    }

    static isNewline(c): boolean {
        return c === '\r' || c === '\n';
    }

    static isDigit(c): boolean {
        return c >= '0' && c <= '9';
    }

    static isAlpha(c): boolean {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_' || c === '$';
    }

    static isNote(c1, c2): boolean {
        return ((c1 >= 'a' && c1 <= 'g') ||
            (c1 >= 'A' && c1 <= 'G')) &&
            ((c2 >= '0' && c2 <= '9') || c2 === '#' || c2 === '-');
    }

    static isAlphaNumeric(c): boolean {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c === '_' || c === '$';
    }

    static isNoteCharacter(c): boolean {
        return (c >= 'a' && c <= 'g') ||
            (c >= 'A' && c <= 'G') ||
            (c >= '0' && c <= '9') ||
            c === '#' || c === '-';
    }

    private processNote(): IToken {
        var endpos = this.position + 1;
        while (endpos < this.bufferLength &&
        Lexer.isNoteCharacter(this.buffer.charAt(endpos))) {
            endpos++;
        }

        var token = {
            type: TokenType.NOTE,
            value: this.buffer.substring(this.position, endpos),
            pos: this.position
        };
        this.position = endpos;
        return token;
    }

    private processNumber(): IToken {
        var endpos = this.position + 1;
        while (endpos < this.bufferLength && (Lexer.isDigit(this.buffer.charAt(endpos))
               || (this.buffer.charAt(endpos) === '.') && (this.buffer.charAt(endpos + 1) !== '.') )) // avoid parsing shorthand ranges as numbers, e.g. 1..4
        {
            endpos++;
        }

        var token: IToken = {
            type: TokenType.NUMBER,
            value: this.buffer.substring(this.position, endpos),
            pos: this.position
        };
        token.value = parseFloat(token.value);
        if (isNaN(token.value)) {
            // invalid number, throw error. fix this when rewriting lexer
            console.log('WARN: Lexer detected invalid number', token.value);
        }

        this.position = endpos;
        return token;
    }

    private processComment(): IToken {
        var endpos = this.position + 2;
        // Skip until the end of the line
        var c = this.buffer.charAt(this.position + 2);
        while (endpos < this.bufferLength && !Lexer.isNewline(this.buffer.charAt(endpos))) {
            endpos++;
        }

        var token: IToken = {
            type: TokenType.COMMENT,
            value: this.buffer.substring(this.position, endpos),
            pos: this.position
        };
        this.position = endpos + 1;
        return token;
    }

    private processIdentifier(): IToken {
        var endpos = this.position + 1;
        while (endpos < this.bufferLength &&
        Lexer.isAlphaNumeric(this.buffer.charAt(endpos))) {
            endpos++;
        }

        var token = {
            type: TokenType.IDENTIFIER,
            value: this.buffer.substring(this.position, endpos),
            pos: this.position
        };
        this.position = endpos;
        return token;
    }

    private processQuote(): IToken {
        // this.pos points at the opening quote. Find the ending quote.
        var end_index = this.buffer.indexOf('"', this.position + 1);

        if (end_index === -1) {
            throw Error('Unterminated quote at ' + this.position);
        } else {
            var token = {
                type: TokenType.QUOTE,
                value: this.buffer.substring(this.position, end_index + 1),
                pos: this.position
            };
            this.position = end_index + 1;
            return token;
        }
    }

    private skipNonTokens(): void {
        while (this.position < this.bufferLength) {
            var c = this.buffer.charAt(this.position);
            if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
                this.position++;
            } else {
                break;
            }
        }
    }
}
