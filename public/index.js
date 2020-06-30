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

runBtn.addEventListener('click', runCode);
