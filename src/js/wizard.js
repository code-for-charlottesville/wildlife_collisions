import {validateEntries, formEntries} from "./config";

const org = "code-for-charlottesville"
const repo = "wildlife_collisions"
const branch_name = "form"

// don't change unless you're remaking the base form
const base_google_form_link = "https://docs.google.com/forms/d/1pk46eKwpl5gtdLhj9Z8N1rnbQZzuRIF8ycGPbNpbeOE/copy"

// objects

let json = {
    form_url: undefined,
    form_entries: undefined,
    output: undefined
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
    openUrlNewTab(base_google_form_link)
}

let prefilled_input = document.getElementById("prefilled-input")
prefilled_input.onchange = function (){validatePrefilledLink()}
let prefilled_input_warn = document.getElementById("prefilled-input-warn")

function validatePrefilledLink() {
    let inUrl = prefilled_input.value
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
        errors.push('No entries found. Make sure you "pasted" the prefilled link from the Copy Link button in the bottom left corner of the Google Form.')
    } else {
        while ((match = entryReg.exec(inUrl)) !== null) {
            entriesArray.push(match[0])
        }
        if (entriesArray.length > formEntries.length) {
            errors.push("Too many filled out questions! Make sure you are only filling out the required questions.")
        } else if(entriesArray.length < formEntries.length) {
            errors.push("You didn't fill out all the required questions. Try again, making sure that only questions with the red asterisks have been filled out.")
        } else {
            entriesArray.forEach((string, index) => {
                let entry = formEntries[index]
                let number = entryReg2.exec(string)[0] //extracts ids (012345) from the inputs: &entry.012345
                entries[entry] = Number(number)
            });
        }
        json.form_entries = entries
    }
    let warnings = ""
    errors.forEach((x) => warnings += x + '\n\n')
    prefilled_input_warn.innerText = warnings
    json.output = JSON.stringify(json).toString()
        .replace(/}}/, '\n}\n}')
        .replace(/\{/g, '\n{\n')
        .replace(/,/g, ',\n')
        .replace(/:/g, ': ')
    console.log(json.output)
}

// github

window.githubSignup = function() {
    openUrlNewTab("https://github.com/signup")
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
        github.username = undefined
    }
}

const GithubLocation = {
    INVALID: 0,
    FORK: 1,
    JSON: 2,
    SITE: 3,
}

window.githubUserFork = function() {
    goToGithub(GithubLocation.FORK)
}

window.githubEditConfig = function() {
    goToGithub(GithubLocation.JSON)
}

let copyWarning = document.getElementById("github-copy-warn")
let copySuccess = document.getElementById("github-copy-success")

window.githubCopyConfig = function () {
    if (json.output === undefined){
        copySuccess.style.display = "none"
        if(copyWarning.style.display === "none") {
            copyWarning.style.display = "block"
            return
        }
        prefilled_input.focus();
        prefilled_input.click()
        return;
    }
    (async () => {
        try {
            let data = json.output
            await navigator.clipboard.writeText(data); //requires a secure origin. Use localhost to test
            copyWarning.style.display = "none"
            copySuccess.style.display = "block"
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    })();
}

let siteSetup = false
let step9 = document.getElementById("step9")
let step9Error = document.getElementById("step9-error")

window.githubGotoSite = function (){
    goToGithub(GithubLocation.SITE)
}

function goToGithub(location /* of type GithubLocation*/){
    if(github.username === undefined){
        github_warn.innerText = "Please enter your github username first"
        github_input.focus()
        github_input.click()
        if(siteSetup) {
            siteSetup = false
            step9.style.display = "none"
            step9Error.style.display = "block"
        }
        return
    }
    let githubUrl = ""
    switch (location){
        case GithubLocation.FORK:
            githubUrl = org + "/" + repo + "/fork"
            break;
        case GithubLocation.JSON:
            githubCopyConfig()
            if (json.output === undefined){
                return;
            }
            githubUrl = github.username + "/" + repo + "/edit/" + branch_name + "/config.json"
            setTimeout(function () {
                step9.style.display = "block"
                step9Error.style.display = "none"
                siteSetup = true
            }, 1000)
            break;
        case GithubLocation.SITE:
            let url = "https://" + github.username + ".github.io/" + repo + "/index.html"
            openUrlNewTab(url)
            return;
            //break;
    }
    openUrlNewTab("https://github.com/"+githubUrl)
}
