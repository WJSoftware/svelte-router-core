import { joinPaths } from '$lib/public-utils.js';
import type { AndUntyped, Hash, RouteInfo, RouteParamsRecord } from '$lib/types.js';
import { noTrailingSlash } from '$lib/utils.js';
import { location } from './Location.js';

function escapeRegExp(string: string): string {
    return string.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function tryParseValue(value: string) {
    if (value === '' || value === undefined || value === null) {
        return value;
    }
    const num = Number(value);
    if (!isNaN(num)) {
        return num;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
}

const identifierRegex = /(\/)?:([a-zA-Z_]\w*)(\?)?/g;
const paramNamePlaceholder = 'paramName';
const paramValueRegex = `(?<${paramNamePlaceholder}>[^/]+)`;
const restParamRegex = /\/\*$/;

/**
 * Helper class for route parsing and testing (route matching).
 */
export class RouteHelper {
    /**
     * The hash path ID this route helper uses (if any).  Undefined if using path routing.
     */
    #hashId;
    /**
     * Gets the test path this route helper uses to test route paths.  Its value depends on the routing mode (universe).
     */
    readonly testPath = $derived.by(() =>
        noTrailingSlash(this.#hashId ? location.hashPaths[this.#hashId] || '/' : location.path)
    );
    /**
     * Initializes a new instance of this class.
     * @param hash Resolved hash value to use for (almost) all functions.
     */
    constructor(hash: Hash) {
        this.#hashId = typeof hash === 'string' ? hash : hash ? 'single' : undefined;
    }
    /**
     * Parses the string pattern in the provided route information object into a regular expression.
     * @param routeInfo Pattern route information to parse.
     * @returns An object with the regular expression, the optional predicate function, and the ignoreForFallback flag.
     */
    parseRoutePattern(
        routeInfo: RouteInfo,
        basePath?: string
    ): { regex?: RegExp; and?: AndUntyped; ignoreForFallback: boolean } {
        if (typeof routeInfo.path !== 'string') {
            return {
                regex: routeInfo.path,
                and: routeInfo.and,
                ignoreForFallback: !!routeInfo.ignoreForFallback
            };
        }
        const fullPattern = joinPaths(
            basePath || '/',
            routeInfo.path === '/' ? '' : routeInfo.path
        );
        const escapedPattern = escapeRegExp(fullPattern);
        let regexPattern = escapedPattern.replace(
            identifierRegex,
            (_match, startingSlash, paramName, optional, offset) => {
                let regex = paramValueRegex.replace(paramNamePlaceholder, paramName);
                return (
                    (startingSlash ? `/${optional ? '?' : ''}` : '') +
                    (optional ? `(?:${regex})?` : regex)
                );
            }
        );
        regexPattern = regexPattern.replace(restParamRegex, '(?<rest>\\/.*)');
        return {
            regex: new RegExp(`^${regexPattern}$`, routeInfo.caseSensitive ? undefined : 'i'),
            and: routeInfo.and,
            ignoreForFallback: !!routeInfo.ignoreForFallback
        };
    }
    /**
     * Tests the route defined by the provided route information against the current URL to determine if it matches.
     * @param routeMatchInfo Route information used for route matching.
     * @returns A tuple containing the match result (a Boolean value) and any route parameters obtained.
     */
    testRoute(routeMatchInfo: { regex?: RegExp; and?: AndUntyped }) {
        const matches = routeMatchInfo.regex ? routeMatchInfo.regex.exec(this.testPath) : null;
        const routeParams = matches?.groups
            ? ({ ...matches.groups } as RouteParamsRecord)
            : undefined;
        if (routeParams) {
            for (let key in routeParams) {
                if (routeParams[key] === undefined) {
                    delete routeParams[key];
                    continue;
                }
                routeParams[key] = tryParseValue(decodeURIComponent(routeParams[key] as string));
            }
        }
        const match =
            (!!matches || !routeMatchInfo.regex) &&
            (!routeMatchInfo.and || routeMatchInfo.and(routeParams));
        return [match, routeParams] as const;
    }
}
