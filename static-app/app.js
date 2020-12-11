const AWS = require('aws-sdk')
const { getEncoding } = require('istextorbinary')
const mime = require('mime-types')
var fs = require('fs');

const s3 = new AWS.S3()

exports.lambdaHandler =  async function(req, context) {
    let file = req.requestContext.http.path.replace("/","")
    let isLocal = false
    // This is for ALB: let file = req.path.replace("/","")

    if(file === ''){
        file = "index.html"
    }else if(file.split('/')[0] === 'local'){
        //If request path starts ith local then pull from "local"
        isLocal = true
    }

    let rBody
    if(isLocal){
        rBody = fs.readFileSync(file, 'utf8');
    }else{
        const params = {
            Bucket: "hosting-paulk",//process.env.AWS_BUCKET,
            Key: file
        }
        const { Body } = await s3.getObject(params).promise()
        rBody = Body
    }

    // Grab the last item in the request path, then get the mimetype fo that file.
    const Content_Type = mime.contentType(file.split("/").pop())
    
    let isBase64Encoded
    let responseBody

    if(getEncoding(rBody) === 'binary'){
        let bufferObj = Buffer.from(rBody, "utf8")
        responseBody = bufferObj.toString("base64")
        isBase64Encoded = true;
    }else{
        responseBody = rBody.toString()
        isBase64Encoded = false;
    }
    
//To Do:  Wrap above in try catch, if error return 500 ( ie missing file or what not )  
    clientResponse = {
        statusCode: 200,
        headers: { 
            "content-type": Content_Type
        },
        body: responseBody,
        isBase64Encoded: isBase64Encoded
    }
    
    return clientResponse
  }