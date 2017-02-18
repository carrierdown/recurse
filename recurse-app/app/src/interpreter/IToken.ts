import { TokenType } from "./TokenType";

export interface IToken {
    type: TokenType;
    value: any;
    pos: number;
    originalValue?: any;
    originalType?: TokenType;
    isolatedLeft?: boolean;  // if this token is preceded by a space, isolatedLeft = true
    isolatedRight?: boolean; // similarly for whether it is followed by a space
}