var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: Date,
        date_of_death: Date
    });

// Virtual for author's full name
AuthorSchema.virtual('name').get(function() {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case
    var fullname = '';
    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name) {
        fullname = '';
    }

    return fullname;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
    if (this.date_of_birth && this.date_of_death)
        return '(' + moment.utc(this.date_of_birth).format('MMMM Do, YYYY') + ' - '
            + moment.utc(this.date_of_death).format('MMMM Do, YYYY') + ')';
    if (this.date_of_birth)
        return '(Date of Birth: ' + moment.utc(this.date_of_birth).format('MMMM Do, YYYY')
            + ')';
    if (this.date_of_death)
        return '(Date of Death: ' + moment.utc(this.date_of_death).format('MMMM Do, YYYY')
            + ')';
    else
        return '';
});

// Virtual for author's date of birth, formatted for HTML Input tag date value
AuthorSchema.virtual('dobirth_html_input').get(function() {
    if (this.date_of_birth)
        return moment.utc(this.date_of_birth).format('YYYY-MM-DD');
    else
        return '';
});

// Virtual for author's date of death, formatted for HTML Input tag date value
AuthorSchema.virtual('dodeath_html_input').get(function() {
    if (this.date_of_death)
        return moment.utc(this.date_of_death).format('YYYY-MM-DD');
    else
        return '';
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id;
});

//Export model
module.exports = mongoose.model('Author', AuthorSchema);