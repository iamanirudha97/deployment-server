const express = require('express');
require('dotenv').config();
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');

const app = express();
const PORT = 9000;

app.use(express.json());

const ecsClient = new ECSClient({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID,
        secretAccessKey: process.env.SECRET_KEY
    }
})

const ecsConfig = {
    CLUSTER: `arn:aws:ecs:us-east-2:458024631199:cluster/devClusterV3`,
    TASK: `arn:aws:ecs:us-east-2:458024631199:task-definition/builder-taskV2:2`
}

app.post('/projectDeploy', async (req, res) => {
    const { gitRepoUrl } = req.body;
    const projectSlug = generateSlug()

    const command = new RunTaskCommand({
        cluster: ecsConfig.CLUSTER,
        taskDefinition: ecsConfig.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ["subnet-04c22b79f54920e6b", "subnet-054028456ba7a74dc", "subnet-009390b15fcf510a1"],
                securityGroups: ["sg-034f984203febd3c7"]
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: "builder-imageV3",
                    environment: [
                        { name:'GIT_REPO_URL', value: gitRepoUrl },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        } 
    })

    await ecsClient.send(command);
    res.status(202).json({ status: "queued", data: { projectSlug, url: `http://${projectSlug}.localhost:8000` }});
    return;
})

app.listen(PORT, () => {
    console.log(`The Backend Server is running on ${PORT}`);
})