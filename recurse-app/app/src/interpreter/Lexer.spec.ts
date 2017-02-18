import tape = require('tape');

import {TokenType} from "./TokenType";
import {Lexer} from "./Lexer";
import {IToken} from "./IToken";

tape('return tokenized version of input', (test) => {
    var input: string = "rm(8 , 6,4,4 * 4,13(8,10;8;6 (5,5),8)):{length:64,loop:32}", // old syntax but lexer should give correct output anyways
        lexer: Lexer = new Lexer(),
        expectedTokens: TokenType[] = [
            TokenType.IDENTIFIER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.MULTIPLY,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.SEMI,
            TokenType.NUMBER,
            TokenType.SEMI,
            TokenType.NUMBER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.RIGHT_PAREN,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.RIGHT_PAREN,
            TokenType.RIGHT_PAREN,
            TokenType.COLON,
            TokenType.LEFT_BRACE,
            TokenType.IDENTIFIER,
            TokenType.COLON,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.IDENTIFIER,
            TokenType.COLON,
            TokenType.NUMBER,
            TokenType.RIGHT_BRACE
        ],
        token: IToken,
        i: number = 0;
    lexer.setBuffer(input);
    while (token = lexer.token()) {
        test.equal(token.type, expectedTokens[i], `Token with value ${token.value} should translate to ${TokenType[expectedTokens[i]]}`);
        i++;
    }
    test.end();
});

tape('handle decimal numbers properly', (test) => {
    var input: string = "rm(8.5,1,5.02,4,2.2,1.500)",
        lexer: Lexer = new Lexer(),
        expectedTokens: TokenType[] = [
            TokenType.IDENTIFIER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.COMMA,
            TokenType.NUMBER,
            TokenType.RIGHT_PAREN
        ],
        token: IToken,
        i: number = 0;
    lexer.setBuffer(input);
    while (token = lexer.token()) {
        test.equal(token.type, expectedTokens[i], `Token with value ${token.value} should translate to ${TokenType[expectedTokens[i]]}`);
        i++;
    }
    test.end();
});

tape('handle negative numbers properly', (test) => {
    var input: string = "rm(4 -4 -1 0)",
        lexer: Lexer = new Lexer(),
        expectedTokens: TokenType[] = [
            TokenType.IDENTIFIER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.NUMBER,
            TokenType.NUMBER,
            TokenType.NUMBER,
            TokenType.RIGHT_PAREN
        ],
        token: IToken,
        i: number = 0;
    lexer.setBuffer(input);
    while (token = lexer.token()) {
        test.equal(token.type, expectedTokens[i], `Token with value ${token.value} should translate to ${TokenType[expectedTokens[i]]}`);
        i++;
    }
    test.end();
});

tape('handle comments properly', (test) => {
    var input: string = `// hei
            //hoppsan sveisann
            rm(16 48)//ekstrahopp
            //en siste topp
            `,
        lexer: Lexer = new Lexer(),
        expectedTokens: TokenType[] = [
            TokenType.IDENTIFIER,
            TokenType.LEFT_PAREN,
            TokenType.NUMBER,
            TokenType.NUMBER,
            TokenType.RIGHT_PAREN
        ],
        token: IToken,
        i: number = 0;
    lexer.setBuffer(input);
    while (token = lexer.token()) {
        test.equal(token.type, expectedTokens[i], `Token with value ${token.value} should translate to ${TokenType[expectedTokens[i]]}`);
        i++;
    }
    test.end();
});