import { promises as fs } from 'fs';
import * as fssync from 'fs'
import * as path from 'path';
import { parse } from 'csv-parse';
import { v4 as uuidv4 } from 'uuid'

export class Utils {

    /**
     * Checks if a directory exists at the given path.
     * @param dirPath - The path of the directory to check.
     * @returns A promise that resolves to true if the directory exists, otherwise false.
     */
    static directoryExists(dirPath: string): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            try {
                const stats = await fs.stat(dirPath);
                return resolve(stats.isDirectory());
            } catch (error: Error|any) {
                // If the error is due to the path not existing, return false
                if (error.code === 'ENOENT') {
                    return reject(false);
                }
                // Re-throw any other error
                throw error;
            }
        })
    }
    static replaceAllInstances(inputString: string, char: string, replacement: string): string {
        // Escape the character if it's a special regex character
        const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
        // Create a regex to match all instances of the character
        const regex = new RegExp(escapedChar, 'g');
      
        // Replace all instances of the character with the replacement string
        const resultString = inputString.replace(regex, replacement);
      
        return resultString;
    }

    /**
     * Recursively retrieves file paths from a given directory that contain "phrase" in their names.
     * @param dirPath - The directory path to search in.
     * @returns A promise that resolves to an array of matching file paths.
     */
    static getFilesWithPhrase(dirPath: string, phrase: string): Promise<string[]> {
        return new Promise(async(resolve, reject) => {
            let result: string[] = [];

            try {
                // Read all items (files and subdirectories) in the directory
                const items = await fs.readdir(dirPath, { withFileTypes: true });
    
                for (const item of items) {
                    const itemPath = path.join(dirPath, item.name);
    
                    if (item.isDirectory()) {
                        // Recursively search in subdirectories
                        const subDirFiles = await Utils.getFilesWithPhrase(itemPath, phrase);
                        result = result.concat(subDirFiles);
                    } else if (item.isFile() && item.name.includes(phrase)) {
                        // Add file path if it contains ".route." in the name
                        result.push(itemPath);
                    }
                }
                return resolve(result);
            } catch (error) {
                console.error(`Error reading directory ${dirPath}:`, error);
                return reject(error)
            }
        })
    }

    /**
     * Dynamically loads a class from a given file path and creates a new instance.
     * @param filePath - The path to the module containing the class.
     * @param className - The name of the class to instantiate.
     * @param constructorArgs - Arguments to pass to the class constructor.
     * @returns A promise resolving to an instance of the loaded class.
     */
    static loadManifest(
        filePath: string,
        ...constructorArgs: any[]
    ): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                // Dynamically import the module
                const module = await import(filePath)
    
                if (!module.default) {
                    throw new Error(`Default module not found in '${filePath}'.`)
                }
    
                // Create a new instance of the class with the given arguments
                const ClassReference = module.default
                return resolve(new ClassReference(...constructorArgs))
            } catch (error) {
                console.error(`Error loading class default from file '${filePath}':`, error)
                return reject(error)
            }
        })
    }

    /**
     * Dynamically loads csv into an array of any from a filepath.
     * @param filePath - The path to the module containing the class.
     * @returns A promise resolving to an instance of any array of rows from the csv file.
     */
    static async loadCSV(filePath: string): Promise<any> {
        const results: any[] = [];
        const parser = fssync.createReadStream(filePath)
            .pipe(parse({
                delimiter: ',', // Adjust if your CSV uses a different delimiter
                columns: true, // If your CSV has headers, this will use them as keys
                skip_empty_lines: true
            }));
    
        parser.on('data', (data: any) => {
            results.push(data);
        });
        parser.on('error', (err: any) => {
            console.error('Error reading CSV:', err);
        });
        await new Promise((resolve: any) => {
            parser.on('end', () => {
                resolve();
            });
        });
    
        return results;
    }
    
    /*
        Asynchronously write data to a file on node fs and await closure before resolving
    */
    static writeFile(targetFilePath: string, data: any): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            try {
                    const writeStream = await fs.open(targetFilePath, 'w');
                    const result = JSON.stringify(data)
                    try {
                        await writeStream.write(result);
                    } catch (innerErr) {
                        console.error(innerErr)
                    } finally {
                        await writeStream.close();
                        setTimeout(() => {
                            return resolve(true)
                        }, 1)
    
                    }
            } catch (err) {
                return reject(err)
            }
        })
    }

    // simple funtion to return all files including sub directories in a given path
    static getAllFilePaths(directory: string): Promise<string[]> {
        return new Promise(async(resolve, reject) => {
            try {
                const filePaths: string[] = [];

                async function traverse(dir: string) {
                    const entries = await fs.readdir(dir, { withFileTypes: true });
            
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        if (entry.isDirectory()) {
                            // Recursively traverse subdirectories
                            await traverse(fullPath);
                        } else if (entry.isFile()) {
                            // Add file paths to the result array
                            filePaths.push(fullPath);
                        }
                    }
                }
            
                await traverse(directory);
                return resolve(filePaths);
            } catch (err) {
                return reject(err)
            }
        })
    }

    /*
        SYNCHRONOUS
        Ensures that a subdirectory exists within a root directory.
        If the subdirectory does not exist, it creates it.
    
        @param rootDirectory - The root directory path.
        @param subDirectoryName - The name of the subdirectory to check or create.
    */
    static ensureSubdirectoryExists(rootDirectory: string, subDirectoryName: string): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            // Resolve the full path to the subdirectory
            const subDirectoryPath = path.join(rootDirectory, subDirectoryName);

            try {
                // Check if the path exists and is a directory
                if (!fssync.existsSync(subDirectoryPath)) {
                    fssync.mkdirSync(subDirectoryPath, { recursive: true }); // Create the directory if it doesn't exist
                    console.log(`Directory created: ${subDirectoryPath}`);
                    setTimeout(() => {
                        return resolve(true)
                    },10)
                } else if (!fssync.lstatSync(subDirectoryPath).isDirectory()) {
                    throw new Error(`The path ${subDirectoryPath} exists but is not a directory.`);
                } else {
                    console.log(`Directory already exists: ${subDirectoryPath}`);
                    setTimeout(() => {
                        return resolve(true)
                    },10)
                }
            } catch (error: any) {
                console.error(`Failed to ensure directory exists: ${error.message}`);
                return reject(false)
            }
        })
    }

    // Given the input string, remove all instances of target array with empty string
    static emptyAllInstances(input: string, targets: string[]): string {
        let output = input
        targets.forEach((item) => {
            output = output.split(item).join('');
        })
        return output
    }

    static getRandomIntBetween(min: number, max: number): number {
        const lower = Math.ceil(min);
        const upper = Math.floor(max);
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    static newGuid() {
        const rand = `${process.pid}-${process.ppid}-${Date.now()}`
        return uuidv4()
    }

    static sleep(ms: number): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                return resolve(true)
            }, ms)
        })
    }

}