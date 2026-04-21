'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const buildUrl = (path, params) => `https://phantom.app/ul/v1/${path}?${params.toString()}`;

exports.buildUrl = buildUrl;
