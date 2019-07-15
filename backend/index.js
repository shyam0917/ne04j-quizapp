var express= require('express');
var path= require('path');
var logger= require('morgan');
var bodyParser= require('body-parser');
var neo4j = require('neo4j-driver').v1;
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var app= express();


app.use(logger('dev'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'pass@123'));
var session = driver.session();

app.get('/:type',async function getUsers (req,res) {
	
	var quesArr=[];
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	await	session.run('MATCH (:javascript)-[r:TYPE_OF]->(n:question) RETURN n')
	.then(function(result){
		var optionArr=[];
		result.records.map((record)=>{
			quesArr.push({
				id: record._fields[0].properties.id.low,
				name: record._fields[0].properties.name,
					typeId:record._fields[0].properties.typeId.low,
				isAnswer:record._fields[0].properties.correctAns.low,
				optionArr:[{
					name:record._fields[0].properties.option1,
				},{
					name:record._fields[0].properties.option2,
				},{
					name:record._fields[0].properties.option3,
				},{
					name:record._fields[0].properties.option4,
				}
				],
		})

		})


	})
	return res.send(quesArr);

})



app.listen(3001);
console.log('server started at port:3001');
module.exports=app;