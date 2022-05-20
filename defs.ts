interface KonectyDocument {
    _id: string;
    _user: string;
}

interface DocumentLookup<T> {
    // key should be a prop of T
    [key keyof T]: T;

}

interface Activity extends KonectyDocument {
    _id: string;
    product: DocumentLookup<Product> {
        _id: string;
        name: string;
    };
}

interface Product {
    _id: string;
    value: number;
    address: string;
    discount?: number;
}
interface Konecty {
    get<T extends KonectyDocument>(id: T): Promise<T>;
}


// konecty.

// konecty

import { KonectyClient } from '@konecty/sdk';

const client = new KonectyClient({
    endpoint: 'http://localhost:3000',
    accessKey: 'asdfasdfsadfsadf',
});

client.get('Activity', 123).then(activity => {})

const filter = {
	"match": "and",
	"conditions": [
        { "term": "status", "operator": "in", "value": ["Ativo"] },
        {
            "match": "or",
            "conditions": [
                { "term": "status", "operator": "in", "value": ["Ativo"] }
            ]
        }
    ]
}

const fields =  { title: true, description: true};


const activity = await client.findById<Activity>('Activity', 123,fields).then(activity => {})
const activity = await client.findOne<Activity>('Activity', { filter, sort, fields }).then(activities => {})
const {data: activities, count} = await client.find<Activity>('Activity', { filter, sort, start, limit, fields }).then(activities => {})

client.insert<Activity>('Activity', activity).then(activity => {})
client.update<Activity>('Activity', {
    set: activity,
    unset: {
        status: true
    }
}).then(activity => {})


client.remove<Activity>('Activity', activity_id).then(result => {})