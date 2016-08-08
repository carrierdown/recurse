import { TokenType } from "./TokenType";

interface IToken {
    type: TokenType;
    value: any;
    pos: number;
    originalValue?: any;
    originalType?: TokenType;
}

export default IToken;