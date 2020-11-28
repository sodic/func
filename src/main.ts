import { substituteInType } from './typeChecker/substitution';
import { BIGINT_TYPE } from './typeChecker/types';

function main() {
    console.log(substituteInType({}, BIGINT_TYPE));
}

main();