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

async function init() {
    console.log('Executing script.js')
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString())
    })

    p.stdout.on('error', function (data) {
        console.log('Error', data.toString())
        publishLog(`error: ${data.toString()}`)
    })

    p.on('close', async function () {
        console.log('Build Complete')
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath)

            const command = new PutObjectCommand({
                Bucket: 'vercel-clone-project-output',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })

            await s3Client.send(command)
            console.log('uploaded', filePath)
        }
        console.log('Done...')
    })
}

init();