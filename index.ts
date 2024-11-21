// ==UserScript==
// @name         Auto Generate WordBook
// @namespace    https://monodev.cloud
// @version      2024-11-21
// @description  nnn.ed.nico
// @author       mono0218
// @connect      www.nnn.ed.nico
// @match        https://www.nnn.ed.nico/courses/*/chapters/*/evaluation_report/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ed.nico
// @grant        none
// ==/UserScript==

interface QAContent {
    question: string;
    answer: string;
}

(function () {
    "use strict";
    window.addEventListener('load', () => {
        createButton().addEventListener('click', ()=>{
            startProcess()
        })
    })

})();

function createButton(){
    const element = document.getElementsByClassName('cmgDL')[0]
    const button = document.createElement('button');
    button.id = 'generate-button';
    button.textContent = 'Generate WordBook';
    element.parentNode!.insertBefore(button, element.nextSibling);

    return button
}

function startProcess(){
    const iframes = document.querySelectorAll("iframe");
    const testIframe = iframes[2];
    const testDocument = testIframe.contentDocument;

    if (!testDocument) {
        console.error("Test document not found");
        return
    }

    const QuestionLists = testDocument.getElementsByClassName("section-item question-list")
    if (QuestionLists.length !== 0) {
        const select = selectQuestions(QuestionLists[0].children)
        const write = writeQuestions(QuestionLists[1].children)

        if (!select || !write) return
        const allQuestion =select.concat(write)

        const csv = createCSV(allQuestion)
        downloadFile(csv)
    }
}

function selectQuestions(lists:HTMLCollection){
    const questions:Array<QAContent> = [];
    //問題一つのまとまり
    for (let i = 0; i < lists.length; i++) {
        //質問文
        let question = lists[i].getElementsByClassName("question")[0].children[0].textContent;
        //解答
        const answer = lists[i].getElementsByClassName("explanation section-item")[0].children[0].textContent;
        //選択肢
        const selections = lists[i].getElementsByClassName("answers-choice")

        if (!question || !answer) return
        for (let j = 0; j < selections.length; j++) {
            const answer = selections[j].children[1].textContent
            question += " "+answer;
        }

        questions.push({question, answer})
    }
    return questions;
}

function writeQuestions(lists:HTMLCollection){
    const questions:Array<QAContent> = [];

    for (let i = 0; i < lists.length; i++) {
        let question = "";
        let answer = "";
        //質問文
        const questionElements = lists[i].getElementsByClassName("question")
        //解答
        const answerElements = lists[i].getElementsByClassName("explanation section-item")

        //質問文と解答が複数要素あった時用
        for (let j = 0; j < questionElements[0].children.length; j++) {
            question += questionElements[0].children[j].textContent;
        }
        for (let j = 0; j < answerElements[0].children.length; j++) {
            answer += answerElements[0].children[j].textContent;
        }

        questions.push({question, answer})
    }
    return questions;
}

function createCSV(qa:Array<QAContent>){
    let csv = "FrontText,BackText,Comment,FrontTextLanguage,BackTextLanguage\n";
    for (let i = 0; i < qa.length; i++) {
        csv += qa[i].question + "," + qa[i].answer + ","+ ""+ ","+ ""+ ","+ ""+ "\n";
    }
    return csv;
}

function downloadFile(text:string){
    const blob = new Blob([text], {type: "text/csv"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${document.getElementsByTagName("title")[0].textContent}.csv`;
    link.click();
}
