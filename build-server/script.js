require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const  mime = require('mime-types');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region:'us-east-2',
    credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_ID}`,
        secretAccessKey: `${process.env.SECRET_KEY}`,
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init(){
    console.log("Executing script.js");
    const opDirPath = path.join(__dirname, 'output');

    const p = exec(`cd ${opDirPath} && npm install && npm build`);

    p.stdout.on('data', (data) => {
        console.log("MESSAGE:", data.toString());
    });

    p.stdout.on('error', (data) => {
        console.log("ERROR:", data.toString());
    });

    p.stdout.on('close', async (data) => {
        console.log("Build has been completed");
        const distPath = path.join(__dirname, 'output', 'dist');
        const distContent = fs.readFileSync(distPath, { recursive: true });
        
        for(const filePath of distContent){
            if(fs.lstatSync(filePath).isDirectory()) continue;
            
            console.log("Uploading files to bucket");
            const command = new PutObjectCommand({
                Bucket:`${process.env.AWS_BUCKET}`,
                Key: `__outputs/${PROJECT_ID}/${filePath}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            });
            
            await s3Client.send(command);
            console.log('uploaded files', filePath);
        };
        
        console.log("Project successfully uploaded to S3 Bucket");
    });
}

init();