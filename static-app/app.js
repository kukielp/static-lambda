const serverless = require('serverless-http');
const express = require('express');
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const app = new express();
const mime = require('mime-types')

app.get('/*', async (req, res) => {
    
    /*
        This is for API GW  
        req.requestContext.path = req.requestContext.path.replace("/Prod","")
        let file = req.requestContext.path.replace("/","")
    */
    
    let file = req.url.replace("/","")

    if(file === ''){
        file = "index.html"
    }

    res.set('Content-Type', mime.contentType(file))

    if(file === 'local.html'){
        res.sendFile(`assets/${file}`, { root: __dirname });
    }else{
        const params = {
            Bucket: "hosting-paulk",//process.env.AWS_BUCKET,
            Key: file
        }
        const { Body } = await s3.getObject(params).promise()
        res.send(Body.toString())
    }
});

module.exports.lambdaHandler = serverless(app);