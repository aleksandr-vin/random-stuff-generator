# Web server (or AWS Lambda) generating SVG with random choice

_**Also Expires, goes with Cookies and control Caching.**_

## Badge in SVG

Run `npm start` and try http://localhost:3000/?choices[0]=foo&choices[1]=bar&choices[2]=baz.

## Features

- Expiration time
- Persistence via Cookies
- Cache control
- Fully customizable via query parameters

## Installation

Using Claudia to create AWS Lambda:

    claudia create --handler lambda.handler --deploy-proxy-api
