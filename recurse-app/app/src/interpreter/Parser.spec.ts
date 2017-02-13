import tape = require('tape');

import Lexer from "./Lexer";
import IToken from "./IToken";
import {TokenType} from "./TokenType";
import Entity from "./Entity";
import Parser from "./Parser";
import RecurseResult from "../core/type/RecurseResult";
import ISyntaxTree from "./ISyntaxTree";
import INode from "./INode";
import ValueType from "./ValueType";
import SyntaxTree from "../function/SyntaxTree";

function getSyntaxTreeEntities(nodes: INode[], entities: Entity[] = []): Entity[] {
    for (let node of nodes) {
        entities.push(node.type);
        getSyntaxTreeEntities(node.children, entities);
    }
    return entities;
}

function parseAndCheckAgainst(input: string, expectedEntities: Entity[], test) {
    var lexer:Lexer = new Lexer(),
        parsed:RecurseResult<SyntaxTree> = Parser.parseTokensToSyntaxTree(lexer.getTokenSet(input));
    Parser.printSyntaxTree(parsed.result);

    if (!parsed.isOk()) {
        test.fail(parsed.error);
        test.end();
        return;
    }
    var entities: Entity[] = [];
    getSyntaxTreeEntities(parsed.result.rootNodes, entities);

    for (let i = 0; i < expectedEntities.length; i++) {
        console.log(Entity[entities[i]]);
        test.equal(entities[i], expectedEntities[i], `Entity ${Entity[entities[i]]} should be equal to ${Entity[expectedEntities[i]]}`);
    }
    test.end();
}

// consider doing validation after syntax tree has been created (basic syntax checking still needs to be done by parser)
// for instance we could have rules that are run on each node of the tree, e.g. onlyTopLevel(rm, ns), and so on.

// todo: this implies that SPACE needs to be taken into account when creating nested values. One solution which doesn't require lots of rewriting is to have a special case for SPACE
// todo: in front of LEFT_PAREN, since this is the only case where we are interested in capturing a space. We could then assign a special token value for such instances, e.g. ISOLATED_LEFT_PAREN.
tape('Parser should handle anonymous nested blocks', (test) => {
    parseAndCheckAgainst("rm(1 (2 4)) ns(c4 (c5 c6))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.VALUE, Entity.NESTED, Entity.VALUE, Entity.VALUE, Entity.NS, Entity.VALUE, Entity.NESTED, Entity.VALUE, Entity.VALUE], test);
});

tape('Parser should handle nested blocks', (test) => {
    parseAndCheckAgainst("rm(1(2 4)) ns(c4(c5 c6))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.NESTED, Entity.VALUE, Entity.VALUE, Entity.NS, Entity.NESTED, Entity.VALUE, Entity.VALUE], test);
});

// todo: Nested should contain a sub node so that it supports more complex values than simply numbers which is the case today. This means an interpolate statement could be the sum of a nested expr.
/*
tape('Interpolate statements should be supported as the sum of a nested block', (test) => {
    parseAndCheckAgainst("rm(1>2(2 4))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.NESTED/!* Containing Entity.INTERPOLATE *!/, Entity.VALUE, Entity.VALUE], test);
});

tape('Should be possible to do a repeat with an anonymous nested block', (test) => {
    parseAndCheckAgainst("rm(3x(2 4))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.VALUE, Entity.NESTED, Entity.VALUE, Entity.VALUE], test);
});
*/

