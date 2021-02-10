// /**
//  * Seed data for entries. Don't run this unless you're trying to add 360 random entries....
//  */


// const Entry = require('./models/entry');
// const mongoose = require('mongoose');
// const Project = require('./models/project');

// mongoose.Promise = global.Promise;
// mongoose.connect(
//   'mongodb://localhost:27017/journal_db', { useNewUrlParser: true}
// );

// let date = new Date(2021, 5, 30);
// let date2 = new Date(2021, 7, 30);
// let early = parseInt(date.getTime(), 10);
// let later = parseInt(date2.getTime(), 10);

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
// }

// for (let i = 0; i <= 10; i++) {

//     Entry.create({
//       title: 'Post number ' + i,
//       description: 'This is the description for post',
//       writtenDate: new Date(getRandomInt(early, later)),
//       project: '6019ef28f32e2f09691d83e8',
//       mood: getRandomInt(60, 100)
//     }).then(newEntry => {
//       Project.findByIdAndUpdate('6019ef28f32e2f09691d83e8', { $push: { entries: newEntry._id } }).then(() => {
//         console.log(i);
//       }).catch(err => {
//         console.log('projectController.entryPost error ' + err.message);
    
//       });
//     }).catch((err) =>{ 
//       console.log(err.message);
//       return;
//     });
// }
