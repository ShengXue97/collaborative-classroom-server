const Pool = require("pg").Pool;

const pool = new Pool({
  host: "ec2-46-137-84-173.eu-west-1.compute.amazonaws.com",
  database: "daetddmaeq65j7",
  user: "howwqpentshjym",
  port: 5432,
  password: "b513e136ac155b31bf8a62ba90a4c5aaa383b124a0dcc9deace886ec4903f453",
});

const getMerchants = client => {
  return new Promise(function(resolve, reject) {
    client.query("SELECT * FROM merchants ORDER BY id ASC", [], function(
      err,
      result,
    ) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(result.rows);
    });
  });
};

const createMerchant = (client, body) => {
  return new Promise(function(resolve, reject) {
    const { name, email } = body;

    client.query(
      "INSERT INTO merchants (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
      function(err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(result.rows);
      },
    );
  });
};

const deleteMerchant = (client, merchantId) => {
  return new Promise(function(resolve, reject) {
    const id = parseInt(merchantId);

    client.query("DELETE FROM merchants WHERE id = $1", [id], function(
      err,
      result,
    ) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(result.rows);
    });
  });
};

module.exports = {
  getMerchants,
  createMerchant,
  deleteMerchant,
};
