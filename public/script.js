document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const checkBtn = document.getElementById('check-btn');
    const results = document.getElementById('results');
    const resultContent = document.getElementById('result-content');
    const loading = document.getElementById('loading');

    checkBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to check.');
            return;
        }

        // Show loading
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        checkBtn.disabled = true;

        try {
            const response = await fetch('/check-plagiarism', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            });

            const data = await response.json();

            if (response.ok) {
                displayResults(data);
            } else {
                throw new Error(data.error || 'An error occurred');
            }
        } catch (error) {
            resultContent.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            results.classList.remove('hidden');
        } finally {
            loading.classList.add('hidden');
            checkBtn.disabled = false;
        }
    });

    function displayResults(data) {
        let html = '';

        if (data.plagiarism_percentage !== undefined) {
            html += `<p><strong>Plagiarism Percentage:</strong> ${data.plagiarism_percentage}%</p>`;
        }

        if (data.sources && data.sources.length > 0) {
            html += '<h3>Sources:</h3><ul>';
            data.sources.forEach(source => {
                html += `<li><a href="${source.url}" target="_blank">${source.title}</a> (${source.similarity}% match)</li>`;
            });
            html += '</ul>';
        }

        if (data.details) {
            html += `<p><strong>Details:</strong> ${data.details}</p>`;
        }

        resultContent.innerHTML = html;
        results.classList.remove('hidden');
    }
});