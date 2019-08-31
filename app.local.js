'use strict'

const app = require('./index.js')
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server is listening on port ${port}.`))
