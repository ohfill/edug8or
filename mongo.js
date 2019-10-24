const mongoose = require('mongoose')
const got = require('got')
mongoose.connect('mongodb://localhost/edug8or', 
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}
)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

const EventSchema = new mongoose.Schema({
    url: {              // url of the `event`
        type: String,
        unique: true
    },
    title: String,      // title of the `event` as reported by source
    tags: [String],     // these will vary widely, but can include sector and topic
    source: String,     // where did this come from? see ./sources/ folder
    foundAt: {          // record when we first ingest the event
        type: Date,
        default: Date.now
    },
    expireAt: {         // i think this will work...
        type: Date,
        index: true,
        default: () => { new Date(new Date().getTime() + 1000*60*24) }  // expire in 24 hours
    }
})

EventSchema.statics.dump = function() {
    return this.find({}).sort({foundAt: 1})
}

module.exports = mongoose.model('Event', EventSchema)
/* // leaving testing code for reference
const ee = mongoose.model('Event', EventSchema)
// testing
t1 = new ee({url: 'https://google.com', title: 'google test'})
t2 = new ee({url: 'https://www.google.com', title: 'google test 2'})
t3 = new ee({url: 'https://www.yahoo.com', title: 'yahoo test'})

; // because inline is wack
(async function() {
    ee.collection.drop()
    console.log('before', await ee.find({}).exec())
    for (let t of [t1, t2, t3]) {
        try {
            await t.save()
        } catch (error) {
            console.error('error', error)
        }
    }
    console.log('after', await ee.dump())
})()
*/
