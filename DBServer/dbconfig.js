require('dotenv').config();

/* Create a file called .env in this directory, write down the values ORACLE_USERNAME and ORACLE_PASSWORD
   with your information
*/
module.exports = {
  user          : process.env.ORACLE_USERNAME,
  password      : process.env.ORACLE_PASSWORD,
  connectString : "oracle.cise.ufl.edu/orcl"
};
