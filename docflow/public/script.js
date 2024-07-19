//prevent redirect
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(document.getElementById('uploadForm'));

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log("SERVER: " + result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



