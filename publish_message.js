// Imports the Google Cloud client library
const { PubSub } = require("@google-cloud/pubsub");

module.exports.publishMessage = async function (message) {
  const projectId = "studycase-314214"; // Your Google Cloud Platform project ID
  const topicName = "projects/studycase-314214/topics/transactions"; // Name for the new topic to create
  const subscriptionName =
    "projects/studycase-314214/subscriptions/transactionsub"; // Name for the new subscription to create
  // Instantiates a client
  const pubsub = new PubSub({ projectId });

  // Creates a new topic
  const topic = await pubsub.topic(topicName);
  console.log(`Topic ${topic.name} created.`);

  // Creates a subscription on that new topic
  const subscription = await topic.subscription(subscriptionName);

  // Receive callbacks for errors on the subscription
  subscription.on("error", (error) => {
    console.error("Received error:", error);
    process.exit(1);
  });

  // Send a message to the topic
  let data = JSON.stringify(message);
  topic.publish(Buffer.from(data));
};
