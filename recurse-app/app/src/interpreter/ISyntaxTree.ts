import INode from './INode';
import RecurseObject from '../core/type/RecurseObject';

interface ISyntaxTree {
    rootNodes: Array<INode>;
    generate: () => Array<RecurseObject>;
}

export default ISyntaxTree;