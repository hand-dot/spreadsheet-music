"use strict";var precacheConfig=[["/spreadsheet-music/index.html","c6593188196ada359008b29d19e7185b"],["/spreadsheet-music/static/css/main.3fd5e217.css","ef99564dc523e5a8001b704cd611c336"],["/spreadsheet-music/static/js/main.d68d3774.js","f886280e24bf0701677bb42c511f968d"],["/spreadsheet-music/static/media/A.7cc2c6f2.mp3","7cc2c6f20be7b57d38fc20fe7d7f5b34"],["/spreadsheet-music/static/media/A.ece63f4b.mp3","ece63f4b16b2c7a32949d39e8313301a"],["/spreadsheet-music/static/media/Ab.3149f640.mp3","3149f64061389dd50a4807614c45382d"],["/spreadsheet-music/static/media/Ab.9c46bb41.mp3","9c46bb410efa72d5c73c7666bcef332b"],["/spreadsheet-music/static/media/Abm.ac85b1bc.mp3","ac85b1bc3ffd7eeecb2c3bf5b8d18b91"],["/spreadsheet-music/static/media/Am.18d726f6.mp3","18d726f67124d38f692b4ba04c9b703d"],["/spreadsheet-music/static/media/B.24c5cf3a.mp3","24c5cf3a0b2db7ae02ea94d07f1fd9e5"],["/spreadsheet-music/static/media/B.2d64908c.mp3","2d64908cafbaf9897f2a9e0d12069a29"],["/spreadsheet-music/static/media/Bb.685ac824.mp3","685ac824b5abcc8b6f14ea58e8bd6b32"],["/spreadsheet-music/static/media/Bb.a7e57c1b.mp3","a7e57c1b94ccf40dbabc1bce1b4b0d8d"],["/spreadsheet-music/static/media/Bbm.65b8d1fb.mp3","65b8d1fb32c6ad16c9a6702054866370"],["/spreadsheet-music/static/media/Bm.32bab55e.mp3","32bab55e38dd63d75e688194ebf1e943"],["/spreadsheet-music/static/media/C.47ead958.mp3","47ead95802fb7bc80e95dd45bcff70ef"],["/spreadsheet-music/static/media/C.8f4da563.mp3","8f4da563230eb92fdf0eb522bd7c3252"],["/spreadsheet-music/static/media/CloseHihat.1571b07d.mp3","1571b07df0de2a4b1ff031653892f91f"],["/spreadsheet-music/static/media/Cm.38195c4d.mp3","38195c4d488449179826b9e031de3737"],["/spreadsheet-music/static/media/D.5188ea36.mp3","5188ea36e03b7978cea427c946069bbb"],["/spreadsheet-music/static/media/D.a4ed7c0e.mp3","a4ed7c0e64525aa46bb77d497e427e82"],["/spreadsheet-music/static/media/Db.3dbad1fa.mp3","3dbad1fad16f55b5e0027a4671eb8cc9"],["/spreadsheet-music/static/media/Db.d51dc8fd.mp3","d51dc8fdb6aa904ad48afccf553fbcda"],["/spreadsheet-music/static/media/Dbm.d30b3253.mp3","d30b3253440dc53b1afa8fe725436df2"],["/spreadsheet-music/static/media/Dm.d610bb4d.mp3","d610bb4d2ec5dc9059c9acedcbd120d1"],["/spreadsheet-music/static/media/E.02d73b26.mp3","02d73b2676d7836484836ff13c94c17e"],["/spreadsheet-music/static/media/E.96ab9d59.mp3","96ab9d59eb0c3ef4444b31deac890dbd"],["/spreadsheet-music/static/media/Eb.55398347.mp3","55398347773e852684930c6f78815532"],["/spreadsheet-music/static/media/Eb.6d0ee499.mp3","6d0ee499d0623d22b07e9b2caedb2604"],["/spreadsheet-music/static/media/Ebm.6d0ee499.mp3","6d0ee499d0623d22b07e9b2caedb2604"],["/spreadsheet-music/static/media/Em.bff7fb7f.mp3","bff7fb7ffb111d19775b446aef8d1d6b"],["/spreadsheet-music/static/media/F.7918d344.mp3","7918d3442e3f416e2a1d76b1764615eb"],["/spreadsheet-music/static/media/F.b7644e03.mp3","b7644e036668ccabfd68ce9a39154337"],["/spreadsheet-music/static/media/Fm.93faff29.mp3","93faff29b24aefddd92c7179578a89ec"],["/spreadsheet-music/static/media/G.77149478.mp3","77149478664a30a14f65f0267c64b14f"],["/spreadsheet-music/static/media/G.d4cff584.mp3","d4cff5845007b7319ce9dd34cafc946c"],["/spreadsheet-music/static/media/Gb.88863452.mp3","88863452175133a199dedd73d9ec44ae"],["/spreadsheet-music/static/media/Gb.d9b86b7b.mp3","d9b86b7b29ffbac5b116cb56a13767a7"],["/spreadsheet-music/static/media/Gbm.a9df7414.mp3","a9df74144825c286e3b6ce23286b7e8b"],["/spreadsheet-music/static/media/Gm.93faff29.mp3","93faff29b24aefddd92c7179578a89ec"],["/spreadsheet-music/static/media/Kick.1457fa22.mp3","1457fa22978026ff75373d8f49636de6"],["/spreadsheet-music/static/media/OpenHihat.3df74ace.mp3","3df74acee2d73b71985ab4ed8c09828b"],["/spreadsheet-music/static/media/Snare.cb3bc1f9.mp3","cb3bc1f9ee5eacea417b9c05c0e03071"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(a){return a.redirected?("body"in a?Promise.resolve(a.body):a.blob()).then(function(e){return new Response(e,{headers:a.headers,status:a.status,statusText:a.statusText})}):Promise.resolve(a)},createCacheKey=function(e,a,t,s){var c=new URL(e);return s&&c.pathname.match(s)||(c.search+=(c.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),c.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(a){return t.every(function(e){return!e.test(a[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],s=new URL(a,self.location),c=createCacheKey(s,hashParamName,t,/\.\w{8}\./);return[s.toString(),c]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(s){return setOfCachedUrls(s).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var e=new Request(a,{credentials:"same-origin"});return fetch(e).then(function(e){if(!e.ok)throw new Error("Request for "+a+" returned a response with status "+e.status);return cleanResponse(e).then(function(e){return s.put(a,e)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(a){return a.keys().then(function(e){return Promise.all(e.map(function(e){if(!t.has(e.url))return a.delete(e)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(a){if("GET"===a.request.method){var e,t=stripIgnoredUrlParameters(a.request.url,ignoreUrlParametersMatching),s="index.html";(e=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,s),e=urlsToCacheKeys.has(t));var c="/spreadsheet-music/index.html";!e&&"navigate"===a.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],a.request.url)&&(t=new URL(c,self.location).toString(),e=urlsToCacheKeys.has(t)),e&&a.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(e){return console.warn('Couldn\'t serve response for "%s" from cache: %O',a.request.url,e),fetch(a.request)}))}});