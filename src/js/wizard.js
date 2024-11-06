import {validateEntries, formEntries} from "./config";

export let json = {
    form_url: undefined,
    form_entries: undefined
}

window.copyForm = function() {
    // don't change
    let copyUrl = "https://docs.google.com/forms/d/1pk46eKwpl5gtdLhj9Z8N1rnbQZzuRIF8ycGPbNpbeOE/copy"
    window.open(copyUrl, '_blank').focus();
}

let prefilled = document.getElementById("prefilled-input")
prefilled.onchange = function (){validate()}
export function validate() {
    let inUrl = prefilled.value
    const urlReg = new RegExp(`([A-Za-z0-9_]+?)(?=\\/viewform\\?)`);
    const entryReg = new RegExp(`&entry.[0-9]+?(?==)`);
    const entryReg2 = new RegExp(`[0-9]+`);
    let urlObj = urlReg.exec(inUrl)
    let errors = []
    let entriesArray = []
    let match = null
    let entries = {}
    if (urlObj != null){
        json.form_url = urlObj[0]
    }else{
        errors.push("Form id not found. (The part after https://docs.google.com/forms/d/e/ needs to be there)")
    }
    let index = inUrl.search(entryReg)
    if (index === -1) {
        errors.push("No entries found. Make sure you entered the prefilled link from Copy Link")
    } else {
        for (let i = 0; i < 50; i++){ //instead of a while
            match = entryReg.exec(inUrl.substring(index))
            if (match != null) {
                entriesArray.push(match[0])
                index += match[0].length + 1
            }else{
                break
            }
        }
        if (entriesArray.length !== formEntries.length) {
            errors.push("Incorrect number of entries. (You didn't fill out all the required questions. Try again)")
        } else {

            entriesArray.forEach((string, index) => {
                let entry = formEntries[index]
                let number = entryReg2.exec(string)[0] //extracts ids (012345) from the inputs: &entry.012345
                entries[entry] = Number(number)
            });
        }
        json.form_entries = entries
    }
    errors.forEach((x) => console.log("Error:", x, "\n"))
    let jsonOut = JSON.stringify(json)
    console.log(jsonOut)
}


