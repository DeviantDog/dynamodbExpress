import express from 'express';
import AWS from 'aws-sdk';
import moment from 'moment';

const app = express();
const port = 80;
AWS.config.update({ region: process.env.region });
const documentClient = new AWS.DynamoDB.DocumentClient();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', async (req, res) => {
    let params: any = {
        TableName: process.env.databaseTable
    }
    let scanResults: AWS.DynamoDB.DocumentClient.AttributeMap[] = [];
    let items;

    do {
        items = await documentClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    res.status(200).send(scanResults);
});

app.post('/additem', async (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(req.body);

    const params = {
        TableName: process.env.databaseTable,
        Item: {
            id: Math.floor(Math.random() * Math.floor(10000000)).toString(),
            created: moment().format('YYYYMMDD-hhmmss'),
            metadata: JSON.stringify(req.body),
        }
    }
    try {
        const data = await documentClient.put(params).promise();
    }
    catch (err) {
        // tslint:disable-next-line:no-console
        console.log(err);
        return res.send(err);
    }
    return res.status(200).send({ body: 'OK!' });
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});