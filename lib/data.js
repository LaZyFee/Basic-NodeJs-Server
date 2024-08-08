const fs = require('fs');
const path = require('path');

//module scaffolding
const lib = {};
//base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
    //open file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to string
            const stringData = JSON.stringify(data);
            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('error closing new file');
                        }
                    });
                } else {
                    callback('error writing to new file');
                }
            });
        } else {
            callback('could not create new file, it may already exist');
        }
    });

}


//read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
}


//update data to file
lib.update = (dir, file, data, callback) => {
    //open file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to string
            const stringData = JSON.stringify(data);
            //truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    //write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('error closing existing file');
                                }
                            });
                        } else {
                            callback('error writing to existing file');
                        }
                    });
                } else {
                    callback('error truncating file');
                }
            });
        } else {
            callback('could not open file for updating, it may not exist yet');
        }
    });
}

//delete data from file
lib.delete = (dir, file, callback) => {
    //unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        callback(err);
    });
}

//list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
}


module.exports = lib