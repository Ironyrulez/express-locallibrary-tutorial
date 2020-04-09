var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;
const statusEnum = ['Available', 'Maintenance', 'Loaned', 'Reserved']

var BookInstanceSchema = new Schema(
    {
        book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
        imprint: {type: String, required: true},
        status: {type: String,
            required: true,
            enum: statusEnum,
            default: 'Maintenance'},
        due_back: {type: Date, default: Date.now}
    });

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function () {
    return '/catalog/bookinstance/' + this._id;
});

// Virtual for bookinstance's formatted due date
BookInstanceSchema.virtual('due_back_formatted').get(function () {
    return moment.utc(this.due_back).format('MMMM Do, YYYY');
});

// Virtual for bookinstance's formatted due date
BookInstanceSchema.virtual('due_back_html_input').get(function () {
    return moment.utc(this.due_back).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);
module.exports.statusEnum = statusEnum