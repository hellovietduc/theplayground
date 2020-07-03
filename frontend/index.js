const runBtn = document.getElementById('run');
const langChooser = document.getElementById('lang');
const codeInput = document.getElementById('code');
const consoleOutput = document.getElementById('console');
const consoleStatus = document.getElementById('status');

const runCode = () => {
    const lang = langChooser.value.trim();
    const code = codeInput.value.trim();

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:3000/code/run/${lang}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function onStateChange() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            consoleOutput.innerText = this.responseText;
            consoleStatus.innerText = '\nProgram exited.';
        } else {
            consoleOutput.innerText = '';
            consoleStatus.innerText = this.responseText;
        }
    };

    xhr.send(`code=${code}`);
    consoleOutput.innerText = '';
    consoleStatus.innerText = 'Waiting for remote server...';
};

const getTemplate = lang => new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/template/${lang}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function onStateChange() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            resolve(this.responseText);
        }
    };

    xhr.send();
});

const onSelectLang = async () => {
    const curLang = langChooser.value.trim();
    const code = codeInput.value.trim();

    const prevLang = sessionStorage.getItem('prevLang');
    sessionStorage.setItem(`lastCode:${prevLang}`, code);

    let lastCode = sessionStorage.getItem(`lastCode:${curLang}`);
    if (!lastCode) {
        lastCode = await getTemplate(curLang);
    }
    codeInput.value = lastCode;
    sessionStorage.setItem('prevLang', curLang);
};

window.onload = async () => {
    sessionStorage.clear();
    const lang = langChooser.value.trim();
    const template = await getTemplate(lang);
    if (template) {
        codeInput.value = template;
        sessionStorage.setItem('prevLang', lang);
    }
};

runBtn.addEventListener('click', runCode);
langChooser.addEventListener('change', onSelectLang);
