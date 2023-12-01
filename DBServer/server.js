const fs = require('fs');
const http = require('http');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
const queries = require('./queries');
const Util = require("util");

let libPath;
if (process.platform === 'win32') {           // Windows
  libPath = 'C:\\oracle\\instantclient_21_7';
} else if (process.platform === 'darwin') {   // macOS
  libPath = process.env.HOME + '/Downloads/instantclient_21_7';
}
if (libPath && fs.existsSync(libPath)) {
  try {
    oracledb.initOracleClient({libDir: libPath});
  } catch (err) {
    console.error('Error please install: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html\n');
    console.error(err);
    process.exit(1);
  }
}

const httpPort = 7000;

async function run() {
  try {
    // Create HTTP server and listen on port httpPort
    const server = http.createServer();
    server.on('error', (err) => {
      console.log('HTTP server problem: ' + err);
    });
    server.on('request', (request, response) => {
      let baseURL = 'http://' + request.headers.host + '/';
      let myURL = new URL(request.url, baseURL);
      let params = myURL.searchParams;
      let query;
      switch (myURL.pathname) {
        case "/example":
          handleRequest(request, response);
          break;
        case "/delayPerMonth/":
          query = Util.format(queries.delayTimePerMonth, params.get("city"), params.get("year"))
          handleQuery(request, response, query);
          break;
        case "/weatherReasons/":
          query = Util.format(queries.weatherReasons, params.get("year"), params.get("city"), params.get("city"));
          handleQuery(request, response, query);
          break;
        case "/mostDelayPerYear/":
          query = Util.format(queries.mostDelayPerYear, params.get("year"), params.get("year"));
          handleQuery(request, response, query);
          break;
        case "/delayTypeCompareByYear/":
          query = Util.format(queries.delayTypeCompareByYear,
            params.get("year"), params.get("year"), params.get("month"),
            params.get("year2"), params.get("year2"), params.get("month"));
          handleQuery(request, response, query);
          break;
        case "/securityDelays/":
          query = Util.format(queries.securityDelays,
            params.get("year"), params.get("month"),
            params.get("year"), params.get("month"));
          handleQuery(request, response, query);
          break;
        case "/dissatisfaction/":
          query = Util.format(queries.dissatisfaction, params.get("year"))
          handleQuery(request, response, query);
          break;
        case "/getYears":
          handleQuery(request, response, queries.years);
          break;
        case "/getCities":
          handleQuery(request, response, queries.cities);
          break;
      }
      if(request.url.includes("query")){
        query = request.url.substring(7,request.url.length);
        queryFormatted = query.replaceAll("%20"," ");
        makeQuery(request,response,queryFormatted);
      }
    });
    await server.listen(httpPort);
    console.log("Server is running at http://localhost:" + httpPort);
  } catch (e) {
    console.log(e);
  }
}

async function handleQuery(request, response, query) {
  let connection;
  try {
    let binds, options, result;
    connection = await oracledb.getConnection(dbConfig);
    binds = {};

    options = {
      outFormat: oracledb.OBJECT,   // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };

    result = await connection.execute(query, binds, options);
    writeResponse(response, result);

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function handleRequest(request, response) {
  let connection;
  try {
    let sql, binds, options, result;
    connection = await oracledb.getConnection(dbConfig);

    sql = `select d.sumTime, c.city from
    (select airport, sum(arr_delay) AS sumTime from daiyilong.delay_more_15 where delay_month < 12 and delay_month > 8 group by airport order by sumTime desc fetch first 5 rows only) d,
    daiyilong.airport_project c where d.airport = c.airport_code`;
    binds = {};

    options = {
      outFormat: oracledb.OBJECT,   // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };

    result = await connection.execute(sql, binds, options);
    writeResponse(response, result);

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function makeQuery(request, response,query) {
  let connection;
  let gtQuery = query.replace("&gt;",">");
  let ltQuery = gtQuery.replace("&lt;","<");
  console.log(ltQuery);
  console.log
  try {
    let sql, binds, options, result;
    connection = await oracledb.getConnection(dbConfig);

    sql = query;
    binds = {};

    options = {
      outFormat: oracledb.OBJECT,   // query result format
      // extendedMetaData: true,               // get extra metadata
      // prefetchRows:     100,                // internal buffer allocation size for tuning
      // fetchArraySize:   100                 // internal buffer allocation size for tuning
    };
    try {
      result = await connection.execute(sql, binds, options);
      writeResponse(response, result);
    } catch (error) {
      writeResponse(response,error);
    }
    // result = await connection.execute(sql, binds, options);

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

function writeResponse(response, result) {
  response.setHeader('Access-Control-Allow-Origin', '*'); /* @dev First, read about security */
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  response.setHeader('Access-Control-Max-Age', 2592000); // 30 days  response.writeHead(200, {"Content-Type": "application/json"});
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(result));
  response.end();
  // console.log(result);
  console.log("Metadata: ");
  console.dir(result.metaData, {depth: null});
  console.log("Query results: ");
  console.dir(result.rows, {depth: null});
}

run();
