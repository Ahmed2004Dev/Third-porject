// console.log("Hello");




// PART ONE





// 01
// const path = require("node:path")
// const fs = require("node:fs")
// const FilePath = path.resolve("./big.txt");

// const Stream = fs.createReadStream(FilePath , {encoding:"utf8"});
// Stream.on("data" , (chunck)=>{
//     console.log(chunck);

// })




// 2
// const path = require("node:path")
// const fs = require("node:fs")
// const FilePath = path.resolve("./sourse.txt");
// const FilePath2 = path.resolve("dest.txt")

// const ReadStream = fs.createReadStream(FilePath, { encoding: "utf8" });
// const WriteStream = fs.createWriteStream(FilePath2);

// ReadStream.on("data", (chunck) => {
//     console.log(chunck);
//     WriteStream.write(chunck)

// })




// 3
// const { createGzip } = require("node:zlib");
// const path = require("node:path");
// const fs = require("node:fs");
// const FilePath = path.resolve("./sourse.txt");
// const FilePath2 = path.resolve("dest.txt");
// const ZipFile = path.resolve("dest.txt.gz");
// const zip = createGzip();

// const ReadStream = fs.createReadStream(FilePath);
// const WriteStream = fs.createWriteStream(FilePath2);
// const WiriteZipFile = fs.createWriteStream(ZipFile);
// ReadStream.pipe(zip).pipe(WiriteZipFile);








// PART TWO





// 1
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { json } = require("node:stream/consumers");
const port = 3000;

const server = http.createServer((req, res) => {
    const { url, method } = req;


    // Add User
    if (method === "POST" && url === "/Users") {
        // Receving Data
        let data = "";
        req.on("data", (chunck) => {
            data += chunck
        })
        req.on("end", () => {
            const NewUser = JSON.parse(data);
            console.log(NewUser);

            // Add New user data to File

            fs.readFile(path.resolve("./users.json"), "utf8", (error, data) => {
                if (error) {
                    res.writeHead(500, { "content-type": "application/json" })
                    res.write("Can not Read file")
                }

                const users = JSON.parse(data)

                // Check Email

                let CheckUser = users.find((user) => {
                    return user.Email === NewUser.Email
                })
                if (CheckUser) {
                    res.writeHead(409, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        message: "Email already exists"
                    }))
                }

                // Push New user

                users.push({
                    id: NewUser.id,
                    UserName: NewUser.UserName,
                    age: NewUser.age,
                    Email: NewUser.Email
                })

                // Add New user data to file Actualy
                let datajson = JSON.stringify(users, null, 2)
                fs.writeFile("./users.json", datajson, (error) => {
                    if (error) {
                        res.writeHead(500, { "content-type": "application/json" });
                        return res.end(JSON.stringify({ MASSAGE: "Error writing file" }));
                    }
                })


                // Success proccess
                res.writeHead(201, { "content-type": "application/json" })
                res.end(JSON.stringify({
                    Massage: "Done"
                }))




            })





        })
    }
    // Apdate user data
    if (method === "PATCH" && url.startsWith("/Users/")) {
        // reseving Data
        const id = Number(url.split("/")[2]);

        let data = ""
        req.on("data", (chunck) => {
            return data += chunck
        })

        req.on("end", () => {
            // receving new data
            const UpdateData = JSON.parse(data);

            fs.readFile(path.resolve("./users.json"), "utf8", (error, FileData) => {

                const users = JSON.parse(FileData);
                console.log(users);

                // Serch id

                const SearchUser = users.find((user) => {
                    return user.id === id
                })



                if (!SearchUser) {
                    res.writeHead(404, { "Content-Type": "application/json" })
                    return res.end(JSON.stringify({
                        Message: "User Not found"
                    }));
                }
                // Update data

                if (UpdateData.UserName !== undefined) {
                    SearchUser.UserName = UpdateData.UserName
                }
                if (UpdateData.age !== undefined) {
                    SearchUser.age = UpdateData.age
                }
                if (UpdateData.Email !== undefined) {
                    SearchUser.Email = UpdateData.Email
                }
                // Update in file
                fs.writeFile(path.resolve("./users.json"),
                    JSON.stringify(users, null, 2),
                    () => {

                        res.writeHead(201, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ Massage: "Update done" }))


                    })



            })



        })


    }
    // Delete file
    if (method === "DELETE" && url.startsWith("/Users/")) {

        // استخراج الـ id من الرابط
        const id = Number(url.split("/")[2]);

        // قراءة الملف
        fs.readFile(path.resolve("./users.json"), "utf8", (error, fileData) => {

            if (error) {
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                return res.end(JSON.stringify({
                    message: "Cannot read file"
                }));
            }

            const users = JSON.parse(fileData);

            const index = users.findIndex((user) => {
                return user.id === id;
            });

            if (index === -1) {

                res.writeHead(404, {
                    "Content-Type": "application/json"
                });

                return res.end(JSON.stringify({
                    message: "User ID not found"
                }));
            }

            users.splice(index, 1);

            fs.writeFile(
                path.resolve("./users.json"),
                JSON.stringify(users, null, 2),
                (error) => {

                    if (error) {

                        res.writeHead(500, {
                            "Content-Type": "application/json"
                        });

                        return res.end(JSON.stringify({
                            message: "Cannot write file"
                        }));
                    }

                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "User deleted successfully"
                    }));

                }
            );

        });

    }
    // Read file
    if (method === "GET" && url === "/Users") {
        fs.readFile(path.resolve("./users.json"), "utf8", (error, FileData) => {

            const DataUsers = JSON.parse(FileData)

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(DataUsers))
        })
    }
    // Read User data
    if (method === "GET" && url.startsWith("/user/")) {

        const id = Number(url.split("/")[2]);



        fs.readFile(path.resolve("./users.json"), "utf8", (error, FileData) => {

            const DataUsers = JSON.parse(FileData)

            const Searchuser = DataUsers.find((user) => {
                return user.id === id
            })

            if (!Searchuser) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ Massage: "this user is not font" }))
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(Searchuser))
            }




        })
    }



}).listen(port, "localhost", () => {
    console.log("the server work in 3000")

})










// Part 3

// 1
// It is a mechanism inside Node.js responsible for monitoring the Call Stack and the Queue.
//  Whenever the Call Stack becomes empty, it moves the ready-to-execute callback from the Queue to the Call Stack.


// 2
// It is a library written in C that serves as the core engine behind Node.js.
//  It is responsible for handling slow and complex operations, including asynchronous I/O operations, the Thread Pool, and the Event Loop.


// 3
// By event loop consept


// 4
// Event loop is a mechanism inside Node.js responsible for monitoring the Call Stack and the Queue.
// Call stack is place for Emplimintaion the functions now in js
// Queues is Waiting list Save the "Call stack" ready to emplementaiont


// 5
// is group from threads to emplimintation complex and Slowly opreations.
// Task manager => Performance => Logical operator


// 6
// The OS Scheduler is a component inside the operating system responsible for managing all processes and threads on the devices.
//  It determines which thread gets CPU (processor) time, and when it is stopped, paused, or interrupted.
//  All of this—whether the Main Thread, a Thread Pool, or other threads—relies on the OS Scheduler to obtain execution time.
//  Meanwhile, the Event Loop is capable of managing callbacks and queues. This means the Event Loop runs the threads and not itself,
