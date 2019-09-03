const port = process.env.PORT || 3000
const express = require('express')
const app = express()
const morgan = require('morgan')
const me = require('mustache-express')
const cookieParser = require('cookie-parser')
const hash = require('object-hash')
const util = require('util')

function randomChoice(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function cookieName(choices) {
    let h = hash(choices)
    return 'random-stuff/' + h
}

function normalize(ctx) {
    if (typeof ctx.maxAge == 'string') {
        ctx.maxAge = parseInt(ctx.maxAge)
    }
    return ctx
}

app.engine('svg', me())
app.engine('txt', me())

app.use(morgan('combined'))

app.use(cookieParser());

app.get('/', (req, res) => {
    const defaults = {
        "maxAge": 60 * 60 * 3, // seconds
        "text": "...",
        "x": "100%",
        "y": "100%",
        "text-x": "50%",
        "text-y": "50%",
        "font-size": 120,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "fill": "blue",
        "bgcolor": "orange"
    }
    var ctx = normalize({...defaults, ...req.query})
    if ('choices' in req.query) {
        const now = new Date()
        let choices = req.query.choices
        let cn = cookieName(choices)
        console.log(req.cookies);
        if (typeof req.cookies != 'undefined' && cn in req.cookies) {
            let cv = req.cookies[cn]
            if ('choice' in cv && 'expires' in cv) {
                let ce = new Date(cv.expires)
                if (ce > now) {
                    ctx.choice = cv.choice
                    ctx.expires = ce
                }
            }
        }
        if (!('choice' in ctx)) {
            console.log("Making a random choice")
            ctx.choice = randomChoice(choices)
            const dt = now
            dt.setSeconds(dt.getSeconds() + ctx.maxAge);
            ctx.expires = dt
        }
        let options = {
            expires: ctx.expires,
            httpOnly: true,
            signed: false
        }
        ctx.text = ctx.choice
        ctx.dump = util.inspect(ctx, {showHidden: false, depth: null})
        res.cookie(cn, {
            "choice": ctx.choice,
            "expires": ctx.expires
        }, options)
        res.set('Cache-Control', 'private, max-age=' + ctx.maxAge);
        res.set('Expires', ctx.expires.toUTCString());
        res.set('Content-Type', 'image/svg+xml');
        res.render('badge.svg', ctx)
        console.log({
            "choice": ctx.choice,
            "expires": ctx.expires
        })
    } else {
        res.set('Cache-Control', 'private, max-age=0');
        res.set('Expires', 0);
        res.set('Content-Type', 'text/plain');
        res.render('help.txt', ctx)
    }
})

module.exports = app
