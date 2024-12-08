import fs from "fs/promises";
import { Buffer } from "buffer";
//file descriptor - just a number assigned to an open file. unique to every open file

(async()=>{

    //commands
    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete the file";
    const RENAME_FILE = "rename the file";
    const ADD_TO_FILE = "add to the file";

    //functions
     const createFile = async (path)=> {
        try{
			const fileHandler = await fs.open(path, "r");
			fileHandler.close();

			return console.log(`File ${path} already exits`);

		} catch (e){
			const newFile = await fs.open(path, "w");
			newFile.close();
			return console.log(`File ${path} created successfully`);
		}
    }

    const deleteFile = async (path)=>{
        try {
            await fs.unlink(path);
            console.log("File deleted successfully!");
        } catch (e) {
            if(e.code === "ENOENT"){
                console.log("No file exist at this path");
            }else{
                console.log("An error occured");
            }
        }
    }
    const renameFile = async (oldPath, newPath)=>{
        try {
            await fs.rename(oldPath, newPath);
            console.log("Renamed successfully");
        } catch (e) {
            if(e.code === "ENOENT"){
                console.log("No file exist at this path, or the destination dir does not exist");
            }else{
                console.log("An error occured");
            }
        }
    }

    let stopAddingTwice = null; 
    const addToFile = async (path, content)=> {
        console.log(content);
        if(stopAddingTwice === content) return;
        try {
            const fileHandle = await fs.open(path, "a");
            fileHandle.write(content);
            console.log("Content added successfully!");
            fileHandle.close();
            stopAddingTwice = content;

        } catch (error) {
            console.log("An error occured while adding content");
        }
    }



    const commandFileHandler = await fs.open("./command.txt", "r");

    commandFileHandler.on("change", async ()=>{
        const size = (await commandFileHandler.stat()).size // this will give the size of your file (content inside it)
        const buff = Buffer.alloc(size);
        const offset = 0; // buff will start fill from this location
        const length = buff.byteLength;
        const position = 0; // position we want to start reading from our file

        await commandFileHandler.read(
            buff,
            offset,
            length,
            position
        );
        const command = buff.toString("utf-8");

        if(command.includes(CREATE_FILE)){
            const filePath = command.substring(CREATE_FILE.length + 1);
            createFile(filePath);
        }

        // delete file
        if(command.includes(DELETE_FILE)){
            const filePath = command.substring(DELETE_FILE.length + 1);
            deleteFile(filePath);
        }

        //rename file
        // rename the file <oldFilePath> to <newFilePath>
        if(command.includes(RENAME_FILE)){
            const _idx = command.indexOf(" to ");
            const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
            const newFilPath = command.substring(_idx + 4);
            renameFile(oldFilePath, newFilPath);
            
        }

        //add to file 
        // add to the file <path> this content: <content>
        if(command.includes(ADD_TO_FILE)){
            const _indx = command.indexOf(" this content: ");
            const path = command.substring(ADD_TO_FILE.length + 1, _indx);
            const content = command.substring(_indx + 15);
            addToFile(path, content);
        }

    });

    const watchCommandFile = fs.watch("./command.txt");

    for await (const event of watchCommandFile){
        if(event.eventType === "change"){
            commandFileHandler.emit("change")
        }
    }
})();

//note: Node only understand a character encoder and decoder, it does not understand img,video etc
//decoder 01=>meaningful
//encoder meaningful=>01