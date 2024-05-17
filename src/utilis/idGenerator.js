const fs = require("fs");

const cusIdGenerator = () =>{
    const file = loadFile();
    const id = file.cusId;
    file.cusId++
    saveFile(file);
    return "CUSID-"+ id;
}

const prodIdGenerator = () =>{
    const file = loadFile();
    const id = file.prodId;
    file.prodId++
    saveFile(file);
    return "PRODID-"+ id;
}

const ordIdGenerator = () =>{
    const file = loadFile();
    const id = file.ordId;
    file.ordId++
    saveFile(file);
    return "ORDID-"+ id;
}

const loadFile = () =>{
    try{
        const bufferFile = fs.readFileSync("./src/utilis/id.json");
        const jsonFile = bufferFile.toString();
        const file = JSON.parse(jsonFile);
        return file;
    }catch(error){
        return {error: "something went wrong!"}
    }

}

const saveFile = (file) =>{
    fs.writeFileSync("./src/utilis/id.json", JSON.stringify(file));
}

module.exports = {
    cusIdGenerator: cusIdGenerator,
    prodIdGenerator: prodIdGenerator,
    ordIdGenerator: ordIdGenerator
}