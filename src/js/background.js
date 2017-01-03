// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([{
            // That fires when a page's URL contains a 'g' ...
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: ".assetic.net", urlContains: 'ComplexAsset', schemes: ['https'] }
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: ".assetic.net", urlContains: 'complex', schemes: ['https'] }
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: ".assetic.net", urlContains: 'Assets', schemes: ['https'] }
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: ".assetic.net", schemes: ['https'] }
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: ".asseticdev.net", schemes: ['https'] }
                })
            ],
            // And shows the extension's page action.
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});