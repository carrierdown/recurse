import createLookupTable from "../core/util/createLookupTable";

export enum TokenType {
    AMPERSAND,
    BACKSLASH,
    COLON,
    COMMA,
    COMMENT,
    DIVIDE,
    DOUBLE_PERIOD,
    DOUBLE_SEMI,
    END,
    EQUALS,
    EXCLAMATION,
    IDENTIFIER,
    LEFT_ANGLE,
    LEFT_BRACE,
    LEFT_BRACKET,
    LEFT_PAREN,
    MINUS,
    MULTIPLY,
    NOTE,
    NUMBER,
    PERCENT,
    PERIOD,
    PIPE,
    PLUS,
    POUND,
    QUESTION,
    QUOTE,
    REPEAT,
    RIGHT_ANGLE,
    RIGHT_BRACE,
    RIGHT_BRACKET,
    RIGHT_PAREN,
    SEMI,
    SINGLE_QUOTE,
    START,
    UNDERSCORE
}

// todo: this will get trickier and trickier to maintain as complexity increases. Remove this and replace with per node validation instead (each node validates its contents).
var expects = [
    {
        token: TokenType.START,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.PIPE,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.SEMI,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.DOUBLE_SEMI,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.DOUBLE_PERIOD,
        expects: [TokenType.NUMBER]
    },
    {
        token: TokenType.IDENTIFIER,
        expects: [TokenType.IDENTIFIER, TokenType.LEFT_PAREN, TokenType.SEMI, TokenType.DOUBLE_SEMI, TokenType.PIPE]
    },
    {
        token: TokenType.LEFT_PAREN,
        expects: [TokenType.NUMBER, TokenType.NOTE, TokenType.IDENTIFIER, TokenType.UNDERSCORE, TokenType.MULTIPLY, TokenType.LEFT_PAREN]
    },
    {
        token: TokenType.RIGHT_PAREN,
        expects: [TokenType.IDENTIFIER, TokenType.RIGHT_PAREN, TokenType.COMMA, TokenType.SEMI, TokenType.DOUBLE_SEMI, TokenType.PIPE, TokenType.REPEAT, TokenType.RIGHT_ANGLE]
    },
    {
        token: TokenType.NUMBER,
        expects: [TokenType.COMMA, TokenType.LEFT_PAREN, TokenType.RIGHT_PAREN, TokenType.SINGLE_QUOTE, TokenType.REPEAT, TokenType.DOUBLE_PERIOD, TokenType.RIGHT_ANGLE]
    },
    {
        token: TokenType.COMMA,
        expects: [TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.UNDERSCORE, TokenType.MULTIPLY, TokenType.NOTE]
    }
];

export var TokenTypeExpect = createLookupTable<Array<TokenType>>(expects, 'token', 'expects');

export function getExpectsString(expects: Array<number>): string {
    var result: string = '';
    for (var i = 0; i < expects.length; i++) {
        result += TokenType[expects[i]] + (i !== expects.length - 1 ? ', ' : '');
    }
    return result;
}
