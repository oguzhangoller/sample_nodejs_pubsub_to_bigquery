userCount = async function () {
  const { BigQuery } = require("@google-cloud/bigquery");

  // Create a client
  const bigqueryClient = new BigQuery();

  // The SQL query to run
  const sqlQuery = `SELECT COUNT(DISTINCT user_id) AS total_users FROM \`studycase-314214.dataflow_sql_dataset.users\``;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query
  const result = await bigqueryClient.query(options);

  return result[0][0];
};

dailyUsers = async function () {
  const { BigQuery } = require("@google-cloud/bigquery");

  // Create a client
  const bigqueryClient = new BigQuery();

  // The SQL query to run
  const sqlQuery = `SELECT date, COUNT(DISTINCT user_id) AS daily_active_users FROM \`studycase-314214.dataflow_sql_dataset.users\` GROUP BY date`;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query
  const result = await bigqueryClient.query(options);

  return result[0];
};

// daily average duration per user in Minutes
averageDurations = async function () {
  const { BigQuery } = require("@google-cloud/bigquery");

  // Create a client
  const bigqueryClient = new BigQuery();

  // The SQL query to run
  const sqlQuery = `SELECT SAFE_DIVIDE(SUM(duration), 60000) as daily_average_duration,user_id, date FROM (SELECT date, session_id, user_id, MIN(event_time) as session_begin, MAX(event_time) AS session_end,
    SAFE_SUBTRACT(MAX(event_time), MIN(event_time)) as duration,
    FROM \`studycase-314214.dataflow_sql_dataset.users\`
    GROUP BY date,user_id, session_id) AS subquery GROUP BY date, user_id`;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query
  const result = await bigqueryClient.query(options);

  return result[0];
};

module.exports = {
  userCount,
  dailyUsers,
  averageDurations,
};
