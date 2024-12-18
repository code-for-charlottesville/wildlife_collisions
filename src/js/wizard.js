import {validateEntries, formEntries} from "./config";

const org = "code-for-charlottesville"
const repo = "wildlife_collisions"
const branch_name = "form"

// objects

let json = {
    form_url: undefined,
    form_entries: undefined
}

let github = {
    json: undefined,
    username: undefined,
}

// helper functions

function openUrlNewTab(url){
    window.open(url, '_blank').focus();
}

// form prefill

window.copyForm = function() {
    openUrlNewTab("https://docs.google.com/forms/d/1pk46eKwpl5gtdLhj9Z8N1rnbQZzuRIF8ycGPbNpbeOE/copy")
}

let prefilled = document.getElementById("prefilled-input")
prefilled.onchange = function (){validatePrefilledLink()}

function validatePrefilledLink() {
    let inUrl = prefilled.value
    if (!inUrl){
        return
    }
    const urlReg = new RegExp(/[A-Za-z0-9_]+?(?=\/viewform\?)/);
    const entryReg = new RegExp(/&entry\.[0-9]+?(?==)/g, 'g');
    const entryReg2 = new RegExp(/[0-9]+/);
    let urlObj = urlReg.exec(inUrl)
    let errors = []
    let entriesArray = []
    let match = null
    let entries = {}
    if (urlObj != null){
        json.form_url = urlObj[0]
    }else{
        errors.push("Form id not found in url. (The part after https://docs.google.com/forms/d/e/ needs to be there)")
    }
    let index = inUrl.search(entryReg)
    if (index === -1) {
        errors.push("No entries found. Make sure you entered the prefilled link from Copy Link")
    } else {
        while ((match = entryReg.exec(inUrl)) !== null) {
            entriesArray.push(match[0])
        }
        if (entriesArray.length > formEntries.length) {
            errors.push("Too many filled out questions! Make sure you are only filling out the required questions.")
        } else if(entriesArray.length < formEntries.length) {
            errors.push("You didn't fill out all the required questions. Try again, making sure only questions with the red asterisks are filled out")
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

// github

window.githubSetup = function() {
    openUrlNewTab("https://github.com/setup")
}

let github_input = document.getElementById("github-input")
github_input.onchange = function (){validateGithub()}
let github_warn = document.getElementById("github-input-warn")

function validateGithub(){
    let usernameValidator = new RegExp(/^[A-Za-z0-9][A-Za-z0-9-]*$/);
    let username = github_input.value
    if(!username || username === "") {
        github_warn.innerText = ""
    } else if (usernameValidator.test(username)) {
        github_warn.innerText = ""
        github.username = username
    } else {
        github_warn.innerText = "Invalid entry. Github usernames only contain uppercase and lowercase letters, numbers, and hyphens"
    }
}

const GithubLocation = {
    INVALID: 0,
    FORK: 1,
    JSON: 2,
}

window.githubUserFork = function() {
    goToGithub(GithubLocation.FORK)
}

window.githubUserJson = function() {
    goToGithub(GithubLocation.JSON)
}

function goToGithub(location /* of type GithubLocation*/){
    if(github.username === undefined){
        github_warn.innerText = "Please enter your github username first"
        github_input.scrollIntoView()
        return
    }
    let githubUrl = ""
    switch (location){
        case GithubLocation.FORK:
            githubUrl = org + "/" + repo + "/fork"
            break;
        case GithubLocation.JSON:
            githubUrl = github.username + "/" + repo + "/edit/" + branch_name + "/config.json"
            break;
    }
    openUrlNewTab("https://github.com/"+githubUrl)
}
