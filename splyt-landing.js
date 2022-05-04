// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const osType = (()=>{
    const { Deno  } = globalThis;
    if (typeof Deno?.build?.os === "string") {
        return Deno.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path2) {
    if (typeof path2 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path3, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path3.length; i <= len; ++i){
        if (i < len) code = path3.charCodeAt(i);
        else if (isPathSeparator1(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path3.slice(lastSlash + 1, i);
                else res = path3.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep3 + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path4;
        const { Deno  } = globalThis;
        if (i >= 0) {
            path4 = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path4 = Deno.cwd();
        } else {
            if (typeof Deno?.env?.get !== "function" || typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path4 = Deno.cwd();
            if (path4 === undefined || path4.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path4 = `${resolvedDevice}\\`;
            }
        }
        assertPath(path4);
        const len = path4.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute1 = false;
        const code = path4.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute1 = true;
                if (isPathSeparator(path4.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path4.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path4.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path4.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path4.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path4.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path4.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path4.charCodeAt(1) === 58) {
                    device = path4.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path4.charCodeAt(2))) {
                            isAbsolute1 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute1 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path4.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute1;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path5) {
    assertPath(path5);
    const len = path5.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute2 = false;
    const code = path5.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute2 = true;
            if (isPathSeparator(path5.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path5.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path5.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path5.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path5.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path5.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path5.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path5.charCodeAt(1) === 58) {
                device = path5.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path5.charCodeAt(2))) {
                        isAbsolute2 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path5.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute2) tail = ".";
    if (tail.length > 0 && isPathSeparator(path5.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute2) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute2) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path6) {
    assertPath(path6);
    const len = path6.length;
    if (len === 0) return false;
    const code = path6.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path6.charCodeAt(1) === 58) {
            if (isPathSeparator(path6.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path7 = paths[i];
        assertPath(path7);
        if (path7.length > 0) {
            if (joined === undefined) joined = firstPart = path7;
            else joined += `\\${path7}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path8) {
    if (typeof path8 !== "string") return path8;
    if (path8.length === 0) return "";
    const resolvedPath = resolve(path8);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path8;
}
function dirname(path9) {
    assertPath(path9);
    const len = path9.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path9.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path9.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path9.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path9.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path9.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path9;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path9.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path9.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path9;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path9.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path9.slice(0, end);
}
function basename(path10, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path10);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path10.length >= 2) {
        const drive = path10.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path10.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path10.length) {
        if (ext.length === path10.length && ext === path10) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path10.length - 1; i >= start; --i){
            const code = path10.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path10.length;
        return path10.slice(start, end);
    } else {
        for(i = path10.length - 1; i >= start; --i){
            if (isPathSeparator(path10.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path10.slice(start, end);
    }
}
function extname(path11) {
    assertPath(path11);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path11.length >= 2 && path11.charCodeAt(1) === 58 && isWindowsDeviceRoot(path11.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path11.length - 1; i >= start; --i){
        const code = path11.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path11.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path12) {
    assertPath(path12);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path12.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path12.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path12.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path12.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path12.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path12.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path12.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path12.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path12;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path12;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path12;
        return ret;
    }
    if (rootEnd > 0) ret.root = path12.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path12.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path12.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path12.slice(startPart, end);
        }
    } else {
        ret.name = path12.slice(startPart, startDot);
        ret.base = path12.slice(startPart, end);
        ret.ext = path12.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path12.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path13 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path13 = `\\\\${url.hostname}${path13}`;
    }
    return path13;
}
function toFileUrl(path14) {
    if (!isAbsolute(path14)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path14.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path15;
        if (i >= 0) path15 = pathSegments[i];
        else {
            const { Deno  } = globalThis;
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path15 = Deno.cwd();
        }
        assertPath(path15);
        if (path15.length === 0) {
            continue;
        }
        resolvedPath = `${path15}/${resolvedPath}`;
        resolvedAbsolute = path15.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path16) {
    assertPath(path16);
    if (path16.length === 0) return ".";
    const isAbsolute1 = path16.charCodeAt(0) === 47;
    const trailingSeparator = path16.charCodeAt(path16.length - 1) === 47;
    path16 = normalizeString(path16, !isAbsolute1, "/", isPosixPathSeparator);
    if (path16.length === 0 && !isAbsolute1) path16 = ".";
    if (path16.length > 0 && trailingSeparator) path16 += "/";
    if (isAbsolute1) return `/${path16}`;
    return path16;
}
function isAbsolute1(path17) {
    assertPath(path17);
    return path17.length > 0 && path17.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path18 = paths[i];
        assertPath(path18);
        if (path18.length > 0) {
            if (!joined) joined = path18;
            else joined += `/${path18}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path19) {
    return path19;
}
function dirname1(path20) {
    assertPath(path20);
    if (path20.length === 0) return ".";
    const hasRoot = path20.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path20.length - 1; i >= 1; --i){
        if (path20.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path20.slice(0, end);
}
function basename1(path21, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path21);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path21.length) {
        if (ext.length === path21.length && ext === path21) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path21.length - 1; i >= 0; --i){
            const code = path21.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path21.length;
        return path21.slice(start, end);
    } else {
        for(i = path21.length - 1; i >= 0; --i){
            if (path21.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path21.slice(start, end);
    }
}
function extname1(path22) {
    assertPath(path22);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path22.length - 1; i >= 0; --i){
        const code = path22.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path22.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path23) {
    assertPath(path23);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path23.length === 0) return ret;
    const isAbsolute2 = path23.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path23.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path23.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path23.slice(1, end);
            } else {
                ret.base = ret.name = path23.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path23.slice(1, startDot);
            ret.base = path23.slice(1, end);
        } else {
            ret.name = path23.slice(startPart, startDot);
            ret.base = path23.slice(startPart, end);
        }
        ret.ext = path23.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path23.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path24) {
    if (!isAbsolute1(path24)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path24.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod1 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse1,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const path = isWindows ? mod : mod1;
const { join: join2 , normalize: normalize2  } = path;
const path1 = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path1;
function delay(ms, options = {}) {
    const { signal  } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve3, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve3();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
    });
}
const ERROR_SERVER_CLOSED = "Server closed";
const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
const MAX_ACCEPT_BACKOFF_DELAY = 1000;
class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #httpConnections = new Set();
    #onError;
    constructor(serverInit){
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function(error) {
            console.error(error);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    async serve(listener) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener);
        try {
            return await this.#accept(listener);
        } finally{
            this.#untrackListener(listener);
            try {
                listener.close();
            } catch  {}
        }
    }
    async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listen({
            port: this.#port ?? 80,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listenTls({
            port: this.#port ?? 443,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener of this.#listeners){
            try {
                listener.close();
            } catch  {}
        }
        this.#listeners.clear();
        for (const httpConn of this.#httpConnections){
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    get closed() {
        return this.#closed;
    }
    get addrs() {
        return Array.from(this.#listeners).map((listener)=>listener.addr
        );
    }
    async #respond(requestEvent, httpConn, connInfo) {
        let response;
        try {
            response = await this.#handler(requestEvent.request, connInfo);
        } catch (error) {
            response = await this.#onError(error);
        }
        try {
            await requestEvent.respondWith(response);
        } catch  {
            return this.#closeHttpConn(httpConn);
        }
    }
    async #serveHttp(httpConn1, connInfo1) {
        while(!this.#closed){
            let requestEvent;
            try {
                requestEvent = await httpConn1.nextRequest();
            } catch  {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            this.#respond(requestEvent, httpConn1, connInfo1);
        }
        this.#closeHttpConn(httpConn1);
    }
    async #accept(listener) {
        let acceptBackoffDelay;
        while(!this.#closed){
            let conn;
            try {
                conn = await listener.accept();
            } catch (error) {
                if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= 1000) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    await delay(acceptBackoffDelay);
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch  {
                continue;
            }
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            this.#serveHttp(httpConn, connInfo);
        }
    }
     #closeHttpConn(httpConn2) {
        this.#untrackHttpConnection(httpConn2);
        try {
            httpConn2.close();
        } catch  {}
    }
     #trackListener(listener1) {
        this.#listeners.add(listener1);
    }
     #untrackListener(listener2) {
        this.#listeners.delete(listener2);
    }
     #trackHttpConnection(httpConn3) {
        this.#httpConnections.add(httpConn3);
    }
     #untrackHttpConnection(httpConn4) {
        this.#httpConnections.delete(httpConn4);
    }
}
function hostnameForDisplay(hostname) {
    return hostname === "0.0.0.0" ? "localhost" : hostname;
}
async function serve(handler, options = {}) {
    const port = options.port ?? 8000;
    const hostname = options.hostname ?? "0.0.0.0";
    const server = new Server({
        port,
        hostname,
        handler,
        onError: options.onError
    });
    options?.signal?.addEventListener("abort", ()=>server.close()
    , {
        once: true
    });
    const s = server.listenAndServe();
    console.log(`Listening on http://${hostnameForDisplay(hostname)}:${port}/`);
    return await s;
}
console.log('v3');
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Splyt</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

    <style>
    html, body {
        height: 100%;
    }
    </style>
</head>
<body class="d-flex justify-content-center align-items-center">

    <div class="text-center">
        <h1>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAeCAYAAADaW7vzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAADaYAAA2mAFJnYvSAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjU8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4Ki08EsgAAE0dJREFUaAXdWntsHMd5n292b+/F4+PuZNUO5ciRDcukKEOR7OqfxpIcx4GVF4JQBVrEbY3GKYK4hYHWSdsgFNEGDtImaRujKZA2cNrYECQjsR2pbtNYYgNXgGOpjkRSlPWoFImWafL2jq/jPXenv29ml7yjdBQduSjakfZ2d2a+b773fPMthQha5mTu6eywuzd8F0eUvfj8/+Fhv7KYjZuG396QOTGZy4zmVebnb/v6Ppz7pGbxmIq8O6wq0niUkiG+9ImpZ7Pny7zmQva/KipzYuqZcEw0zNNCT4/mv0bJ1G+JcklkRvJRd1P6j8VOqmOiLQh3bkovIsWBRTTXf+gXPuBVy4mGEEP8tSc1w/P8A6L1/P5FJM1wi90ND62pWuI1nM487yEvfF3xvihcLa9FWolYFkuQWN68hXLdj/n9QtmZkdyTUMYfqWm3KpRwqL3zi5lhd607lv6MVkaoFCPY1RG1tK5hbrlSQiJoFUzy3BCeyG9EveLzkSO22LnTGNO1JjYI56rhVrw20rIcKBxrRWPYr1gVmqWKRmHWWqTTFlJeUrPTPjkxR1XLFTw71NH1O5m73Kx/Pv/pAtHMLceuJGqJ6Ed9n7JAVpRE1oqaUcrHOnFhWa+5RK9p7wqFGhIuhEaRPrewjioLtyhpd8h6zRHC0rYLFLaIimOAfzPkPT3iPkiS3gcbKQvfN+FASmWRT75SnhL+hKiLkfzdmXGtDKXDlPGWJe8x6K7lIXFjtelhdx0p9X4pZM0XfgSGOp/Kz/3HRaJyEy8hYQFPHSd/0RWhtkdAW0pJqhGRo5Ta5/Zlx4QH7+Y1iaSolGGoYmPmVOFh6EdHKSnIEdJ/03Z70t/ODucvKa/+LCXa2tVCkZViUWf6o9b87I9Sb8x+8sqd7bns2HQ7OZGnhA36ahXoUYfkkKTme70mKNsu1NT0NzHwGpOBSzUykz2V3w0iP4f1tmA4Q37dURTgBJWUAnyl9GnAfR9woBdSF+IJme7apabnhHA43Ader5/AbQVGR/6b2RH3kIpEvgllnjZD8LIDy2Jtk4eYdbtnxq1xBoAyKBp93q9WBUXjQpUXZucyqV/F0GkxJHjyokXjWYR9tpW8Q1iRv6RYXEApQERCzc+9ghljQhoRQAo28CnM206R6HZNhlcX1JESynVftwU2u1wfHcqMznxIlUvPUVt7t5qfrapCvkZd6V9z5mf23X5W7T53B30ne3IqJSLO11WpVFcELzCraJrMjzYBPKq6KFhxGM6C7h8cNKErmJkZzT0myPobkYwJwr6lqtp7wQGcBmrjH1iRhd2nyRHBXlHNFoUqLUDjLBiEMJgg7gFmZUMY7xGx+KNibrY/M1J43N3U9T0WjDaGYFbL27puPQSXOyvK5WlhW52qCOXbdjssfj0GWcFXtx2mi5TcAMMWfsGtkmU5YOOKSEoDQ8wL6DCRAm91H3I2fSwv34e85IzERsJM2W5vx6sQwAdhsSNQisOwUEqdku33T5fzf81L5jav+QYQHZA3r7VlIuXAiiPNV4d5jyfiMp1kS0saUgdgRUMWE5MedXvgGU8KeK6aKZSgDJ8tCmtKakvxZWFPs6g9BRLgxk0NZiYRqRC3GF5Ytk2JZITicX0hRBK8qgK8FXKcLrKtp6H8z2sUxxe11oSx8cWuX4RyhYiVKhcx+xxFsDyJMsUTiCZ+n567A/ISesNuBNVwYHgLxRJgkxTDwF4v5i+n3womGuPS4Q04bFtSKpBXIhmndAeLp5OzKEZWF0j5cnfTG9lTxQ+JheIhCGULrIPDl0125LPpE+5PEJufE3X/S35+WkLYUei1rrcntmjNL0IN/sFmPW8i3yks+XNDzKAQUwOaaEj0fkomkmpuBvFAxtnJVK16XNSqJ2DsdQl2BXTll0tR+EBokYZhZoabdgpoxvemVaUyqRf1BaSnboViowgTCmGhIiLRKJT/Lew9Z/Ob6F8ZlH1RB21+0c2g5MeLC+t5dXFl2y0L2ZPuf0Jo2/hdIDyDMw5ZYFN7JUKoZlqIvXs5nHraA4fde0ETJoFAi1fB/snZqgYLEhjOtizEfd+/rCoLxzCHLcxXbr4NskDICts2qonRUSfXk3zrpuHpfq9UHILldiM8lEQ0Fiev+IW1JyZeevvuNWcA8qkQbFX3ASiDwxY3pd6jacATJZMIP6WX3U2ZBwLDMHMaf4P9Y6mLBag8eJINw3ku1pn+/Xp5vs1DkPBFvQf4nqB48kFVKkZFrVKhto6oKM4/mT2tjuY20lzEkxZSAMgzbKxrrQchSsd5nzOpvkX/jrD5KKiM8HEA4r8ne2rq5lzPmreaUu+BAQml+JkRdyOANwsOvwzDG7ctfxqusrQIaE+0RdTc7JDbm3m4YVw/QjsNrbe3KkaVM9nXeV5ZkcdVHcqFFSPW1Ska2+ZZzsf0bJO9NAC+g8fQshiENz4hOrrHRYwfIAzJnqoPpXvxbEKD8Q49IfhhHHAQCGBhfB2VJu5ITU31tk24vZ2H3b7Mh5EtPgMPZ3ALtCMkxrb41bwxIqpy0omxRoRNz3oEdv6KqtXewuZuwQs9ikRuhSi365nLMzZ0kpT3IQHoEtUaZAWYWu2ykN6rIWZ4f6D1sEcnB+Yl9Hy8NSuEhw8MahfL93Y+h8BzEJaITgQn20Yc8X6dpwQuCokghKx0GYHyfCV6BrRRKl+d1W7Nwiot+GB0W2k6N5QdK+zAPF+wp7KbDzBtOpzqJZt/WKBabsbDj8Cqca2/oLRiq7bzB/CQc5RIgGiF0IUtkdRHGEdNWHzeauCbyQqyO7HV8Aa6C73pS9DcTwWiHsioIUpwZNwd0GGEa7xXy0v5/kMsIxBWQ1IBGDHk3pldTNmhsWaFaGkE2A6AnkCODYQFg3A/baX8GrH/QbseNlfEZO7Z3jWav5UfkEaa7YOF3eq6hkAjcecgQs0FHXKQX6lKWZETv1dVa0dQujmUHZ0yXsgVAvbEwYboohfmHyiDGdIZGe47kcFAiRdvwzkBHjZ3V7uLCfu0gDjvr1V5cl+vUo4lkJMbaNy4sWLNfqtfTZfWEKz+BwKpL/SjwxaM/EHssTdrflkZQ0axXafym4SvPgADAzQSEc4cJb2o8R07xvk5N21B5nHZ26nBRRlerRCG2GoojFrWK6D/AsIVmMIZSVprEag3a6T9/Y061l0r/nDpYf9+6+3bU5PAwxaMPSTFFl1TpXmWmBDJ5EMIvC8gvT540+n8ZjDuwVOu35jVBrdnAKSuJ1UZcRxmhfDB20RmaqTYJWvRZuk3i4nnc9PWXEvIHyPhOIMsjsMWQlG8W/hl7WniONxqh5GT9PyPw8A6RL1aQdZnIfUd89rSLxtUwS9v5i3bEpPXVkigTT4QKqKTwomCX8X7CFB6d2m8Qy2xtx7o7+cUm3Kb0j+SlrUb555foCrgkBNFzq7qanaG02AhUh27var3ypphdw+Uwoy8M+UzAMkaYizTAlhIHd7m10oWIdvnTtPCxzBkBd28R8EDpm/rmsZ56QDzDyx1vW/5/m/oWRxaERmyp6dSyDj34DhggHXYEs/PvJcKvKY4uDUwAM1HsEDrWyuFmHQOcIrkGSzM/xF5+cdap9FNHQi5aY19+QiHNm5IFad60y9JGdvuz8/9BZKHSQ5hUDgH37qayVfwnEI55BnsLfcBwsCF8BrJdX4871aUg3hSnTgFJZr3U3JeVTjNvF7TdGoj8C2xDyn6PLw6pg+JQnwgcyJ3f4jB9yIfhsI2q+K8hypGFHPmEEr26fHjCGkDhnbIL/CQlW3r2sQx4wMDGqdUYoItDXbF2sCPd5Me2LPH5N4hZau9M+69e9kCLc6M8n2ZJ/xk2z2Iv19CaBlHKszScxDSkLKmbFSoHl9EzXE7bEZF4RsLXOm9jy2Xm68+rg+R8Dzh8KYuz+fvyCBdrDccNgPh8DFjeRsc1H2FnvQI8DwPWtjLSrjzGeSRcDpKPp/hchL6avpQKOXBQl/6pB7fCq8K98Bwv1sEbPSYwbC3MdtY7DMPQZkb9ZEZTk+1j2i6KTh9L5v/Tl737zeCxbmHhVjYEL+EAtxX6o6NjbF0GN4B5cOSKyWkBaovNTab0ehxqjTOEggSROl+zlK4uhsoA992Po+T+i6kvBgmPlewwA7zXGy2zEoFp2kWMLI8jpaik8e6q+OclVkaF5+dOHtDo4j1XXgJb7w4AqCUotSnOscK67Onpt8PZT0QrKM9CMnj3zOMhmUj6UHygwZ9cHbAsOANqCQZnniwf8Csi7X1gtzXqknbLsHamCFGBpTIOG60sXeZFt7128zGzgtrRvMD2K92oUMiRcaafsIqFzn3dpkPzR0zpuWKrIpb+K0Cdbl0T/4x4flfUx6jRoCKxaNibi6HFx1GZJuTp6J3BV6zFgfHGsKwRZ73m+DtH8eJcAJsaCCE33IbuzgDfEkkkg9BMWWUPGJWcf4PYTMdFI8h0a1VUELiA+i/5HAW0hiCDV+EyY/vXxL6XEcRDn1Q1Y7MqdwH3Z7sT0QvmaQGgNdVCHhH7GPBLJYtlu2AevnV/GiVskdkHHeD5UiHa9twaoLLq4i/gAROpiHI30OGxPiQT7CjUDXSmdKC51e9EJeFOcX0/J34nvNVmHwEyosKcu8lK3KPrknWObWC8SARgcC+7m7OvsFZXmFDeiYznHsV5aAt7CqI/QiQzv34BvRjOunug4LmoPeolPLoFKHIiIOyFhjR36HO9xBAYoG3fBaRg7hMA5qinNGRtP7W0AcvW/atx3Kso16lXETZJIkEoIZ9J0616rPw5u+SJYdxjpGoxc2tQiEewsQvqwNNnvnZj/gPS8625dYgX3vBq/q3AzH8H0ZRKwtPl3QoqTO5UhHMIaW0kbJ49fGp29omDKOLcVfqomTE2YLD3xYdAtiFwSeExtbDFufI9BpS0/n97uY1X9Xwvf3MCL6b0D+J2ZlHgT8KGJyFKg4l23Zh0V2MQ6L07+fdxzD3rC6n4IEzQwjvMMoeu6BETqkiQdSowmMc9B3O/SB7CP3cjOGYZx0FJu/sOsHnLJFq34OPgT6f/kUksgZp8he43EKJmBDzs5OQycoNmLmIxyGLS8RQ/JJ7rQx57VFj9iKB8gLj5Z2S9yQUtXD3PB+bOQuzhtJN1Jyw6eklTCaEsGGjD0qpelzZRQEUV6HiF3Ge4biWaItCSORPF77XGc8+rOF5b+DQAE9HInEU3vYViaMD1uAdvwZFVnQxtVyqIf3mGM91SJzJkLZyOYebhU8GfMgkKINLIfgohok4NMOBiZ4Se2EwvO+YVF2DaFp5bTSS9p8C97jszCKPRqtXq0w3F0LhdazF2esqBJtqjNrbQTh22lQbgAip6S/fVFlvp1EOJbAQiTMIAgRfKE3Ek1x+12V9zushoD/Pbcp856rVTPhEfddBmb4TwjeXbO90OCHA+eaUXy4/gjD12/iOU4HgGkOIjof4lPBlb27my9g/eE/Ah772KLwEVypCXR0AMWUYXUgMDspub9cLSNH/DQpnkqAQRFSumXkeF0if13TuCNPbBqo5fGF/m+rtOGdJ6yP+3PTPkE1a7Flc/GQDkp1pBuhqHbLwwV2jJDnpu+4ZbK5zKpfjov1Yw1KrfwzwRZJOtV6qvC5mCu8FcBGCtzQLsCp4D2+qU7DAUVRKX0Q19NVgAbP/6Bc8ck4fiUQAOyaKxaOQC6eyCCPyCknvZyheHHE3dnE4FCwI0LyUPLD1mhqUn9+U+bOu4fwLVrH4CRh7H0wFH3GQS1QrCWnJ8xqe6WaY4Bs9Pjw9hbD2AMa47C51ucQS38KzSbvhbRpu+Q8nHlh3kuhE99HLO8okP4HoAPX5XP0mH2ETHvjmcrCr32Fd3ZdVHEjifBf/fNa429UzV9cD615/4UKs+zLwMc7g4j4tvOVYsBGHXYjBB7PnSvhTmolS9kJV4VPtN8Kxq+6sCF0xvmrEdPBYmKi0mLLYrRCGgpoU1hzMnimq9OsTlezZosK+8vLivJXWCycxXSu01h4SAsG6xvGlIHy94Tss6aIQJl1thSyIuRhGhneNEMBw2CtguuaQt3RgRI0V/sNho9EreP7yxvF+QJ8JjIBWms+FTrTsycJ9qFN9kQuu8CabC48oQP6VRs0KCw+ly9dqfA88BXTKgE7mcbFddw/RVsQMhxd/IbvRFuJafmfcbLUsHHOZsNlqPfM9hUd5HocWXfXFvYnJVuCYZ2AYjtddfmnMiuAFG/H3ap/Dof9ZpMgOQlYJNTjENu+HnH1p/Fu3aqW1XKtxgOnjTwwmfDatuxoPMcw2IrzR55UEtnfv6rAjTXpXm8ncllCysbCSh5DzZ8W38dcuO/xcDn+BUiohVY3ji18emfWfaIDmpGEJx2qelq1749a+mkXftTkcp2AfHK3YO+BP7xrqVoh2IIeAwNUscgTfm0c2Fsc3HE4sftfd3H76qqShFZ5V9v/fUohC3EZyBTU4+i9CUHpeJZ83NA3ZX4zS+CuYRKoN56TLOJF/DLW3H3LVWv/Vzg1hbwa+fshqnv+/+2bRDA5W/Dl50p/J/4qScv5/nKAhOEOGXvcn3Fl4xYtkJw7wH4JoZXABclnIuVF6/hsfzzuktx2UPgAAAABJRU5ErkJggg==">
        </h1>

    </div>

</body>
</html>
`;
const info = await Promise.all([
    queryMetadataServer('ClusterName'),
    queryMetadataServer('ClusterLocation'),
    queryMetadataServer('Zone').then((r)=>r?.split('/').pop() ?? null
    ), 
]);
console.log(...info);
const text = `Splyt Technologies Ltd.\n`;
const [clusterName, clusterLocation, zone] = info;
const headers = new Headers();
Object.entries({
    'x-cluster-name': clusterName,
    'x-cluster-location': clusterLocation,
    'x-cluster-zone': zone,
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
}).filter(([, v])=>!!v
).forEach(([k, v])=>{
    v && headers.set(k, v);
});
await serve(async (req)=>{
    if (req.headers.get('accept')?.match(/text\/html/)) {
        const newHeaders = new Headers(headers);
        newHeaders.set('content-type', 'text/html');
        return new Response(html, {
            status: 404,
            headers: newHeaders
        });
    }
    return new Response(text, {
        status: 404,
        headers
    });
}, {
    port: 8080,
    hostname: '0.0.0.0'
});
async function queryMetadataServer(data) {
    const path25 = {
        'ClusterLocation': '/computeMetadata/v1/instance/attributes/cluster-location',
        'ClusterName': '/computeMetadata/v1/instance/attributes/cluster-name',
        'Zone': '/computeMetadata/v1/instance/zone'
    }[data];
    const url = join3('http://metadata.google.internal', path25);
    const r = await fetch(url, {
        headers: {
            'Metadata-Flavor': 'Google'
        }
    }).catch(()=>null
    );
    if (!r || !r.ok) {
        return null;
    }
    const body = await r.text();
    return body || null;
}
