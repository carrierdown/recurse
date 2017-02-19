import tape = require('tape');
import _ = require('lodash');

import {TokenType} from "./TokenType";
import {INode} from "./INode";
import {Entity} from "./Entity";
import {Lexer} from "./Lexer";
import {RecurseResult} from "../core/type/RecurseResult";
import {SyntaxTree} from "../function/SyntaxTree";
import {Parser} from "./Parser";

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
        test.equal(entities[i], expectedEntities[i], `Entity ${Entity[entities[i]]}${_.repeat("_", 20 - Entity[entities[i]].length)} should be equal to ${Entity[expectedEntities[i]]}`);
    }
}

// consider doing validation after syntax tree has been created (basic syntax checking still needs to be done by parser)
// for instance we could have rules that are run on each node of the tree, e.g. onlyTopLevel(rm, ns), and so on.

tape('Parser should handle anonymous nested blocks', (test) => {
    parseAndCheckAgainst("rm(1 (2 4)) ns(c4 (c5 c6))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.VALUE, Entity.NESTED, Entity.VALUE, Entity.VALUE, Entity.NS, Entity.VALUE, Entity.NESTED, Entity.VALUE, Entity.VALUE], test);
    test.end();
});

tape('Parser should handle nested blocks', (test) => {
    parseAndCheckAgainst("rm(1(2 4)) ns(c4(c5 c6))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.NESTED, Entity.VALUE, Entity.VALUE, Entity.NS, Entity.NESTED, Entity.VALUE, Entity.VALUE], test);
    test.end();
});

tape('Should be possible to do a repeat with an anonymous nested block', (test) => {
    parseAndCheckAgainst("rm(3x(2 4))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.REPEAT_SHORTHAND, Entity.VALUE, Entity.NESTED], test);
    parseAndCheckAgainst("rm((2 4)x3)", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.REPEAT_SHORTHAND, Entity.NESTED, Entity.VALUE], test);
    test.end();
});

tape('Should be possible to assign a block to a variable', (test) => {
    parseAndCheckAgainst("rm($test=(2 4) $test)", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.VARIABLE_REFERENCE], test);
    test.end();
});

// todo: Nested should contain a sub node so that it supports more complex values than simply numbers which is the case today. This means an interpolate statement could be the sum of a nested expr.
/*
tape('Interpolate statements should be supported as the sum of a nested block', (test) => {
    parseAndCheckAgainst("rm(1>2(2 4))", [Entity.ROOT, Entity.CHAIN, Entity.RM, Entity.NESTED/!* Containing Entity.INTERPOLATE *!/, Entity.VALUE, Entity.VALUE], test);
});

*/

