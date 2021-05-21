## 1. About The Project

This is a sample node.js project for analyzing large amount of logs using Google Cloud Services such as [Pub/Sub](https://cloud.google.com/pubsub/docs/overview), [DataFlow](https://cloud.google.com/dataflow) and [BigQuery](https://cloud.google.com/bigquery).

## 2. How To Run It Locally

* Download the repo and install dependencies via 'npm install' command
* Authenticate your own google cloud account as mentioned [here](https://cloud.google.com/docs/authentication/getting-started)
* Create a Topic and BigQuery table as mentioned [here](https://cloud.google.com/dataflow/docs/samples/join-streaming-data-with-sql)
* Set project id, topic name, subscription name and table name in project accordingly
* Create and run a [dataflow template](https://cloud.google.com/dataflow/docs/concepts/dataflow-templates)
* Make a POST request to _/logs_ endpoint with body in following sample format
```json
[
   {
      "type":"event",
      "app_id":"com.codeway.test",
      "session_id":"vIfEMi9kJW",
      "event_name":"about",
      "event_time":1598196427881,
      "page":"settings",
      "country":"US",
      "region":"New Jersey",
      "city":"Newark",
      "user_id":"9t0lrnYLQr"
   },
   {
      "type":"event",
      "app_id":"com.codeway.test",
      "session_id":"vIfEMi9kJW",
      "event_name":"purchase",
      "event_time":1598196493043,
      "page":"paywall",
      "country":"US",
      "region":"New Jersey",
      "city":"Newark",
      "user_id":"9t0lrnYLQr"
   }
]
```
* Make a GET request to _/stats_ endpoint to get data in following format
```json
{
    "averageDurations": [
        {
            "daily_average_duration": 4.01815,
            "user_id": "qdwvqOLXlB",
            "date": {
                "value": "2020-08-25"
            }
        },
        {
            "daily_average_duration": 4.254383333333333,
            "user_id": "DMXlGh5yPG",
            "date": {
                "value": "2020-08-25"
            }
        },
        {
            "daily_average_duration": 4.237733333333333,
            "user_id": "9t0lrnYLQr",
            "date": {
                "value": "2020-08-23"
            }
        },
        {
            "daily_average_duration": 2.1321,
            "user_id": "gGSNIrIrUK",
            "date": {
                "value": "2020-08-23"
            }
        }
    ],
    "dailyUsers": [
        {
            "date": {
                "value": "2020-08-25"
            },
            "daily_active_users": 2
        },
        {
            "date": {
                "value": "2020-08-23"
            },
            "daily_active_users": 3
        }
    ],
    "total_users": 4
}
```
## 3. Running Mechanism

Upon a request to _/logs_ endpoint, a json message with related body content is published to related topic. 
![topic](https://user-images.githubusercontent.com/25663377/119144687-959ace80-ba51-11eb-8226-19dc6ba7f467.JPG)

Published messages are detected by running dataflow job and records are inserted to BigQuery user table.

![running_job](https://user-images.githubusercontent.com/25663377/119144460-5a000480-ba51-11eb-9117-dfb8fef863ee.JPG)

![insert_logs](https://user-images.githubusercontent.com/25663377/119144403-4bb1e880-ba51-11eb-9c22-9aac8916733b.JPG)


On a request to _/stats_ endpoint, a connection is made to BigQuery client and values such as daily active users, daily average durations and total users are requested.
![bigquerytable](https://user-images.githubusercontent.com/25663377/119144890-cda21180-ba51-11eb-85a9-0aa4f37b21cd.JPG)
![tablerecords](https://user-images.githubusercontent.com/25663377/119144896-cf6bd500-ba51-11eb-9877-6f4f642c9063.JPG)


These values are returned to client in json format.
```json
{
    "averageDurations": [
        {
            "daily_average_duration": 4.01815,
            "user_id": "qdwvqOLXlB",
            "date": {
                "value": "2020-08-25"
            }
        },
        {
            "daily_average_duration": 4.254383333333333,
            "user_id": "DMXlGh5yPG",
            "date": {
                "value": "2020-08-25"
            }
        },
        {
            "daily_average_duration": 4.237733333333333,
            "user_id": "9t0lrnYLQr",
            "date": {
                "value": "2020-08-23"
            }
        },
        {
            "daily_average_duration": 1.1690833333333333,
            "user_id": "qdwvqOLXlB",
            "date": {
                "value": "2020-08-23"
            }
        },
        {
            "daily_average_duration": 2.1321,
            "user_id": "gGSNIrIrUK",
            "date": {
                "value": "2020-08-23"
            }
        }
    ],
    "dailyUsers": [
        {
            "date": {
                "value": "2020-08-25"
            },
            "daily_active_users": 2
        },
        {
            "date": {
                "value": "2020-08-23"
            },
            "daily_active_users": 3
        }
    ],
    "total_users": 4
}
```

## 4. Technology Preferences

For the app to function under high traffic, Pub/Sub mechanism is preferred for writing logs to BigQuery table. As stated in [documentation of Pub/Sub](https://cloud.google.com/pubsub/docs/overview), Pub/Sub offers durable message storage and real-time message delivery with high availability and consistent performance at scale. Google Cloud's Pub/Sub Service also offers auto-scaling, which can be useful for reducing costs at low traffic and performing well at high traffic. Since it is asynchronous, a request can be processed by one or more workers.

Google's another service, [DataFlow](https://cloud.google.com/dataflow) is used to create BigQuery table entries from topic message content. It's main advantages are streaming data with speed(low latency) and autoscaling of resources and dynamic work rebalancing, which are pretty useful for this case, since this service is expected to perform under high traffic and huge chunks of data.

Another optimization used for this case is creating `date` field in BigQuery table, which is used for [partitioning](https://cloud.google.com/bigquery/docs/partitioned-tables). Partitioned tables can be queried using filters based on the partitioning column that reduce the amount of data to scan, which can control costs and improve query performance. This speeds up the process for queries made for the date field.
