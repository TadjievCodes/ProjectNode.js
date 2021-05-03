let express = require('express');
let bodyParser = require('body-parser');
let sql = require("mssql/msnodesqlv8");

// call express constructor to create express application object
// and the body parser
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// create configuration object literal for connection string
// must use SQL authentication
// note the the \\ in the SQL server name
let config = {
    server: 'DESKTOP-HHGD0V8\\TEW_SQLEXPRESS',
    database: 'store',
    // the trustedConnection property below allows Windows authentication
    // when set to true
    options: {
        trustedConnection: true
    }
};

// a handler for the HTTP GET request
//the __dirname global value to create a fully qualified url
app.get('/', function (request, response) {
    response.sendFile(__dirname + "/index.html");
});

//a handler for the HTTP POST request
app.post('/api/data', function (request, response) {
    let postBody = request.body;

    if (postBody.op === "Add") {
        let data = {};

        data.firstName = postBody.fName;
        data.lastName = postBody.lName;
        data.address = postBody.address;
        data.city = postBody.city;
        data.province = postBody.province;
        data.postal = postBody.postalCode;
        insertData(data, response);
        console.log("Added user data" + data);
    }
    else if (postBody.op === "Find") {
        selectData(postBody.cusID, response);

    }
    else if (postBody.op === "Update") {
        let data = {};
        data.cusID = postBody.cusID;
        data.firstName = postBody.fName;
        data.lastName = postBody.lName;
        data.address = postBody.address;
        data.city = postBody.city;
        data.province = postBody.province;
        data.postal = postBody.postalCode;
        updateData(data, response);
        console.log("Updated user data" + data);

    }
    else if (postBody.op === "Delete") {
        deleteData(postBody.cusID, response);
    }
});

//the web server running on hard coded port 3000
let server = app.listen(3000, function () {
    console.log('Server is running..');
});

// ******************************************
//helper function expressions
// ******************************************

let insertData = function (data, response) {
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
        }

        let queryString = "INSERT INTO Customers (FirstName, LastName, Address, City, Province, PostalCode) VALUES (@First, @Last, @Address, @City, @Province, @PostalCode)";

        let request = new sql.Request();

        request.input("First", sql.VarChar(50), data.firstName)
               .input("Last", sql.VarChar(50), data.lastName)
               .input("Address", sql.VarChar(50), data.address)
               .input("City", sql.VarChar(50), data.city)
               .input("Province", sql.VarChar(25), data.province)
               .input("PostalCode", sql.VarChar(10), data.postal)
            
          
               .query(queryString, function (err, recordset) {
                if (err) {
                    console.log(err);
                }
                console.log("Added user" + recordset);

                //SQL to get the last "identity" field value
                queryString = "SELECT @@IDENTITY AS 'identity'";
                request.query(queryString, function (err, returnVal) {
                    if (err) {
                        console.log(err);
                    }
                    // extract the "CusID" assigned by SQL Server for the last INSERT
                    let identValue = returnVal.recordset[0].identity;
                    // send recordset as a response for debugging purposes
                    response.send(returnVal);
                    sql.close();
                });
            });
    });
};




let selectData = function (cusID, response) {
    
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
        }

        //Request object
        var request = new sql.Request();
        let sqlQuery = "SELECT * FROM Customers WHERE CusID = @CusID";

        
        request.input("CusID", sql.Int, cusID)
            .query(sqlQuery, function (err, recordset) {
                if (err) {
                    console.log(err);
                }
                response.send(recordset);
                console.log("Find btn" + recordset);
                sql.close();
            });
    });
};

let updateData = function (data, response) {
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request();
        let query = "UPDATE Customers SET FirstName = @First , LastName = @Last, Address = @Address, City = @City, Province = @Province, PostalCode = @PostalCode WHERE CusID = @CusID";
        
     request.input("CusID", sql.Int, data.cusID)
            .input("First", sql.VarChar(50), data.firstName)
            .input("Last", sql.VarChar(50), data.lastName)
            .input("Address", sql.VarChar(50), data.address)
            .input("City", sql.VarChar(50), data.city)
            .input("Province", sql.VarChar(25), data.province)
            .input("PostalCode", sql.VarChar(10), data.postal)

            .query(query, function (err, recordset) {
                if (err) {
                    console.log(err);
                }
                response.send(recordset);
                console.log("Update btn" + recordset);
                sql.close();
            });
    });
};

let deleteData = function (cusID, response) {

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
        }

        var request = new sql.Request();
        let sqlQuery = "DELETE FROM Customers WHERE CusID = @CusID";

        request.input("CusID", sql.Int, cusID)
            .query(sqlQuery, function (err, recordset) {
                if (err) {
                    console.log(err);
                }

                response.send(recordset);
                console.log("Delete btn" + recordset);
                sql.close();
            });
    });
};