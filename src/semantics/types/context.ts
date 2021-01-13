import { mapObjectValues } from '../../util';
import { Scheme, showScheme } from './scheme';

export type Context = { [name: string]: Scheme };

export function showContext(context: Context): string {
    return JSON.stringify(mapObjectValues(context, showScheme));
}
