"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIconMatchers = void 0;
function parseIconMatchers(matchers) {
    return matchers.map(matcher => {
        const [tagName = '', attrName = ''] = (/^<(\S+)\s+(\S+?)>$/.exec(matcher) || []).slice(1);
        if (!tagName || !attrName) {
            throw new TypeError(`Invalid icon matcher: "${matcher}"`);
        }
        return [tagName, attrName];
    });
}
exports.parseIconMatchers = parseIconMatchers;
