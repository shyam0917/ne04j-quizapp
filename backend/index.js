var express= require('express');
var path= require('path');
var logger= require('morgan');
var bodyParser= require('body-parser');
var neo4j = require('neo4j-driver').v1;
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var cors = require('cors');
var app= express();


app.use(logger('dev'));
app.use(bodyParser.json()); 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'pass@123'));
var session = driver.session();

app.get('/:type',async function getQuestions (req,res) {
	var typeArray=['javascript','csharp'];
	var quesArr=[];
	var query="";
	var pathVariable=req.params.type;
	if(pathVariable==typeArray[0]){
		query='MATCH (:javascript)-[r:TYPE_OF]->(n:question) RETURN n';
	}else if(pathVariable==typeArray[1]){
		query='MATCH (:csharp)-[r:TYPE_OF]->(n:question) RETURN n';
	}
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	await	session.run(query)
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


app.post('/createReport/:user',async function generateReport (req,res) {
	try{
		res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		var resultArr=req.body;
		let routeparam=req.params.user;
if(routeparam!=null){
		resultArr.questionArr.map(async (result,index)=>{
			let resultQuery="CREATE(n:USER {name:{pathname}}) WITH n MATCH (n) ,(`3` :question {name:{username}}) CREATE (n)-[r:`ATTEMPTED` {status:{status}}]->(`3`)";
			await	session.run(resultQuery,{pathname:req.params.user,username:result.name,status:resultArr.statusArr[index]})
			.then(function(result){
			})
			
		})

		return res.send({"success":true,"msg": "result updated successfuly"});
	}else{
		return res.send({"success":false,"msg": "Internal error occured"});
	}
	}catch(e){
		return res.send({"success":false,"msg": "Internal error occured"});
	}
})

app.listen(3001);
console.log('server started at port:3001');
module.exports=app;