import createLookupTable from "../core/util/createLookupTable";

export enum TokenType {
    START,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    COMMENT,
    QUOTE,
    SINGLE_QUOTE,
    NOTE,
    NUMBER,
    IDENTIFIER,
    PERIOD,
    BACKSLASH,
    COLON,
    PERCENT,
    PIPE,
    EXCLAMATION,
    QUESTION,
    POUND,
    AMPERSAND,
    SEMI,
    DOUBLE_SEMI,
    COMMA,
    LEFT_PAREN,
    RIGHT_PAREN,
    LEFT_ANGLE,
    RIGHT_ANGLE,
    LEFT_BRACE,
    RIGHT_BRACE,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    EQUALS,
    END,
    UNDERSCORE,
    REPEAT
}

var expects = [
    {
        token: TokenType.START,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.SEMI,
        expects: [TokenType.IDENTIFIER]
    },
    {
        token: TokenType.IDENTIFIER,
        expects: [TokenType.IDENTIFIER, TokenType.LEFT_PAREN, TokenType.SEMI, TokenType.DOUBLE_SEMI]
    },
    {
        token: TokenType.LEFT_PAREN,
        expects: [TokenType.NUMBER, TokenType.NOTE, TokenType.IDENTIFIER, TokenType.UNDERSCORE, TokenType.MULTIPLY]
    },
    {
        token: TokenType.RIGHT_PAREN,
        expects: [TokenType.IDENTIFIER, TokenType.RIGHT_PAREN, TokenType.COMMA, TokenType.SEMI, TokenType.DOUBLE_SEMI]
    },
    {
        token: TokenType.NUMBER,
        expects: [TokenType.COMMA, TokenType.LEFT_PAREN, TokenType.RIGHT_PAREN, TokenType.SINGLE_QUOTE, TokenType.REPEAT]
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
