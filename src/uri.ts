/*
 * Implements URI-specific functions
 *
 * See RFC 2386
 *
 * See also:
 *   http://www.w3.org/2005/10/ajaw/uri.js
 *   http://www.w3.org/2000/10/swap/uripath.py
 *
 */
var alert = alert || console.log

import RDFlibNamedNode from './named-node'

/**
 * Gets the document part of an URI
 * @param uri The URI
 */
export function docpart(uri: string): string {
  var i: number
  i = uri.indexOf('#')
  if (i < 0) {
    return uri
  } else {
    return uri.slice(0, i)
  }
}

/**
 * Gets the document part of an URI as a named node
 * @param x - The URI
 */
export function document(x: string): RDFlibNamedNode {
  return new RDFlibNamedNode(docpart(x))
}

/**
 * Gets the hostname in an URI
 * @param u The URI
 */
export function hostpart(u: string): string {
  var m = /[^\/]*\/\/([^\/]*)\//.exec(u)
  if (m) {
    return m[1]
  } else {
    return ''
  }
}

/**
 * Joins an URI with a base
 * @param given - The relative part
 * @param base - The base URI
 */
export function join(given: string, base: string): string {
  var baseColon, baseScheme, baseSingle
  var colon, lastSlash, path
  var baseHash = base.indexOf('#')
  if (baseHash > 0) {
    base = base.slice(0, baseHash)
  }
  if (given.length === 0) {
    return base
  }
  if (given.indexOf('#') === 0) {
    return base + given
  }
  colon = given.indexOf(':')
  if (colon >= 0) {
    return given
  }
  baseColon = base.indexOf(':')
  if (base.length === 0) {
    return given
  }
  if (baseColon < 0) {
    alert('Invalid base: ' + base + ' in join with given: ' + given)
    return given
  }
  baseScheme = base.slice(0, +baseColon + 1 || 9e9)
  if (given.indexOf('//') === 0) {
    return baseScheme + given
  }
  if (base.indexOf('//', baseColon) === baseColon + 1) {
    baseSingle = base.indexOf('/', baseColon + 3)
    if (baseSingle < 0) {
      if (base.length - baseColon - 3 > 0) {
        return base + '/' + given
      } else {
        return baseScheme + given
      }
    }
  } else {
    baseSingle = base.indexOf('/', baseColon + 1)
    if (baseSingle < 0) {
      if (base.length - baseColon - 1 > 0) {
        return base + '/' + given
      } else {
        return baseScheme + given
      }
    }
  }
  if (given.indexOf('/') === 0) {
    return base.slice(0, baseSingle) + given
  }
  path = base.slice(baseSingle)
  lastSlash = path.lastIndexOf('/')
  if (lastSlash < 0) {
    return baseScheme + given
  }
  if (lastSlash >= 0 && lastSlash < path.length - 1) {
    path = path.slice(0, +lastSlash + 1 || 9e9)
  }
  path += given
  while (path.match(/[^\/]*\/\.\.\//)) {
    path = path.replace(/[^\/]*\/\.\.\//, '')
  }
  path = path.replace(/\.\//g, '')
  path = path.replace(/\/\.$/, '/')
  return base.slice(0, baseSingle) + path
}

/**
 * Gets the protocol part of an URI
 * @param uri The URI
 */
export function protocol(uri: string): string | null {
  const i = uri.indexOf(':')
  if (i < 0) {
    return null
  } else {
    return uri.slice(0, i)
  }
}

/**
 * Gets a relative uri
 * @param base The base URI
 * @param uri The absolute URI
 */
export function refTo(base: string, uri: string): string {
  var c: string,
      i: number,
      k: number,
      l: number,
      len: number,
      len1: number,
      n: number,
      o: number,
      p: number,
      q: number,
      ref: string,
      ref1: number,
      s: string
  var commonHost = new RegExp('^[-_a-zA-Z0-9.]+:(//[^/]*)?/[^/]*$')
  if (!base) {
    return uri
  }
  if (base === uri) {
    return ''
  }
  for (i = o = 0, len = uri.length; o < len; i = ++o) {
    const c = uri[i]
    if (c !== base[i]) {
      break
    }
  }
  if (base.slice(0, i).match(commonHost)) {
    k = uri.indexOf('//')
    if (k < 0) {
      k = -2
    }
    l = uri.indexOf('/', k + 2)
    if (uri[l + 1] !== '/' && base[l + 1] !== '/' && uri.slice(0, l) === base.slice(0, l)) {
      return uri.slice(l)
    }
  }
  if (uri[i] === '#' && base.length === i) {
    return uri.slice(i)
  }
  while (i > 0 && uri[i - 1] !== '/') {
    i--
  }
  if (i < 3) {
    return uri
  }
  if (base.indexOf('//', i - 2) > 0 || uri.indexOf('//', i - 2) > 0) {
    return uri
  }
  if (base.indexOf(':', i) > 0) {
    return uri
  }
  n = 0
  ref = base.slice(i)
  for (p = 0, len1 = ref.length; p < len1; p++) {
    c = ref[p]
    if (c === '/') {
      n++
    }
  }
  if (n === 0 && i < uri.length && uri[i] === '#') {
    return './' + uri.slice(i)
  }
  if (n === 0 && i === uri.length) {
    return './'
  }
  s = ''
  if (n > 0) {
    for (q = 1, ref1 = n; ref1 >= 1 ? q <= ref1 : q >= ref1; ref1 >= 1 ? ++q : --q) {
      s += '../'
    }
  }
  return s + uri.slice(i)
}
