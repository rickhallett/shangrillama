# Specification Template
> Ingest the information from this file, implement the Low-Level Tasks, and generate the code that will satisfy the High and Mid-Level Objectives.

## High-Level Objective

- [High level goal goes here - what do you want to build?]

Create a new "dev mode" that allows me to run through a set number of question rounds across all styles and store the the response history in a "raw-data.json" file. This data can be read back in, with each question data read as a "row" for encoding within a vector database via api call to ragie.

## Mid-Level Objective

- [List of mid-level objectives - what are the steps to achieve the high-level objective?]
- [Each objective should be concrete and measurable]
- [But not too detailed - save details for implementation notes]

- Create a "dev mode" component that renders on presence of a "shangri-dev-mode" localStorage item (bool)
- Dev mode sets the userDetails to a new object with the following properties:
  - name: "Kai"
  - email: "kai@oceanheart.ai"
  - tel: "07375862225"
- Dev mode skips the form step and goes straight to the quiz
- Dev mode runs through a set number of question rounds across all styles and stores the response history in a "raw-data.json" file. The json file is appended to with each question round, so that all data is retained no matter how many times the quiz is run or how many rounds are completed or if there are any errors that halt program execution.


## Implementation Notes
- [Important technical details - what are the important technical details?]
- [Dependencies and requirements - what are the dependencies and requirements?]
- [Coding standards to follow - what are the coding standards to follow?]
- [Other technical guidance - what are other technical guidance?]

## Context

### Beginning context
- [List of files that exist at start - what files exist at start?]
- `services/api.js`
- `components/Quiz.js`
- `components/Question.js`
- `components/Answer.js`
- `components/Result.js`

### Ending context  
- [List of files that will exist at end - what files will exist at end?]
- `services/api.js`
- `components/DevMode.js`
- `components/Quiz.js`
- `components/Question.js`
- `components/Answer.js`
- `components/Result.js`
- `raw-data.json`

## Low-Level Tasks
> Ordered from start to finish

1. [First task - create DevMode component that renders on presence of a "shangri-dev-mode" localStorage item (bool) and presents a number input field to the user to set the number of question rounds to run, and a button to start the quiz. The field input should be checked against Number.parseInt as truthy or the field is invalidated. Default number of questions set to 3. Submit requires a valid field.]
```aider
What prompt would you run to complete this task?
What file do you want to CREATE or UPDATE?
What function do you want to CREATE or UPDATE?
What are details you want to add to drive the code changes?
```
2. [Second task - When in dev-mode, the question answer submit handler should not submit the data to the server but instead add the question and answer to the `raw-data.json` file via the new `storeRawData` function. There should be no server call and no response from the server.]
```aider
What prompt would you run to complete this task?
What file do you want to CREATE or UPDATE?
What function do you want to CREATE or UPDATE?
What are details you want to add to drive the code changes?
```
3. [Third task - extend `services/api.js` to include a new function `storeRawData` that will take the `raw-data.json` file and encode the data using the ragie api and, if not already present, store the api response in a new `vectorise-me-encoded.json` file (this will contain the id of the embedded data object). If the user name is not present in the api response, add it as a property to the object in the `vectorise-me.json` file, before writing to the file]
```aider
What prompt would you run to complete this task?
What file do you want to CREATE or UPDATE?
What function do you want to CREATE or UPDATE?
What are details you want to add to drive the code changes?
```
4. [Fourth task - add a button to the `DevMode` component that will trigger the `submitRawData` function to be called. Prior to calling the function, check that the `raw-data.json` file exists and has data in it. If not, display a message to the user to run the quiz first. If data is present, import the `raw-data.json` file, parse into a POJO and parse to the `encodeAndStoreData` function as an array of objects. The `encodeAndStoreData` function returns a boolean. If the function returns true, display a message to the user that the data has been submitted. If the function returns false, display a message to the user that the data was not submitted. On success, delete the within the `raw-data.json` file and append all row objects to the new `vectorised-data.json` file]
```aider
What prompt would you run to complete this task?
What file do you want to CREATE or UPDATE?
What function do you want to CREATE or UPDATE?
What are details you want to add to drive the code changes?
```
5. [Fifth task - extend `services/api.js` to include a new function `encodeAndStoreData` that will take the `raw-data.json` file and encode the data using the ragie api and, if not already present, store the api response in a new `vectorise-me-encoded.json` file (this will contain the id of the embedded data object). If the user name is not present in the api response, add it as a property to the object in the `vectorise-me.json` file, before writing to the file]
```aider
What prompt would you run to complete this task?
What file do you want to CREATE or UPDATE?
What function do you want to CREATE or UPDATE?
What are details you want to add to drive the code changes?
```


Please add any implementation details that you think are missing.